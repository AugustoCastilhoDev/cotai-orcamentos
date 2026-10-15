<script setup>
import { ref, computed } from 'vue'
import CatalogEditModal from '@/components/CatalogEditModal.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useCatalogStore } from '@/stores/catalog'
import { useUiStore } from '@/stores/ui'
import { formatMoney } from '@/utils/format'

const catalog = useCatalogStore()
const ui = useUiStore()

const term = ref('')
const kind = ref('')
const showModal = ref(false)
const editing = ref(null)
const results = computed(() => catalog.search(term.value, kind.value))

function openNew() {
  editing.value = null
  showModal.value = true
}

function openEdit(it) {
  editing.value = it
  showModal.value = true
}

async function remove(it) {
  const ok = await ui.confirm({
    title: 'Excluir item?',
    message: `"${it.description}" será removido do catálogo. Orçamentos já feitos não mudam.`,
    okText: 'Excluir',
    danger: true
  })
  if (!ok) return
  await catalog.remove(it.id)
  ui.toast('Item excluído.')
}
</script>

<template>
  <section>
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h1 class="page-title">Catálogo</h1>
        <p class="small text-secondary mb-0">Produtos e serviços para montar orçamentos mais rápido.</p>
      </div>
      <button type="button" class="btn btn-primary" @click="openNew"><i class="bi bi-plus-lg"></i> Novo</button>
    </div>

    <template v-if="catalog.items.length">
      <div class="input-group mb-2">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input v-model="term" type="search" class="form-control" placeholder="Buscar item" aria-label="Buscar item" />
      </div>
      <div class="status-filter mb-3">
        <button type="button" class="btn btn-sm" :class="kind === '' ? 'btn-primary' : 'btn-outline-secondary'" @click="kind = ''">Todos</button>
        <button type="button" class="btn btn-sm" :class="kind === 'servico' ? 'btn-primary' : 'btn-outline-secondary'" @click="kind = 'servico'">Serviços</button>
        <button type="button" class="btn btn-sm" :class="kind === 'produto' ? 'btn-primary' : 'btn-outline-secondary'" @click="kind = 'produto'">Produtos</button>
      </div>

      <div class="card">
        <ul class="list-group list-group-flush">
          <li v-for="it in results" :key="it.id" class="list-group-item d-flex align-items-center gap-3 py-3">
            <i class="bi fs-5 text-secondary" :class="it.kind === 'produto' ? 'bi-box' : 'bi-tools'"></i>
            <div class="flex-grow-1 min-w-0" role="button" @click="openEdit(it)">
              <div class="fw-semibold">{{ it.description }}</div>
              <div class="small text-secondary tabular">{{ formatMoney(it.price) }} / {{ it.unit }}</div>
            </div>
            <div class="d-flex gap-1">
              <button type="button" class="btn btn-icon btn-soft" title="Editar" @click="openEdit(it)"><i class="bi bi-pencil"></i></button>
              <button type="button" class="btn btn-icon btn-soft text-danger" title="Excluir" @click="remove(it)"><i class="bi bi-trash"></i></button>
            </div>
          </li>
          <li v-if="!results.length" class="list-group-item text-center text-secondary py-4">Nenhum item encontrado.</li>
        </ul>
      </div>
    </template>

    <EmptyState v-else icon="bi-box-seam" title="Catálogo vazio" text="Cadastre os produtos e serviços que você mais vende.">
      <button type="button" class="btn btn-primary" @click="openNew"><i class="bi bi-plus-lg"></i> Cadastrar item</button>
    </EmptyState>

    <CatalogEditModal :show="showModal" :item="editing" @close="showModal = false" />
  </section>
</template>
