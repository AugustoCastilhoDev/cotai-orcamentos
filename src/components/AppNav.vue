<script setup>
import config from '@/config'

defineEmits(['support'])

const links = [
  { to: '/', label: 'Orçamentos', icon: 'bi-file-earmark-text' },
  { to: '/clientes', label: 'Clientes', icon: 'bi-people' },
  { to: '/catalogo', label: 'Catálogo', icon: 'bi-box-seam' },
  { to: '/empresa', label: 'Empresa', icon: 'bi-building' },
  { to: '/backup', label: 'Backup', icon: 'bi-cloud-arrow-down' }
]
const hasPix = !!config.pix.key
</script>

<template>
  <header class="top-nav sticky-top">
    <div class="container app-container d-flex align-items-center gap-3" style="height: 56px">
      <RouterLink to="/" class="brand">
        <img src="/pwa-192.png" alt="" />
        <span class="d-flex flex-column lh-1">
          <span>{{ config.appName }}</span>
          <small class="brand-slogan">{{ config.slogan }}</small>
        </span>
      </RouterLink>
      <nav class="d-none d-md-flex gap-1 ms-auto" aria-label="Menu principal">
        <RouterLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="nav-link"
          :class="{ 'router-link-active': l.to === '/' && ($route.path === '/' || $route.path.startsWith('/orcamentos')) }"
        >
          {{ l.label }}
        </RouterLink>
      </nav>
      <button
        v-if="hasPix"
        type="button"
        class="btn btn-link btn-support d-md-none ms-auto"
        @click="$emit('support')"
      >
        <i class="bi bi-heart-fill heart-beat"></i> Apoie
      </button>
    </div>
  </header>

  <nav class="bottom-nav d-md-none" aria-label="Menu principal">
    <RouterLink
      v-for="l in links"
      :key="l.to"
      :to="l.to"
      :class="{ 'router-link-active': l.to === '/' && ($route.path === '/' || $route.path.startsWith('/orcamentos')) }"
    >
      <i class="bi" :class="l.icon"></i>
      <span>{{ l.label }}</span>
    </RouterLink>
  </nav>
</template>
