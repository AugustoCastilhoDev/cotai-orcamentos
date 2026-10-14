<script setup>
import config from '@/config'
import InstallButton from './InstallButton.vue'
import { useInstall } from '@/composables/useInstall'

const { showBanner, dismissBanner } = useInstall()
</script>

<template>
  <div v-if="showBanner" class="card install-banner mb-3">
    <div class="card-body d-flex align-items-center gap-3 p-3">
      <img src="/pwa-192.png" alt="" width="48" height="48" class="rounded-3 flex-shrink-0" />
      <div class="flex-grow-1 min-w-0">
        <div class="fw-semibold">Instale o {{ config.appName }} no celular</div>
        <div class="small text-secondary">Abre direto da tela inicial e funciona sem internet.</div>
      </div>
      <button type="button" class="btn-close align-self-start" aria-label="Agora não" @click="dismissBanner"></button>
    </div>
    <div class="px-3 pb-3">
      <InstallButton btn-class="btn btn-primary w-100" label="Instalar app" />
    </div>
  </div>
</template>
