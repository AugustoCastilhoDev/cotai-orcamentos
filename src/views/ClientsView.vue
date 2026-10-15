<script setup>
import { ref, computed } from 'vue'
import ClientEditModal from '@/components/ClientEditModal.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useClientsStore } from '@/stores/clients'
import { useQuotesStore } from '@/stores/quotes'
import { useUiStore } from '@/stores/ui'

const clients = useClientsStore()
const quotes = useQuotesStore()
const ui = useUiStore()

const term = ref('')
const showModal = ref(false)
const editing = ref(null)
const results = computed(() => clients.search(term.value))

function quoteCount(id) {
  return quotes.items.filter((q) => q.clientId === id).length
}

function openNew() {
  editing.value = null
  showModal.value = true
}

function openEdit(c) {
  editing.value = c
  showModal.value = true
}

async function remove(c) {
  const n = quoteCount(c.id)
  const ok = await ui.confirm({
    title: 'Excluir cliente?',
    message: `"${c.name}" será removido do cadastro.${n ? `\nOs ${n} orçamento(s) dele continuam salvos.` : ''}`,
    okText: 'Excluir',
    danger: true
  })
  if (!ok) return
  await clients.remove(c.id)
  ui.toast('Cliente excluído.')
}
</script>

<template>
  <section>
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="page-title">Clientes</h1>
      <button type="button" class="btn btn-primary" @click="openNew"><i class="bi bi-person-plus"></i> Novo</button>
    </div>

    <template v-if="clients.items.length">
      <div class="input-group mb-3">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input v-model="term" type="search" class="form-control" placeholder="Buscar por nome, telefone, documento..." aria-label="Buscar cliente" />
      </div>

      <div class="card">
        <ul class="list-group list-group-flush">
          <li v-for="c in results" :key="c.id" class="list-group-item d-flex align-items-center gap-3 py-3">
            <div class="flex-grow-1 min-w-0" role="button" @click="openEdit(c)">
              <div class="fw-semibold text-truncate">{{ c.name }}</div>
              <div class="small text-secondary text-truncate">
                {{ [c.phone, c.email, c.document].filter(Boolean).join(' · ') || 'Sem contato' }}
              </div>
              <div v-if="quoteCount(c.id)" class="small text-primary">{{ quoteCount(c.id) }} orçamento(s)</div>
            </div>
            <div class="d-flex gap-1">
              <button type="button" class="btn btn-icon btn-soft" title="Editar" @click="openEdit(c)"><i class="bi bi-pencil"></i></button>
              <button type="button" class="btn btn-icon btn-soft text-danger" title="Excluir" @click="remove(c)"><i class="bi bi-trash"></i></button>
            </div>
          </li>
          <li v-if="!results.length" class="list-group-item text-center text-secondary py-4">Nenhum cliente encontrado.</li>
        </ul>
      </div>
    </template>

    <EmptyState v-else icon="bi-people" title="Nenhum cliente cadastrado" text="Cadastre aqui ou direto na tela do orçamento.">
      <button type="button" class="btn btn-primary" @click="openNew"><i class="bi bi-person-plus"></i> Cadastrar cliente</button>
    </EmptyState>

    <ClientEditModal :show="showModal" :client="editing" @close="showModal = false" />
  </section>
</template>
