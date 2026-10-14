import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const toasts = ref([])
  const confirmState = ref(null)
  let toastId = 0

  function toast(message, type = 'success', timeout = 3500) {
    const id = ++toastId
    toasts.value.push({ id, message, type })
    if (timeout) setTimeout(() => dismiss(id), timeout)
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  /** Abre o diálogo de confirmação e resolve com true/false. */
  function confirm({ title = 'Confirmar', message = '', okText = 'Confirmar', cancelText = 'Cancelar', danger = false } = {}) {
    return new Promise((resolve) => {
      confirmState.value = { title, message, okText, cancelText, danger, resolve }
    })
  }

  function closeConfirm(result) {
    confirmState.value?.resolve(result)
    confirmState.value = null
  }

  return { toasts, confirmState, toast, dismiss, confirm, closeConfirm }
})
