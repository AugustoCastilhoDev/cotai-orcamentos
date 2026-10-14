<script setup>
import { ref, watch } from 'vue'
import QRCode from 'qrcode'
import BaseModal from './BaseModal.vue'
import config from '@/config'
import { buildPixPayload } from '@/utils/pix'
import { useUiStore } from '@/stores/ui'

const props = defineProps({ show: Boolean })
defineEmits(['close'])

const ui = useUiStore()
const payload = ref('')
const qrDataUrl = ref('')
const copied = ref(false)

watch(
  () => props.show,
  async (open) => {
    if (!open || payload.value || !config.pix.key) return
    payload.value = buildPixPayload(config.pix)
    qrDataUrl.value = await QRCode.toDataURL(payload.value, { margin: 1, width: 440, errorCorrectionLevel: 'M' })
  }
)

async function copy() {
  try {
    await navigator.clipboard.writeText(payload.value)
  } catch {
    // Fallback para navegadores sem Clipboard API
    const ta = document.createElement('textarea')
    ta.value = payload.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
  copied.value = true
  ui.toast('Código Pix copiado!')
  setTimeout(() => (copied.value = false), 2500)
}
</script>

<template>
  <BaseModal :show="show" title="Apoie este projeto" @close="$emit('close')">
    <div class="text-center">
      <p>
        O {{ config.appName }} é gratuito e não tem anúncios. Se ele ajuda no seu trabalho, considere
        apoiar com qualquer valor via Pix. <i class="bi bi-heart-fill text-danger"></i>
      </p>
      <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Code Pix" class="pix-qr border rounded my-2" />
      <p class="small text-secondary mb-2">Abra o app do seu banco, escolha Pix e leia o QR Code, ou use o código abaixo.</p>
      <div class="pix-code bg-body-tertiary rounded p-2 text-start mb-3">{{ payload }}</div>
      <button type="button" class="btn btn-primary w-100" @click="copy">
        <i class="bi" :class="copied ? 'bi-check2' : 'bi-copy'"></i>
        {{ copied ? 'Copiado!' : 'Copiar código Pix (copia e cola)' }}
      </button>
      <p class="small text-secondary mt-3 mb-0">Recebedor: {{ config.pix.name }}</p>
    </div>
  </BaseModal>
</template>
