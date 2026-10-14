<script setup>
import { ref, onMounted } from 'vue'
import { exportBackup, readBackupFile, restoreBackup } from '@/composables/useBackup'
import { useCompanyStore } from '@/stores/company'
import { useClientsStore } from '@/stores/clients'
import { useCatalogStore } from '@/stores/catalog'
import { useQuotesStore } from '@/stores/quotes'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
const stores = [useCompanyStore(), useClientsStore(), useCatalogStore(), useQuotesStore()]
const [, clients, catalog, quotes] = stores

const fileInput = ref(null)
const busy = ref(false)
const usage = ref('')
const persisted = ref(null)

onMounted(async () => {
  try {
    const est = await navigator.storage?.estimate?.()
    if (est?.usage != null) usage.value = `${(est.usage / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
    persisted.value = (await navigator.storage?.persisted?.()) ?? null
  } catch {
    /* sem suporte */
  }
})

async function onExport() {
  try {
    const counts = await exportBackup()
    ui.toast(`Backup gerado: ${counts.quotes} orçamentos, ${counts.clients} clientes, ${counts.catalog} itens.`)
  } catch (err) {
    console.error(err)
    ui.toast('Não foi possível gerar o backup.', 'danger')
  }
}

async function onImport(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  busy.value = true
  try {
    const backup = await readBackupFile(file)
    const when = backup.exportedAt ? new Date(backup.exportedAt).toLocaleString('pt-BR') : 'data desconhecida'
    const ok = await ui.confirm({
      title: 'Restaurar backup?',
      message:
        `Backup de ${when}\n${backup.counts.quotes} orçamentos, ${backup.counts.clients} clientes, ${backup.counts.catalog} itens.\n\n` +
        'ATENÇÃO: todos os dados atuais deste aparelho serão substituídos pelos do backup.',
      okText: 'Substituir dados',
      danger: true
    })
    if (!ok) return
    await restoreBackup(backup.data)
    await Promise.all(stores.map((s) => s.load()))
    ui.toast('Backup restaurado com sucesso.')
  } catch (err) {
    console.error(err)
    ui.toast(err.message || 'Não foi possível importar o backup.', 'danger', 7000)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section>
    <h1 class="page-title mb-3">Backup</h1>

    <div class="alert alert-warning d-flex gap-2">
      <i class="bi bi-exclamation-triangle-fill fs-5"></i>
      <div>
        <strong>Seus dados ficam somente neste aparelho.</strong>
        Não existe cópia na nuvem. Se você limpar os dados do navegador, desinstalar o app, perder ou trocar o
        celular, tudo será perdido. Exporte um backup com frequência e guarde o arquivo em local seguro (e-mail,
        Google Drive, computador).
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <h2 class="h6 fw-bold"><i class="bi bi-download text-primary"></i> Exportar</h2>
            <p class="small text-secondary flex-grow-1">
              Baixa um arquivo .json com empresa, clientes, catálogo e orçamentos
              ({{ quotes.items.length }} orçamentos, {{ clients.items.length }} clientes, {{ catalog.items.length }} itens).
            </p>
            <button type="button" class="btn btn-primary" @click="onExport"><i class="bi bi-download"></i> Exportar backup</button>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <h2 class="h6 fw-bold"><i class="bi bi-upload text-primary"></i> Importar</h2>
            <p class="small text-secondary flex-grow-1">
              Restaura um backup exportado anteriormente. Os dados atuais deste aparelho serão substituídos.
            </p>
            <button type="button" class="btn btn-outline-primary" :disabled="busy" @click="fileInput.click()">
              <span v-if="busy" class="spinner-border spinner-border-sm"></span>
              <i v-else class="bi bi-upload"></i> Importar backup
            </button>
            <input ref="fileInput" type="file" accept="application/json,.json" class="d-none" @change="onImport" />
          </div>
        </div>
      </div>
    </div>

    <p v-if="usage || persisted !== null" class="small text-secondary mt-3">
      <span v-if="usage">Espaço usado pelo app: {{ usage }}. </span>
      <span v-if="persisted === true">Armazenamento protegido contra limpeza automática.</span>
      <span v-else-if="persisted === false">O navegador pode apagar os dados se faltar espaço; instale o app na tela inicial e faça backups.</span>
    </p>
  </section>
</template>
