import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import config from '@/config'
import { calcTotals, itemSubtotal } from '@/utils/money'
import { formatMoney, formatNumber, formatDate, addDaysISO } from '@/utils/format'

const MARGIN = 14
const GRAY = [90, 98, 112]
const DARK = [30, 35, 45]
const LIGHT_LINE = [215, 220, 228]

/**
 * As fontes padrão do PDF só aceitam o alfabeto Latin-1 (inclui acentos do português).
 * Trocamos aspas/travessões "tipográficos" e removemos o resto (ex.: emojis).
 */
export function pdfText(value) {
  return String(value ?? '')
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/[–—−]/g, '-')
    .replace(/[•●▪]/g, '-')
    .replace(/…/g, '...')
    .replace(/[   ]/g, ' ')
    .replace(/[^\n\r\t -~ -ÿ]/g, '')
}

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '')
  if (!m) return [15, 82, 186]
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function contrastText(rgb) {
  const [r, g, b] = rgb
  return 0.299 * r + 0.587 * g + 0.114 * b > 165 ? DARK : [255, 255, 255]
}

export function pdfFileName(quote) {
  const client = (quote.client?.name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  return `Orcamento-${quote.number || 'rascunho'}${client ? '-' + client : ''}.pdf`
}

/** Gera o PDF do orçamento e devolve { blob, fileName }. */
export function buildQuotePdf(quote, company) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const contentW = pageW - MARGIN * 2
  const brand = hexToRgb(company.color)
  const brandText = contrastText(brand)
  const totals = calcTotals(quote)
  const validUntil = addDaysISO(quote.date, quote.validityDays)
  let y = MARGIN

  const text = (str, x, yy, opts) => doc.text(pdfText(str), x, yy, opts)
  const setFont = (size, style = 'normal', color = DARK) => {
    doc.setFont('helvetica', style)
    doc.setFontSize(size)
    doc.setTextColor(...color)
  }
  const lineH = (size) => size * 0.3528 * 1.25
  const ensureSpace = (h) => {
    if (y + h > pageH - 18) {
      doc.addPage()
      y = MARGIN + 4
    }
  }

  // ---------- Faixa superior ----------
  doc.setFillColor(...brand)
  doc.rect(0, 0, pageW, 4, 'F')
  y = 12

  // ---------- Cabeçalho: logo + empresa ----------
  let textX = MARGIN
  let logoH = 0
  if (company.logo) {
    try {
      const props = doc.getImageProperties(company.logo)
      const maxW = 34
      const maxH = 24
      const ratio = Math.min(maxW / props.width, maxH / props.height)
      const w = props.width * ratio
      logoH = props.height * ratio
      const format = company.logo.startsWith('data:image/png') ? 'PNG' : 'JPEG'
      doc.addImage(company.logo, format, MARGIN, y, w, logoH)
      textX = MARGIN + w + 5
    } catch {
      /* logo inválida: ignora */
    }
  }

  const boxW = 58
  const companyMaxW = pageW - MARGIN - boxW - 6 - textX
  let cy = y + 5
  setFont(14, 'bold')
  for (const l of doc.splitTextToSize(pdfText(company.name || 'Sua empresa'), companyMaxW)) {
    text(l, textX, cy)
    cy += lineH(14)
  }
  setFont(8.5, 'normal', GRAY)
  const companyLines = [
    company.document && `CPF/CNPJ: ${company.document}`,
    [company.phone, company.email].filter(Boolean).join('  |  '),
    company.address
  ].filter(Boolean)
  for (const raw of companyLines) {
    for (const l of doc.splitTextToSize(pdfText(raw), companyMaxW)) {
      text(l, textX, cy)
      cy += lineH(8.5)
    }
  }

  // ---------- Caixa com número e datas ----------
  const boxX = pageW - MARGIN - boxW
  const boxH = 27
  doc.setFillColor(...brand)
  doc.roundedRect(boxX, y, boxW, 9, 1.5, 1.5, 'F')
  doc.rect(boxX, y + 5, boxW, 4, 'F')
  setFont(10, 'bold', brandText)
  text('ORÇAMENTO', boxX + boxW / 2, y + 6.2, { align: 'center' })
  doc.setDrawColor(...brand)
  doc.setLineWidth(0.4)
  doc.roundedRect(boxX, y, boxW, boxH, 1.5, 1.5, 'S')
  setFont(12, 'bold')
  text(`Nº ${quote.number || '-'}`, boxX + boxW / 2, y + 15, { align: 'center' })
  setFont(8.5, 'normal', GRAY)
  text(`Data: ${formatDate(quote.date)}`, boxX + boxW / 2, y + 20, { align: 'center' })
  text(`Válido até: ${formatDate(validUntil)}`, boxX + boxW / 2, y + 24.5, { align: 'center' })

  y = Math.max(cy, y + logoH, y + boxH) + 5
  doc.setDrawColor(...LIGHT_LINE)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, y, pageW - MARGIN, y)
  y += 7

  // ---------- Cliente ----------
  const sectionTitle = (title) => {
    ensureSpace(14)
    setFont(8, 'bold', brand)
    text(title.toUpperCase(), MARGIN, y)
    y += 5
  }

  sectionTitle('Cliente')
  const c = quote.client || {}
  setFont(11, 'bold')
  text(c.name || '-', MARGIN, y)
  y += lineH(11) + 0.5
  setFont(9, 'normal', GRAY)
  const clientLines = [
    c.document && `CPF/CNPJ: ${c.document}`,
    [c.phone, c.email].filter(Boolean).join('  |  '),
    c.address
  ].filter(Boolean)
  for (const raw of clientLines) {
    for (const l of doc.splitTextToSize(pdfText(raw), contentW)) {
      text(l, MARGIN, y)
      y += lineH(9)
    }
  }
  y += 4

  // ---------- Itens ----------
  const rows = (quote.items || []).map((it, i) => [
    String(i + 1),
    pdfText(it.description),
    formatNumber(it.quantity),
    pdfText(it.unit),
    formatMoney(it.unitPrice),
    formatMoney(itemSubtotal(it))
  ])

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN, bottom: 18 },
    head: [['#', 'Descrição', 'Qtd.', 'Un.', 'Valor unit.', 'Subtotal']],
    body: rows.length ? rows : [['', 'Nenhum item', '', '', '', '']],
    theme: 'striped',
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.2, textColor: DARK, lineColor: LIGHT_LINE },
    headStyles: { fillColor: brand, textColor: brandText, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [246, 247, 250] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center', textColor: GRAY },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 14, halign: 'right' },
      3: { cellWidth: 18, halign: 'center', overflow: 'ellipsize' },
      4: { cellWidth: 27, halign: 'right' },
      5: { cellWidth: 29, halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.section === 'head' && data.column.index >= 2) {
        data.cell.styles.halign = data.column.index === 3 ? 'center' : 'right'
      }
    }
  })
  y = (doc.lastAutoTable?.finalY || y) + 5

  // ---------- Totais ----------
  const totalsRows = [['Subtotal', formatMoney(totals.subtotal)]]
  if (totals.discount > 0) {
    const pct = quote.discountType === 'percent' ? ` (${formatNumber(quote.discountValue)}%)` : ''
    totalsRows.push([`Desconto${pct}`, `- ${formatMoney(totals.discount)}`])
  }
  if (totals.extra > 0) totalsRows.push([quote.extraLabel || 'Acréscimo', `+ ${formatMoney(totals.extra)}`])

  const totW = 78
  const totX = pageW - MARGIN - totW
  ensureSpace(totalsRows.length * 6 + 14)
  setFont(9.5, 'normal', GRAY)
  for (const [label, value] of totalsRows) {
    text(label, totX + 2, y)
    setFont(9.5, 'normal', DARK)
    text(value, pageW - MARGIN - 2, y, { align: 'right' })
    setFont(9.5, 'normal', GRAY)
    y += 6
  }
  doc.setFillColor(...brand)
  doc.roundedRect(totX, y - 3.5, totW, 10, 1.5, 1.5, 'F')
  setFont(11.5, 'bold', brandText)
  text('TOTAL', totX + 3, y + 3)
  text(formatMoney(totals.total), pageW - MARGIN - 3, y + 3, { align: 'right' })
  y += 15

  // ---------- Condições ----------
  const infoBlock = (title, body) => {
    if (!String(body || '').trim()) return
    const lines = doc.splitTextToSize(pdfText(body), contentW)
    sectionTitle(title)
    setFont(9.5, 'normal', DARK)
    for (const l of lines) {
      ensureSpace(lineH(9.5))
      text(l, MARGIN, y)
      y += lineH(9.5)
    }
    y += 4
  }

  infoBlock('Prazo de entrega', quote.deliveryTime)
  infoBlock('Condições de pagamento', quote.paymentTerms)
  infoBlock('Observações', quote.notes)
  infoBlock(
    'Validade',
    `Este orçamento é válido por ${quote.validityDays} dia${Number(quote.validityDays) === 1 ? '' : 's'}, até ${formatDate(validUntil)}.`
  )

  // ---------- Assinaturas ----------
  ensureSpace(36)
  const sigW = (contentW - 16) / 2
  doc.setDrawColor(...GRAY)
  doc.setLineWidth(0.3)
  const sigY = y + 18
  doc.line(MARGIN, sigY, MARGIN + sigW, sigY)
  doc.line(MARGIN + sigW + 16, sigY, pageW - MARGIN, sigY)
  setFont(8.5, 'bold', DARK)
  text(doc.splitTextToSize(pdfText(company.name || 'Empresa'), sigW)[0], MARGIN + sigW / 2, sigY + 4.5, { align: 'center' })
  text(doc.splitTextToSize(pdfText(c.name || 'Cliente'), sigW)[0], MARGIN + sigW + 16 + sigW / 2, sigY + 4.5, { align: 'center' })
  setFont(7.5, 'normal', GRAY)
  text('Responsável', MARGIN + sigW / 2, sigY + 8.5, { align: 'center' })
  text('De acordo (cliente)  -  Data: ____/____/______', MARGIN + sigW + 16 + sigW / 2, sigY + 8.5, { align: 'center' })

  // ---------- Rodapé em todas as páginas ----------
  const pages = doc.getNumberOfPages()
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p)
    doc.setDrawColor(...LIGHT_LINE)
    doc.line(MARGIN, pageH - 12, pageW - MARGIN, pageH - 12)
    setFont(7.5, 'normal', GRAY)
    text(`Orçamento ${quote.number || ''}`, MARGIN, pageH - 7.5)
    text(`Gerado com ${config.appName}`, pageW / 2, pageH - 7.5, { align: 'center' })
    text(`Página ${p} de ${pages}`, pageW - MARGIN, pageH - 7.5, { align: 'right' })
  }

  doc.setProperties({
    title: pdfText(`Orçamento ${quote.number || ''}`),
    author: pdfText(company.name || ''),
    creator: pdfText(config.appName)
  })

  return { blob: doc.output('blob'), fileName: pdfFileName(quote) }
}
