import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, plain } from '@/db'
import { normalizeSearch } from '@/utils/search'

export const EMPTY_CATALOG_ITEM = { kind: 'servico', description: '', unit: 'un', price: 0 }

export const UNITS = ['un', 'h', 'dia', 'mês', 'serviço', 'm', 'm²', 'm³', 'kg', 'l', 'cx', 'pç', 'kit', 'pacote']

export const useCatalogStore = defineStore('catalog', () => {
  const items = ref([])

  const sorted = computed(() =>
    [...items.value].sort((a, b) => a.description.localeCompare(b.description, 'pt-BR', { sensitivity: 'base' }))
  )

  async function load() {
    items.value = await db.catalog.toArray()
  }

  function search(term, kind = '') {
    const q = normalizeSearch(term)
    return sorted.value.filter(
      (it) => (!kind || it.kind === kind) && (!q || normalizeSearch(it.description).includes(q))
    )
  }

  async function save(item) {
    const record = plain({ ...EMPTY_CATALOG_ITEM, ...item, description: item.description.trim() })
    if (!record.id) delete record.id
    const id = await db.catalog.put(record)
    await load()
    return id
  }

  async function remove(id) {
    await db.catalog.delete(Number(id))
    await load()
  }

  return { items, sorted, load, search, save, remove }
})
