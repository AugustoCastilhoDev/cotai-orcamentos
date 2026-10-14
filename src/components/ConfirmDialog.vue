<script setup>
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
const state = computed(() => ui.confirmState)
</script>

<template>
  <BaseModal :show="!!state" :title="state?.title || ''" size="sm" @close="ui.closeConfirm(false)">
    <p class="mb-0" style="white-space: pre-line">{{ state?.message }}</p>
    <template #footer>
      <button type="button" class="btn btn-light" @click="ui.closeConfirm(false)">{{ state?.cancelText }}</button>
      <button
        type="button"
        class="btn"
        :class="state?.danger ? 'btn-danger' : 'btn-primary'"
        @click="ui.closeConfirm(true)"
      >
        {{ state?.okText }}
      </button>
    </template>
  </BaseModal>
</template>
