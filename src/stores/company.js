import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, plain } from '@/db'

export const DEFAULT_COMPANY = {
  name: '',
  document: '',
  phone: '',
  email: '',
  address: '',
  logo: '',
  color: '#0f52ba',
  paymentTerms: 'Pagamento via Pix, transferência ou cartão. 50% na aprovação e 50% na entrega.',
  validityDays: 15
}

export const useCompanyStore = defineStore('company', () => {
  const data = ref({ ...DEFAULT_COMPANY })
  const loaded = ref(false)

  const isConfigured = computed(() => !!data.value.name.trim())

  async function load() {
    const rec = await db.settings.get('company')
    data.value = { ...DEFAULT_COMPANY, ...(rec?.value || {}) }
    loaded.value = true
  }

  async function save(values) {
    data.value = { ...DEFAULT_COMPANY, ...values }
    await db.settings.put({ key: 'company', value: plain(data.value) })
  }

  return { data, loaded, isConfigured, load, save }
})
