<script setup>
import EmptyState from '@/components/EmptyState.vue'
</script>

<template>
  <EmptyState icon="bi-signpost-split" title="Página não encontrada" text="O endereço acessado não existe.">
    <RouterLink to="/" class="btn btn-primary">Ir para os orçamentos</RouterLink>
  </EmptyState>
</template>
