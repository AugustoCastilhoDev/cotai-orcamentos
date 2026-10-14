<script setup>
import { STATUSES } from '@/stores/quotes'

defineProps({ status: { type: String, required: true } })
</script>

<template>
  <span class="badge rounded-pill" :class="`text-bg-${STATUSES[status]?.color || 'secondary'}`">
    <i class="bi" :class="STATUSES[status]?.icon"></i> {{ STATUSES[status]?.label || status }}
  </span>
</template>
