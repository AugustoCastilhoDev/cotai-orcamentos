<script setup>
import { ref, computed } from 'vue'
import ClientEditModal from './ClientEditModal.vue'
import { useClientsStore } from '@/stores/clients'

/**
 * Seleção de cliente na tela do orçamento.
 * v-model: cópia dos dados do cliente; clientId: id do cadastro.
 */
const client = defineModel({ type: Object, required: true })
const clientId = defineModel('clientId', { type: Number, default: null })
defineProps({ invalid: Boolean })

const clients = useClientsStore()
const term = ref('')
const focused = ref(false)
const showNew = ref(false)
const editing = ref(null)

const results = computed(() => clients.search(term.value).slice(0, 8))
const hasClient = computed(() => !!client.value?.name)

function pick(c) {
  client.value = { name: c.name, phone: c.phone, email: c.email, document: c.document, address: c.address }
  clientId.value = c.id
  term.value = ''
  focused.value = false
}

function clear() {
  client.value = { name: '', phone: '', email: '', document: '', address: '' }
  clientId.value = null
}

function openEdit() {
  editing.value = clientId.value ? clients.getById(clientId.value) || null : null
  showNew.value = true
}

function openNew() {
  editing.value = null
  showNew.value = true
}

function onBlur() {
  // Atraso para permitir o clique em um resultado
  setTimeout(() => (focused.value = false), 150)
}
</script>

<template>
  <div>
    <div v-if="hasClient" class="d-flex align-items-start gap-2 p-3 rounded border bg-body-tertiary">
      <i class="bi bi-person-circle fs-3 text-primary"></i>
      <div class="flex-grow-1 small">
        <div class="fw-semibold fs-6">{{ client.name }}</div>
        <div v-if="client.document" class="text-secondary">{{ client.document }}</div>
        <div v-if="client.phone || client.email" class="text-secondary">
          {{ [client.phone, client.email].filter(Boolean).join(' · ') }}
        </div>
        <div v-if="client.address" class="text-secondary">{{ client.address }}</div>
      </div>
      <div class="d-flex flex-column gap-1">
        <button v-if="clientId" type="button" class="btn btn-icon btn-soft" title="Editar cadastro" @click="openEdit">
          <i class="bi bi-pencil"></i>
        </button>
        <button type="button" class="btn btn-icon btn-soft" title="Trocar cliente" @click="clear">
          <i class="bi bi-arrow-left-right"></i>
        </button>
      </div>
    </div>

    <div v-else class="position-relative">
      <div class="input-group">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input
          v-model="term"
          type="search"
          class="form-control"
          :class="{ 'is-invalid': invalid }"
          placeholder="Buscar cliente cadastrado"
          autocomplete="off"
          aria-label="Buscar cliente"
          @focus="focused = true"
          @blur="onBlur"
        />
        <button type="button" class="btn btn-outline-primary" @click="openNew">
          <i class="bi bi-person-plus"></i><span class="d-none d-sm-inline"> Novo</span>
        </button>
      </div>
      <div v-if="invalid" class="small text-danger mt-1">Selecione ou cadastre um cliente.</div>

      <div v-if="focused" class="list-group position-absolute w-100 shadow z-3 mt-1">
        <button
          v-for="c in results"
          :key="c.id"
          type="button"
          class="list-group-item list-group-item-action"
          @mousedown.prevent="pick(c)"
        >
          <div class="fw-semibold">{{ c.name }}</div>
          <div class="small text-secondary">{{ [c.phone, c.document].filter(Boolean).join(' · ') }}</div>
        </button>
        <button type="button" class="list-group-item list-group-item-action text-primary" @mousedown.prevent="openNew">
          <i class="bi bi-person-plus"></i>
          {{ term ? `Cadastrar "${term}"` : 'Cadastrar novo cliente' }}
        </button>
      </div>
    </div>

    <ClientEditModal
      :show="showNew"
      :client="editing"
      :initial-name="term"
      @close="showNew = false"
      @saved="pick"
    />
  </div>
</template>
