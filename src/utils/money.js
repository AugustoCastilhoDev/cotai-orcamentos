/**
 * Cálculos do orçamento. Todos os valores monetários são inteiros em centavos.
 */

export function itemSubtotal(item) {
  const qty = Number(item.quantity) || 0
  const price = Number(item.unitPrice) || 0
  return Math.round(qty * price)
}

export function calcTotals(quote) {
  const subtotal = (quote.items || []).reduce((sum, it) => sum + itemSubtotal(it), 0)
  let discount = 0
  if (quote.discountType === 'percent') {
    const pct = Math.min(Math.max(Number(quote.discountValue) || 0, 0), 100)
    discount = Math.round((subtotal * pct) / 100)
  } else {
    discount = Math.min(Math.max(Number(quote.discountValue) || 0, 0), subtotal)
  }
  const extra = Math.max(Number(quote.extra) || 0, 0)
  const total = Math.max(subtotal - discount + extra, 0)
  return { subtotal, discount, extra, total }
}

/** "12,5" ou "12.5" -> 12.5 */
export function parseDecimal(text) {
  if (typeof text === 'number') return text
  let s = String(text || '').trim()
  // Com vírgula: formato brasileiro (1.234,5). Sem vírgula: ponto é decimal (2.5).
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  const n = parseFloat(s)
  return isNaN(n) ? 0 : n
}
