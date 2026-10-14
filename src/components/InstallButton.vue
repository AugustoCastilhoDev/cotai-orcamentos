<script setup>
import { ref } from 'vue'
import BaseModal from './BaseModal.vue'
import config from '@/config'
import { useInstall } from '@/composables/useInstall'
import { useUiStore } from '@/stores/ui'

/** Botão "Instalar": abre a instalação nativa ou, sem suporte, o passo a passo. */
defineProps({
  btnClass: { type: String, default: 'btn btn-primary' },
  label: { type: String, default: 'Instalar app' }
})

const { mode, install } = useInstall()
const ui = useUiStore()
const showHelp = ref(false)

async function onClick() {
  const result = await install()
  if (result === 'accepted') ui.toast(`Pronto! O ${config.appName} foi instalado no seu aparelho.`)
  else if (result === 'manual') showHelp.value = true
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(location.origin)
    ui.toast('Link copiado! Cole no Chrome ou no Safari.')
  } catch {
    ui.toast(location.origin, 'info', 8000)
  }
}
</script>

<template>
  <button type="button" :class="btnClass" @click="onClick">
    <i class="bi bi-download"></i> {{ label }}
  </button>

  <BaseModal :show="showHelp" :title="`Instalar o ${config.appName}`" @close="showHelp = false">
    <template v-if="mode === 'in-app'">
      <p>
        Você está usando o navegador interno de outro aplicativo (Instagram, WhatsApp...), que não permite instalar.
      </p>
      <ol class="install-steps">
        <li>Toque no menu <strong><i class="bi bi-three-dots-vertical"></i></strong> ou <strong>•••</strong> no canto da tela.</li>
        <li>Escolha <strong>Abrir no navegador</strong> (ou "Abrir no Chrome/Safari").</li>
        <li>No navegador, toque em <strong>Instalar app</strong>.</li>
      </ol>
      <button type="button" class="btn btn-outline-primary w-100" @click="copyLink">
        <i class="bi bi-link-45deg"></i> Copiar link do app
      </button>
    </template>

    <template v-else-if="mode === 'ios'">
      <p>No iPhone e no iPad, a instalação é feita pelo <strong>Safari</strong>:</p>
      <ol class="install-steps">
        <li>Toque no botão <strong>Compartilhar</strong> <i class="bi bi-box-arrow-up text-primary"></i> na barra do Safari.</li>
        <li>Role as opções e toque em <strong>Adicionar à Tela de Início</strong> <i class="bi bi-plus-square"></i>.</li>
        <li>Toque em <strong>Adicionar</strong>. Pronto: o ícone do {{ config.appName }} aparece na tela inicial.</li>
      </ol>
      <p class="small text-secondary mb-0">
        Usando Chrome no iPhone? O botão Compartilhar fica na barra de endereço, e o caminho é o mesmo.
      </p>
    </template>

    <template v-else>
      <p>Para instalar pelo navegador:</p>
      <ol class="install-steps">
        <li>Toque no menu <strong><i class="bi bi-three-dots-vertical"></i></strong> do navegador (canto superior direito).</li>
        <li>Escolha <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.</li>
        <li>Confirme em <strong>Instalar</strong>.</li>
      </ol>
    </template>

    <p class="small text-secondary mt-3 mb-0">
      <i class="bi bi-info-circle"></i> Instalado, o {{ config.appName }} abre como um aplicativo, em tela cheia, e
      funciona sem internet. Não ocupa quase nada de espaço.
    </p>
  </BaseModal>
</template>
