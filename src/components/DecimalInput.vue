<script setup>
import { ref, watch } from 'vue'
import { parseDecimal } from '@/utils/money'

/** Número decimal aceitando vírgula (ex.: 2,5). v-model numérico. */
const props = defineProps({
  modelValue: { type: Number, default: 0 },
  max: { type: Number, default: 1e9 }
})
const emit = defineEmits(['update:modelValue'])

const toText = (n) => (n ? String(n).replace('.', ',') : '')
const text = ref(toText(props.modelValue))

watch(
  () => props.modelValue,
  (n) => {
    if (parseDecimal(text.value) !== n) text.value = toText(n)
  }
)

function onInput(e) {
  const clean = e.target.value.replace(/[^\d,.]/g, '')
  text.value = clean
  e.target.value = clean
  emit('update:modelValue', Math.min(parseDecimal(clean), props.max))
}
</script>

<template>
  <input type="text" inputmode="decimal" class="form-control tabular" :value="text" @input="onInput" />
</template>
