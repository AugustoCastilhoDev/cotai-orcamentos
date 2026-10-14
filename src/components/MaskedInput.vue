<script setup>
import { masks } from '@/utils/masks'

const props = defineProps({
  modelValue: { type: String, default: '' },
  mask: { type: String, required: true } // 'phone' | 'document' | 'cep'
})
const emit = defineEmits(['update:modelValue'])

const inputModes = { phone: 'tel', document: 'text', cep: 'numeric' }

function onInput(e) {
  const masked = masks[props.mask](e.target.value)
  e.target.value = masked
  emit('update:modelValue', masked)
}
</script>

<template>
  <input
    class="form-control"
    :value="modelValue"
    :inputmode="inputModes[mask]"
    :type="mask === 'phone' ? 'tel' : 'text'"
    autocomplete="off"
    @input="onInput"
  />
</template>
