<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import { useCatalogStore } from '@/stores/catalog'
import { formatMoney } from '@/utils/format'

/** Lista do catálogo para adicionar itens ao orçamento (permite vários seguidos). */
const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'pick'])

const catalog = useCatalogStore()
const term = ref('')
const kind = ref('')
const added = ref({})

const results = computed(() => catalog.search(term.value, kind.value))

watch(
  () => props.show,
  (open) => {
    if (open) {
      term.value = ''
      added.value = {}
    }
  }
)

function pick(item) {
  emit('pick', item)
  added.value[item.id] = (added.value[item.id] || 0) + 1
}
</script>

<template>
  <BaseModal :show="show" title="Adicionar do catálogo" fullscreen-mobile @close="emit('close')">
    <div class="input-group mb-2">
      <span class="input-group-text"><i class="bi bi-search"></i></span>
      <input v-model="term" type="search" class="form-control" placeholder="Buscar produto ou serviço" aria-label="Buscar" />
    </div>
    <div class="status-filter mb-3">
      <button type="button" class="btn btn-sm" :class="kind === '' ? 'btn-primary' : 'btn-outline-secondary'" @click="kind = ''">Todos</button>
      <button type="button" class="btn btn-sm" :class="kind === 'servico' ? 'btn-primary' : 'btn-outline-secondary'" @click="kind = 'servico'">Serviços</button>
      <button type="button" class="btn btn-sm" :class="kind === 'produto' ? 'btn-primary' : 'btn-outline-secondary'" @click="kind = 'produto'">Produtos</button>
    </div>

    <div v-if="!catalog.items.length" class="text-center text-secondary py-4">
      <p>Seu catálogo está vazio.</p>
      <RouterLink to="/catalogo" class="btn btn-outline-primary btn-sm" @click="emit('close')">Cadastrar itens no catálogo</RouterLink>
    </div>
    <div v-else-if="!results.length" class="text-center text-secondary py-4">Nenhum item encontrado.</div>

    <div class="list-group">
      <button
        v-for="it in results"
        :key="it.id"
        type="button"
        class="list-group-item list-group-item-action d-flex align-items-center gap-2"
        @click="pick(it)"
      >
        <i class="bi text-secondary" :class="it.kind === 'produto' ? 'bi-box' : 'bi-tools'"></i>
        <div class="flex-grow-1 text-start">
          <div>{{ it.description }}</div>
          <div class="small text-secondary tabular">{{ formatMoney(it.price) }} / {{ it.unit }}</div>
        </div>
        <span v-if="added[it.id]" class="badge text-bg-success">+{{ added[it.id] }}</span>
        <i v-else class="bi bi-plus-circle text-primary fs-5"></i>
      </button>
    </div>
    <template #footer>
      <button type="button" class="btn btn-primary w-100" @click="emit('close')">Concluir</button>
    </template>
  </BaseModal>
</template>
