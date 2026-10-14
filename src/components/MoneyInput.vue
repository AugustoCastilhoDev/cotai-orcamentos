<script setup>
import { computed } from 'vue'

/**
 * Campo de moeda no padrão dos apps de banco: os dígitos digitados
 * preenchem da direita para a esquerda (1234 -> 12,34). v-model em centavos.
 */
const props = defineProps({
  modelValue: { type: Number, default: 0 },
  prefix: { type: String, default: 'R$' }
})
const emit = defineEmits(['update:modelValue'])
defineOptions({ inheritAttrs: false })

const fmt = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const display = computed(() => fmt.format((props.modelValue || 0) / 100))

function onInput(e) {
  const digits = e.target.value.replace(/\D/g, '').slice(0, 13)
  const cents = Number(digits || 0)
  e.target.value = fmt.format(cents / 100)
  emit('update:modelValue', cents)
}

function onFocus(e) {
  // Cursor sempre no fim, onde os dígitos entram
  requestAnimationFrame(() => {
    const len = e.target.value.length
    e.target.setSelectionRange?.(len, len)
  })
}
</script>

<template>
  <div class="input-group">
    <span v-if="prefix" class="input-group-text">{{ prefix }}</span>
    <input
      type="text"
      inputmode="numeric"
      class="form-control text-end tabular"
      :value="display"
      v-bind="$attrs"
      @input="onInput"
      @focus="onFocus"
    />
  </div>
</template>
