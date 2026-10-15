<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import ClientPicker from '@/components/ClientPicker.vue'
import QuoteItemsEditor from '@/components/QuoteItemsEditor.vue'
import QuoteTotals from '@/components/QuoteTotals.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useQuotesStore, STATUSES } from '@/stores/quotes'
import { useUiStore } from '@/stores/ui'
import { useQuoteActions, preloadPdf } from '@/composables/useQuoteActions'
import { canShareFiles } from '@/composables/useShare'
import { calcTotals } from '@/utils/money'
import { formatMoney, formatDate, addDaysISO } from '@/utils/format'

const props = defineProps({ id: { type: String, default: null } })

const quotes = useQuotesStore()
const ui = useUiStore()
const router = useRouter()
const actions = useQuoteActions()

const quote = ref(null)
const snapshot = ref('')
const notFound = ref(false)
const nextNumber = ref('')
const saving = ref(false)
const busy = ref('')
const clientInvalid = ref(false)
const shareSupported = canShareFiles()

const isNew = computed(() => !quote.value?.id)
const dirty = computed(() => !!quote.value && JSON.stringify(quote.value) !== snapshot.value)
const totals = computed(() => (quote.value ? calcTotals(quote.value) : { total: 0 }))
const validUntil = computed(() => (quote.value ? addDaysISO(quote.value.date, quote.value.validityDays) : ''))

function setQuote(q) {
  quote.value = JSON.parse(JSON.stringify(q))
  snapshot.value = JSON.stringify(quote.value)
}

async function loadQuote() {
  notFound.value = false
  clientInvalid.value = false
  if (props.id) {
    const found = quotes.getById(props.id)
    if (!found) {
      notFound.value = true
      quote.value = null
      return
    }
    setQuote(found)
  } else {
    setQuote(quotes.blank())
    nextNumber.value = await quotes.peekNextNumber()
  }
}

watch(() => props.id, loadQuote, { immediate: true })

onMounted(() => {
  preloadPdf()
  window.addEventListener('beforeunload', onBeforeUnload)
})
onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))

function onBeforeUnload(e) {
  if (dirty.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onBeforeRouteLeave(async () => {
  if (!dirty.value) return true
  return ui.confirm({
    title: 'Sair sem salvar?',
    message: 'Há alterações neste orçamento que ainda não foram salvas.',
    okText: 'Sair sem salvar',
    cancelText: 'Continuar editando',
    danger: true
  })
})

function validate() {
  clientInvalid.value = !quote.value.client?.name?.trim()
  if (clientInvalid.value) {
    ui.toast('Informe o cliente do orçamento.', 'danger')
    document.getElementById('sec-cliente')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return false
  }
  const emptyIdx = quote.value.items.findIndex((it) => !String(it.description).trim())
  if (emptyIdx >= 0) {
    ui.toast(`O item ${emptyIdx + 1} está sem descrição.`, 'danger')
    return false
  }
  return true
}

/** Salva e devolve o orçamento salvo (ou null se inválido). */
async function save({ silent = false } = {}) {
  if (!validate()) return null
  saving.value = true
  try {
    const wasNew = isNew.value
    const saved = await quotes.save(quote.value)
    setQuote(saved)
    if (!silent) ui.toast(wasNew ? `Orçamento nº ${saved.number} criado.` : 'Orçamento salvo.')
    if (wasNew) await router.replace(`/orcamentos/${saved.id}`)
    return saved
  } catch (err) {
    console.error(err)
    ui.toast('Não foi possível salvar o orçamento.', 'danger')
    return null
  } finally {
    saving.value = false
  }
}

async function ensureSaved() {
  if (!isNew.value && !dirty.value) return quote.value
  return save({ silent: true })
}

async function markSent() {
  if (quote.value.status !== 'rascunho') return
  quote.value.status = 'enviado'
  await save({ silent: true })
  ui.toast('Status alterado para "Enviado".', 'info')
}

async function run(name, fn) {
  if (busy.value) return
  busy.value = name
  try {
    await fn()
  } finally {
    busy.value = ''
  }
}

const onPdf = () =>
  run('pdf', async () => {
    const q = await ensureSaved()
    if (q) await actions.downloadPdf(q)
  })

const onShare = () =>
  run('share', async () => {
    const q = await ensureSaved()
    if (!q) return
    const result = await actions.sharePdfFile(q)
    if (result === 'shared') await markSent()
  })

const onWhatsapp = () =>
  run('whatsapp', async () => {
    const q = await ensureSaved()
    if (!q) return
    actions.openWhatsapp(q)
    await markSent()
  })

const onDuplicate = () =>
  run('duplicate', async () => {
    const q = await ensureSaved()
    if (!q) return
    const copy = await quotes.duplicate(q.id)
    ui.toast(`Cópia criada: nº ${copy.number}.`)
    router.push(`/orcamentos/${copy.id}`)
  })

async function onDelete() {
  const ok = await ui.confirm({
    title: 'Excluir orçamento?',
    message: `O orçamento nº ${quote.value.number} será excluído permanentemente deste aparelho.`,
    okText: 'Excluir',
    danger: true
  })
  if (!ok) return
  await quotes.remove(quote.value.id)
  snapshot.value = JSON.stringify(quote.value) // evita o aviso de "sair sem salvar"
  ui.toast('Orçamento excluído.')
  router.push('/')
}
</script>

<template>
  <EmptyState v-if="notFound" icon="bi-file-earmark-x" title="Orçamento não encontrado" text="Ele pode ter sido excluído.">
    <RouterLink to="/" class="btn btn-primary">Ver orçamentos</RouterLink>
  </EmptyState>

  <section v-else-if="quote">
    <div class="d-flex align-items-center gap-2 mb-3">
      <RouterLink to="/" class="btn btn-light btn-sm" aria-label="Voltar"><i class="bi bi-arrow-left"></i></RouterLink>
      <div class="flex-grow-1">
        <h1 class="page-title">
          <template v-if="isNew">Novo orçamento</template>
          <template v-else>Orçamento <span class="text-nowrap">{{ quote.number }}</span></template>
        </h1>
        <div v-if="isNew" class="small text-secondary">Número previsto: {{ nextNumber }}</div>
      </div>
      <StatusBadge :status="quote.status" />
    </div>

    <form novalidate @submit.prevent="save()">
      <!-- Dados gerais -->
      <div class="card mb-3">
        <div class="card-body">
          <div class="section-title">Dados do orçamento</div>
          <div class="row g-3">
            <div class="col-6 col-md-3">
              <label class="form-label" for="q-date">Data</label>
              <input id="q-date" v-model="quote.date" type="date" class="form-control" required />
            </div>
            <div class="col-6 col-md-3">
              <label class="form-label" for="q-validity">Validade (dias)</label>
              <input id="q-validity" v-model.number="quote.validityDays" type="number" min="1" max="365" inputmode="numeric" class="form-control" />
              <div class="form-text">até {{ formatDate(validUntil) }}</div>
            </div>
            <div class="col-6 col-md-3">
              <label class="form-label" for="q-status">Status</label>
              <select id="q-status" v-model="quote.status" class="form-select">
                <option v-for="(s, key) in STATUSES" :key="key" :value="key">{{ s.label }}</option>
              </select>
            </div>
            <div class="col-6 col-md-3">
              <label class="form-label" for="q-delivery">Prazo de entrega</label>
              <input id="q-delivery" v-model="quote.deliveryTime" class="form-control" maxlength="80" placeholder="Ex.: 5 dias úteis" />
            </div>
          </div>
        </div>
      </div>

      <!-- Cliente -->
      <div id="sec-cliente" class="card mb-3">
        <div class="card-body">
          <div class="section-title">Cliente</div>
          <ClientPicker v-model="quote.client" v-model:client-id="quote.clientId" :invalid="clientInvalid" @update:model-value="clientInvalid = false" />
        </div>
      </div>

      <!-- Itens -->
      <div class="card mb-3">
        <div class="card-body">
          <div class="section-title">Itens</div>
          <QuoteItemsEditor v-model="quote.items" />
        </div>
      </div>

      <!-- Totais -->
      <div class="card mb-3">
        <div class="card-body">
          <div class="section-title">Totais</div>
          <QuoteTotals v-model="quote" />
        </div>
      </div>

      <!-- Condições -->
      <div class="card mb-3">
        <div class="card-body">
          <div class="section-title">Condições e observações</div>
          <div class="mb-3">
            <label class="form-label" for="q-terms">Condições de pagamento</label>
            <textarea id="q-terms" v-model="quote.paymentTerms" class="form-control" rows="3" maxlength="1000"></textarea>
          </div>
          <div>
            <label class="form-label" for="q-notes">Observações</label>
            <textarea id="q-notes" v-model="quote.notes" class="form-control" rows="3" maxlength="2000" placeholder="Garantia, materiais inclusos, etc."></textarea>
          </div>
        </div>
      </div>

      <!-- Enviar -->
      <div class="card mb-3">
        <div class="card-body">
          <div class="section-title">Enviar para o cliente</div>
          <div class="row g-2">
            <div v-if="shareSupported" class="col-12 col-md-4">
              <button type="button" class="btn btn-primary w-100" :disabled="!!busy" @click="onShare">
                <span v-if="busy === 'share'" class="spinner-border spinner-border-sm"></span>
                <i v-else class="bi bi-share"></i> Compartilhar PDF
              </button>
            </div>
            <div class="col-6 col-md-4">
              <button type="button" class="btn btn-success w-100" :disabled="!!busy" @click="onWhatsapp">
                <i class="bi bi-whatsapp"></i> WhatsApp
              </button>
            </div>
            <div class="col-6 col-md-4">
              <button type="button" class="btn btn-outline-primary w-100" :disabled="!!busy" @click="onPdf">
                <span v-if="busy === 'pdf'" class="spinner-border spinner-border-sm"></span>
                <i v-else class="bi bi-download"></i> Baixar PDF
              </button>
            </div>
          </div>
          <p class="small text-secondary mt-2 mb-0">
            O botão do WhatsApp envia um resumo em texto. Para mandar o PDF, use "Compartilhar PDF" no celular ou
            baixe o arquivo e anexe na conversa.
          </p>
          <hr v-if="!isNew" />
          <div v-if="!isNew" class="d-flex gap-2">
            <button type="button" class="btn btn-link text-secondary px-0" :disabled="!!busy" @click="onDuplicate">
              <i class="bi bi-copy"></i> Duplicar
            </button>
            <button type="button" class="btn btn-link text-danger px-0 ms-auto" @click="onDelete">
              <i class="bi bi-trash"></i> Excluir
            </button>
          </div>
        </div>
      </div>

      <div class="sticky-actions d-flex align-items-center gap-3">
        <div class="flex-grow-1">
          <div class="small text-secondary lh-1">Total</div>
          <div class="money sticky-total"><span class="marker">{{ formatMoney(totals.total) }}</span></div>
        </div>
        <span v-if="dirty" class="small text-warning-emphasis d-none d-sm-inline">Alterações não salvas</span>
        <button type="submit" class="btn btn-primary px-4" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm"></span>
          <i v-else class="bi bi-check2"></i> Salvar
        </button>
      </div>
    </form>
  </section>
</template>
