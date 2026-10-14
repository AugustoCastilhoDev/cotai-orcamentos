<script setup>
import { watch, onBeforeUnmount, useId } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String, default: '' }, // '', 'sm', 'lg'
  fullscreenMobile: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])
const titleId = useId()

function onKey(e) {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.show,
  (open) => {
    document.body.classList.toggle('modal-open', open)
    if (open) document.addEventListener('keydown', onKey)
    else document.removeEventListener('keydown', onKey)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  document.body.classList.remove('modal-open')
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <template v-if="show">
      <div
        class="modal show"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @mousedown.self="emit('close')"
      >
        <div
          class="modal-dialog modal-dialog-scrollable"
          :class="[size ? `modal-${size}` : '', fullscreenMobile ? 'modal-fullscreen-sm-down' : 'modal-dialog-centered']"
        >
          <div class="modal-content">
            <div class="modal-header">
              <h2 :id="titleId" class="modal-title fs-5">{{ title }}</h2>
              <button type="button" class="btn-close" aria-label="Fechar" @click="emit('close')"></button>
            </div>
            <div class="modal-body">
              <slot />
            </div>
            <div v-if="$slots.footer" class="modal-footer">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop show"></div>
    </template>
  </Teleport>
</template>
