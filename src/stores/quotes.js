import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, plain } from '@/db'
import { calcTotals } from '@/utils/money'
import { todayISO } from '@/utils/format'
import { useCompanyStore } from './company'

export const STATUSES = {
  rascunho: { label: 'Rascunho', color: 'secondary', icon: 'bi-pencil' },
  enviado: { label: 'Enviado', color: 'primary', icon: 'bi-send' },
  aprovado: { label: 'Aprovado', color: 'success', icon: 'bi-check-circle' },
  recusado: { label: 'Recusado', color: 'danger', icon: 'bi-x-circle' }
}

let uidCounter = 0
export function newItemUid() {
  uidCounter += 1
  return `${Date.now().toString(36)}-${uidCounter}`
}

export function formatQuoteNumber(year, seq) {
  return `${year}-${String(seq).padStart(4, '0')}`
}

export const useQuotesStore = defineStore('quotes', () => {
  const items = ref([])

  const sorted = computed(() =>
    [...items.value].sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.number || '').localeCompare(a.number || ''))
  )

  async function load() {
    items.value = await db.quotes.toArray()
  }

  function getById(id) {
    return items.value.find((q) => q.id === Number(id))
  }

  /** Orçamento novo, preenchido com os padrões da empresa. */
  function blank() {
    const company = useCompanyStore().data
    return {
      id: null,
      number: '',
      status: 'rascunho',
      date: todayISO(),
      validityDays: Number(company.validityDays) || 15,
      deliveryTime: '',
      paymentTerms: company.paymentTerms || '',
      notes: '',
      clientId: null,
      client: { name: '', phone: '', email: '', document: '', address: '' },
      items: [],
      discountType: 'value',
      discountValue: 0,
      extra: 0,
      extraLabel: 'Frete'
    }
  }

  /** Próximo número do ano (apenas para exibição; o definitivo é reservado ao salvar). */
  async function peekNextNumber(year = todayISO().slice(0, 4)) {
    const rec = await db.settings.get(`counter-${year}`)
    return formatQuoteNumber(year, (rec?.value || 0) + 1)
  }

  async function save(quote) {
    const now = new Date().toISOString()
    const record = plain(quote)
    record.total = calcTotals(record).total
    record.updatedAt = now

    await db.transaction('rw', db.settings, db.quotes, async () => {
      if (!record.id) {
        delete record.id
        record.createdAt = now
        const year = (record.date || todayISO()).slice(0, 4)
        const key = `counter-${year}`
        let seq = ((await db.settings.get(key))?.value || 0) + 1
        // Evita colisão com números vindos de um backup importado
        while (await db.quotes.where('number').equals(formatQuoteNumber(year, seq)).count()) seq += 1
        await db.settings.put({ key, value: seq })
        record.number = formatQuoteNumber(year, seq)
      }
      record.id = await db.quotes.put(record)
    })
    await load()
    return record
  }

  async function setStatus(id, status) {
    await db.quotes.update(Number(id), { status, updatedAt: new Date().toISOString() })
    await load()
  }

  async function duplicate(id) {
    const original = getById(id)
    if (!original) throw new Error('Orçamento não encontrado')
    const copy = plain(original)
    delete copy.id
    delete copy.number
    delete copy.createdAt
    copy.status = 'rascunho'
    copy.date = todayISO()
    copy.items = copy.items.map((it) => ({ ...it, uid: newItemUid() }))
    return save(copy)
  }

  async function remove(id) {
    await db.quotes.delete(Number(id))
    await load()
  }

  return { items, sorted, load, getById, blank, peekNextNumber, save, setStatus, duplicate, remove }
})
