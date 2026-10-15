<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import config from '@/config'
import StatusBadge from '@/components/StatusBadge.vue'
import EmptyState from '@/components/EmptyState.vue'
import InstallBanner from '@/components/InstallBanner.vue'
import { useQuotesStore, STATUSES } from '@/stores/quotes'
import { useCompanyStore } from '@/stores/company'
import { useUiStore } from '@/stores/ui'
import { useQuoteActions } from '@/composables/useQuoteActions'
import { formatMoney, formatDate, todayISO, addDaysISO } from '@/utils/format'
import { normalizeSearch } from '@/utils/search'

const quotes = useQuotesStore()
const company = useCompanyStore()
const ui = useUiStore()
const router = useRouter()
const { downloadPdf } = useQuoteActions()

const FILTER_KEY = 'cotai:quote-filters'
function loadFilters() {
  try {
    return JSON.parse(sessionStorage.getItem(FILTER_KEY)) || {}
  } catch {
    return {}
  }
}
const saved = loadFilters()
const term = ref(saved.term || '')
const status = ref(saved.status || '')
const period = ref(saved.period || 'all')
const from = ref(saved.from || '')
const to = ref(saved.to || '')

watch([term, status, period, from, to], () => {
  try {
    sessionStorage.setItem(FILTER_KEY, JSON.stringify({ term: term.value, status: status.value, period: period.value, from: from.value, to: to.value }))
  } catch {
    /* armazenamento indisponível */
  }
})

const PERIODS = {
  all: 'Todo o período',
  month: 'Este mês',
  lastMonth: 'Mês passado',
  d30: 'Últimos 30 dias',
  d90: 'Últimos 90 dias',
  year: 'Este ano',
  custom: 'Personalizado'
}

const range = computed(() => {
  const today = todayISO()
  const [y, m] = today.split('-').map(Number)
  const pad = (n) => String(n).padStart(2, '0')
  switch (period.value) {
    case 'month':
      return [`${y}-${pad(m)}-01`, today]
    case 'lastMonth': {
      const ly = m === 1 ? y - 1 : y
      const lm = m === 1 ? 12 : m - 1
      return [`${ly}-${pad(lm)}-01`, addDaysISO(`${y}-${pad(m)}-01`, -1)]
    }
    case 'd30':
      return [addDaysISO(today, -29), today]
    case 'd90':
      return [addDaysISO(today, -89), today]
    case 'year':
      return [`${y}-01-01`, `${y}-12-31`]
    case 'custom':
      return [from.value || '0000-01-01', to.value || '9999-12-31']
    default:
      return ['0000-01-01', '9999-12-31']
  }
})

const filtered = computed(() => {
  const q = normalizeSearch(term.value)
  const [start, end] = range.value
  return quotes.sorted.filter((it) => {
    if (status.value && it.status !== status.value) return false
    if (it.date < start || it.date > end) return false
    if (q && !normalizeSearch(`${it.number} ${it.client?.name} ${it.items?.map((i) => i.description).join(' ')}`).includes(q)) return false
    return true
  })
})

const summary = computed(() => {
  const total = filtered.value.reduce((s, q) => s + (q.total || 0), 0)
  const approved = filtered.value.filter((q) => q.status === 'aprovado').reduce((s, q) => s + (q.total || 0), 0)
  return { total, approved }
})

const counts = computed(() => {
  const c = {}
  for (const q of quotes.items) c[q.status] = (c[q.status] || 0) + 1
  return c
})

async function duplicate(q) {
  try {
    const copy = await quotes.duplicate(q.id)
    ui.toast(`Orçamento duplicado como nº ${copy.number}.`)
    router.push(`/orcamentos/${copy.id}`)
  } catch (err) {
    console.error(err)
    ui.toast('Não foi possível duplicar.', 'danger')
  }
}

function clearFilters() {
  term.value = ''
  status.value = ''
  period.value = 'all'
}
</script>

<template>
  <section>
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h1 class="page-title">Orçamentos</h1>
        <p class="text-secondary small mb-0">{{ config.slogan }}</p>
      </div>
      <RouterLink to="/orcamentos/novo" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i> Novo
      </RouterLink>
    </div>

    <InstallBanner />

    <div v-if="!company.isConfigured" class="callout d-flex gap-2 align-items-start mb-3">
      <i class="bi bi-lightbulb fs-5"></i>
      <div>
        <strong>Primeiro passo:</strong> preencha os dados da sua empresa (nome, logo, contato) para que eles saiam no PDF.
        <RouterLink to="/empresa" class="d-block mt-1">Configurar minha empresa →</RouterLink>
      </div>
    </div>

    <template v-if="quotes.items.length">
      <div class="card mb-3">
        <div class="card-body p-3">
          <div class="input-group mb-2">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input v-model="term" type="search" class="form-control" placeholder="Buscar por número, cliente ou item" aria-label="Buscar" />
          </div>
          <div class="row g-2 align-items-center">
            <div class="col-12 col-md">
              <div class="status-filter">
                <button type="button" class="btn btn-sm" :class="{ active: status === '' }" :aria-pressed="status === ''" @click="status = ''">
                  Todos <span class="opacity-75">{{ quotes.items.length }}</span>
                </button>
                <button
                  v-for="(s, key) in STATUSES"
                  :key="key"
                  type="button"
                  class="btn btn-sm"
                  :class="{ active: status === key }" :aria-pressed="status === key"
                  @click="status = key"
                >
                  {{ s.label }} <span class="opacity-75">{{ counts[key] || 0 }}</span>
                </button>
              </div>
            </div>
            <div class="col-12 col-md-auto">
              <select v-model="period" class="form-select form-select-sm" aria-label="Período">
                <option v-for="(label, key) in PERIODS" :key="key" :value="key">{{ label }}</option>
              </select>
            </div>
          </div>
          <div v-if="period === 'custom'" class="row g-2 mt-1">
            <div class="col-6">
              <label class="form-label small mb-1" for="f-from">De</label>
              <input id="f-from" v-model="from" type="date" class="form-control form-control-sm" />
            </div>
            <div class="col-6">
              <label class="form-label small mb-1" for="f-to">Até</label>
              <input id="f-to" v-model="to" type="date" class="form-control form-control-sm" />
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-between small text-secondary mb-2 px-1 tabular">
        <span>{{ filtered.length }} orçamento{{ filtered.length === 1 ? '' : 's' }} · {{ formatMoney(summary.total) }}</span>
        <span v-if="summary.approved" class="text-success">Aprovados: {{ formatMoney(summary.approved) }}</span>
      </div>

      <div v-if="filtered.length" class="d-flex flex-column gap-2">
        <div v-for="q in filtered" :key="q.id" class="card list-card" :class="`status-${q.status}`">
          <div class="card-body p-3">
            <RouterLink :to="`/orcamentos/${q.id}`" class="stretched-link text-decoration-none text-body">
              <div class="d-flex justify-content-between align-items-start gap-2">
                <div class="min-w-0">
                  <div class="small text-secondary tabular">Nº {{ q.number }} · {{ formatDate(q.date) }}</div>
                  <div class="fw-semibold text-truncate">{{ q.client?.name || 'Sem cliente' }}</div>
                </div>
                <StatusBadge :status="q.status" />
              </div>
            </RouterLink>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <span class="money fs-5">{{ formatMoney(q.total) }}</span>
              <div class="d-flex gap-1 position-relative" style="z-index: 2">
                <button type="button" class="btn btn-icon btn-soft" title="Baixar PDF" @click="downloadPdf(q)">
                  <i class="bi bi-file-earmark-pdf"></i>
                </button>
                <button type="button" class="btn btn-icon btn-soft" title="Duplicar" @click="duplicate(q)">
                  <i class="bi bi-copy"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EmptyState v-else icon="bi-funnel" title="Nenhum orçamento encontrado" text="Tente mudar a busca ou os filtros.">
        <button type="button" class="btn btn-outline-secondary btn-sm" @click="clearFilters">Limpar filtros</button>
      </EmptyState>
    </template>

    <EmptyState
      v-else
      icon="bi-file-earmark-plus"
      title="Nenhum orçamento ainda"
      text="Crie seu primeiro orçamento e envie em PDF pelo WhatsApp em poucos toques."
    >
      <RouterLink to="/orcamentos/novo" class="btn btn-primary"><i class="bi bi-plus-lg"></i> Criar orçamento</RouterLink>
    </EmptyState>
  </section>
</template>
