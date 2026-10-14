import { ref, computed } from 'vue'

/**
 * Instalação do PWA.
 * - Chrome/Edge/Samsung (Android e desktop): o navegador dispara "beforeinstallprompt";
 *   guardamos o evento e abrimos a janela nativa de instalação com um toque.
 * - iPhone/iPad: não existe API; mostramos o passo a passo (Compartilhar → Tela de Início).
 * - Navegadores internos (Instagram, Facebook, WhatsApp...): não instalam; orientamos abrir no navegador.
 *
 * O estado é compartilhado (singleton) e os listeners são registrados assim que o módulo é importado,
 * antes do app montar, para não perder o evento.
 */

const deferredPrompt = ref(null)
const installed = ref(false)

const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
const isIos = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
const isAndroid = /android/i.test(ua)
const isMobile = isIos || isAndroid
const isInAppBrowser = /Instagram|FBAN|FBAV|FB_IAB|WhatsApp|Line\/|Twitter|LinkedInApp|TikTok|musical_ly/i.test(ua)

function detectStandalone() {
  try {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  } catch {
    return false
  }
}
installed.value = detectStandalone()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault() // segura o mini-banner automático; usamos nosso próprio botão
    deferredPrompt.value = e
  })
  window.addEventListener('appinstalled', () => {
    installed.value = true
    deferredPrompt.value = null
  })
  try {
    window.matchMedia('(display-mode: standalone)').addEventListener('change', () => {
      installed.value = detectStandalone()
    })
  } catch {
    /* navegadores antigos */
  }
}

/** Tipo de instalação disponível neste aparelho. */
const mode = computed(() => {
  if (installed.value) return 'installed'
  if (isInAppBrowser) return 'in-app'
  if (deferredPrompt.value) return 'prompt'
  if (isIos) return 'ios'
  if (isAndroid) return 'android-manual'
  return 'unavailable' // desktop sem suporte (ex.: Firefox, Safari no Mac)
})

const DISMISS_KEY = 'cotai:install-dismissed-at'
const DISMISS_DAYS = 14

function wasDismissedRecently() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0)
    return Date.now() - at < DISMISS_DAYS * 864e5
  } catch {
    return false
  }
}

const dismissed = ref(wasDismissedRecently())

export function useInstall() {
  /** Mostra o botão "Instalar" quando há algo útil a oferecer. */
  const canOffer = computed(() => mode.value === 'prompt' || (isMobile && ['ios', 'android-manual', 'in-app'].includes(mode.value)))
  /** O aviso da tela inicial respeita o "fechar" do usuário; o botão do topo não. */
  const showBanner = computed(() => canOffer.value && !dismissed.value)

  /** Abre a janela nativa. Retorna 'accepted', 'dismissed' ou 'manual' (precisa de instruções). */
  async function install() {
    const evt = deferredPrompt.value
    if (!evt) return 'manual'
    try {
      await evt.prompt()
    } catch (err) {
      // Ex.: navegador recusou por falta de toque recente; mantém o evento e mostra o passo a passo
      console.warn('Instalação nativa indisponível:', err)
      return 'manual'
    }
    deferredPrompt.value = null // depois de exibido, o evento não pode ser reutilizado
    const { outcome } = await evt.userChoice
    if (outcome === 'accepted') installed.value = true
    return outcome
  }

  function dismissBanner() {
    dismissed.value = true
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      /* armazenamento indisponível: esconde só nesta sessão */
    }
  }

  return { mode, canOffer, showBanner, install, dismissBanner, isIos }
}
