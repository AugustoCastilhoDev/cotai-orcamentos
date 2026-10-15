<script setup>
import { STATUSES } from '@/stores/quotes'

defineProps({ status: { type: String, required: true } })
</script>

<template>
  <span class="status-badge" :class="`status-${status}`">
    <i class="bi" :class="STATUSES[status]?.icon"></i> {{ STATUSES[status]?.label || status }}
  </span>
</template>
