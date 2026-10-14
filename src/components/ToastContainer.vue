<script setup>
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
const icons = { success: 'bi-check-circle-fill', danger: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' }
</script>

<template>
  <div class="toast-stack" aria-live="polite">
    <div
      v-for="t in ui.toasts"
      :key="t.id"
      class="alert d-flex align-items-start gap-2 shadow mb-0 py-2"
      :class="`alert-${t.type}`"
      role="status"
    >
      <i class="bi mt-1" :class="icons[t.type] || icons.info"></i>
      <div class="flex-grow-1">{{ t.message }}</div>
      <button type="button" class="btn-close btn-sm mt-1" aria-label="Fechar" @click="ui.dismiss(t.id)"></button>
    </div>
  </div>
</template>
