const currencyFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const numberFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 })
const dateFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })
const longDateFmt = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

/** Valor em centavos -> "R$ 1.234,56" (espaços especiais trocados por espaço comum). */
export function formatMoney(cents) {
  return currencyFmt.format((Number(cents) || 0) / 100).replace(/[  ]/g, ' ')
}

export function formatNumber(n) {
  return numberFmt.format(Number(n) || 0)
}

/** Datas são guardadas como texto "AAAA-MM-DD" (sem fuso). */
export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00Z`)
  return isNaN(d) ? '' : dateFmt.format(d)
}

export function formatLongDate(iso) {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00Z`)
  return isNaN(d) ? '' : longDateFmt.format(d)
}

/** Data de hoje no fuso local, como "AAAA-MM-DD". */
export function todayISO() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function addDaysISO(iso, days) {
  const d = new Date(`${iso || todayISO()}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + (Number(days) || 0))
  return d.toISOString().slice(0, 10)
}

export function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '')
}
