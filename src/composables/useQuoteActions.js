import { useCompanyStore } from '@/stores/company'
import { useUiStore } from '@/stores/ui'
import { downloadBlob, sharePdf, quoteSummaryText, whatsappUrl } from './useShare'

/** Carrega o gerador de PDF antecipadamente (jsPDF é pesado). */
export function preloadPdf() {
  return import('./usePdf')
}

/** Ações de saída do orçamento (PDF, compartilhar, WhatsApp). */
export function useQuoteActions() {
  const company = useCompanyStore()
  const ui = useUiStore()

  async function makePdf(quote) {
    const { buildQuotePdf } = await preloadPdf()
    return buildQuotePdf(quote, company.data)
  }

  async function downloadPdf(quote) {
    try {
      const { blob, fileName } = await makePdf(quote)
      downloadBlob(blob, fileName)
      ui.toast('PDF gerado.')
    } catch (err) {
      console.error(err)
      ui.toast('Não foi possível gerar o PDF.', 'danger')
    }
  }

  /** Compartilha o arquivo; sem suporte, baixa o PDF. */
  async function sharePdfFile(quote) {
    try {
      const { blob, fileName } = await makePdf(quote)
      const opts = { title: `Orçamento ${quote.number}`, text: quoteSummaryText(quote, company.data) }
      let result = await sharePdf(blob, fileName, opts)
      if (result === 'needs-gesture') {
        const ok = await ui.confirm({
          title: 'PDF pronto',
          message: 'Toque em "Compartilhar" para escolher o aplicativo de envio.',
          okText: 'Compartilhar'
        })
        result = ok ? await sharePdf(blob, fileName, opts) : 'cancelled'
      }
      if (result === 'unsupported' || result === 'needs-gesture') {
        downloadBlob(blob, fileName)
        ui.toast('Seu navegador não envia arquivos diretamente. O PDF foi baixado para você anexar.', 'info', 6000)
      }
      return result
    } catch (err) {
      console.error(err)
      ui.toast('Não foi possível compartilhar o PDF.', 'danger')
      return 'error'
    }
  }

  function openWhatsapp(quote) {
    const url = whatsappUrl(quote.client?.phone, quoteSummaryText(quote, company.data))
    window.open(url, '_blank', 'noopener')
  }

  return { downloadPdf, sharePdfFile, openWhatsapp }
}
