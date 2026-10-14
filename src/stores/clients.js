import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, plain } from '@/db'
import { normalizeSearch } from '@/utils/search'

export const EMPTY_CLIENT = { name: '', phone: '', email: '', document: '', address: '' }

export const useClientsStore = defineStore('clients', () => {
  const items = ref([])

  const sorted = computed(() =>
    [...items.value].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }))
  )

  async function load() {
    items.value = await db.clients.toArray()
  }

  function getById(id) {
    return items.value.find((c) => c.id === Number(id))
  }

  function search(term) {
    const q = normalizeSearch(term)
    if (!q) return sorted.value
    const digits = q.replace(/\D/g, '')
    return sorted.value.filter((c) => {
      const text = normalizeSearch(`${c.name} ${c.email} ${c.address}`)
      if (text.includes(q)) return true
      if (digits.length >= 3) {
        return `${c.phone}${c.document}`.replace(/\D/g, '').includes(digits)
      }
      return false
    })
  }

  async function save(client) {
    const now = new Date().toISOString()
    const record = plain({ ...EMPTY_CLIENT, ...client, name: client.name.trim(), updatedAt: now })
    if (!record.id) {
      delete record.id
      record.createdAt = now
    }
    const id = await db.clients.put(record)
    await load()
    return id
  }

  async function remove(id) {
    await db.clients.delete(Number(id))
    await load()
  }

  return { items, sorted, load, getById, search, save, remove }
})
