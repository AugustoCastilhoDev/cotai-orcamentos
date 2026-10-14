import { formatMoney, formatDate, addDaysISO, onlyDigits } from '@/utils/format'
import { calcTotals } from '@/utils/money'

/** Faz o download de um Blob com o nome informado. */
export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30000)
}

export function canShareFiles() {
  try {
    const probe = new File(['x'], 'teste.pdf', { type: 'application/pdf' })
    return !!(navigator.canShare && navigator.canShare({ files: [probe] }))
  } catch {
    return false
  }
}

/**
 * Compartilha o PDF pela Web Share API.
 * Retorna 'shared', 'cancelled', 'unsupported' ou 'needs-gesture'
 * (o navegador exige um novo toque porque a geração do PDF demorou).
 */
export async function sharePdf(blob, fileName, { title, text } = {}) {
  const file = new File([blob], fileName, { type: 'application/pdf' })
  if (!navigator.canShare || !navigator.canShare({ files: [file] })) return 'unsupported'
  try {
    await navigator.share({ files: [file], title, text })
    return 'shared'
  } catch (err) {
    if (err?.name === 'AbortError') return 'cancelled'
    if (err?.name === 'NotAllowedError') return 'needs-gesture'
    throw err
  }
}

/** Mensagem curta para WhatsApp/compartilhamento. */
export function quoteSummaryText(quote, company) {
  const totals = calcTotals(quote)
  const firstName = (quote.client?.name || '').trim().split(/\s+/)[0]
  const lines = []
  lines.push(`Olá${firstName ? ', ' + firstName : ''}! Segue o orçamento nº ${quote.number}${company.name ? ' de ' + company.name : ''}:`)
  lines.push('')
  const items = quote.items || []
  items.slice(0, 6).forEach((it) => lines.push(`- ${it.description} (${String(it.quantity).replace('.', ',')} ${it.unit})`))
  if (items.length > 6) lines.push(`- e mais ${items.length - 6} ite${items.length - 6 === 1 ? 'm' : 'ns'}`)
  lines.push('')
  lines.push(`*Total: ${formatMoney(totals.total)}*`)
  if (quote.deliveryTime) lines.push(`Prazo de entrega: ${quote.deliveryTime}`)
  lines.push(`Válido até ${formatDate(addDaysISO(quote.date, quote.validityDays))}.`)
  lines.push('')
  lines.push('Fico à disposição para qualquer dúvida.')
  return lines.join('\n')
}

/** Link wa.me com o telefone do cliente (se houver) e o texto. */
export function whatsappUrl(phone, text) {
  let digits = onlyDigits(phone)
  if (digits.length === 10 || digits.length === 11) digits = '55' + digits
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}
