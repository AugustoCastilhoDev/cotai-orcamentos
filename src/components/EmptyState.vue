<script setup>
defineProps({
  icon: { type: String, default: 'bi-inbox' },
  title: { type: String, required: true },
  text: { type: String, default: '' }
})
</script>

<template>
  <div class="empty-state">
    <i class="bi" :class="icon"></i>
    <p class="fw-semibold mt-2 mb-1 text-body">{{ title }}</p>
    <p v-if="text" class="small mb-3">{{ text }}</p>
    <slot />
  </div>
</template>
