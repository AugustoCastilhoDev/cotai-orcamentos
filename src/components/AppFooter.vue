<script setup>
import config from '@/config'

defineEmits(['support'])
const year = new Date().getFullYear()
const publisherUrl = config.publisher.url
</script>

<template>
  <footer class="app-footer border-top mt-5 pt-3 text-center">
    <p class="mb-2">
      {{ config.appName }} · um produto
      <a v-if="publisherUrl" :href="publisherUrl" target="_blank" rel="noopener" class="fw-semibold">{{ config.publisher.name }}</a>
      <RouterLink v-else to="/sobre" class="fw-semibold">{{ config.publisher.name }}</RouterLink>
    </p>
    <p v-if="config.publisher.instagram" class="mb-2">
      <a
        :href="`https://www.instagram.com/${config.publisher.instagram}/`"
        target="_blank"
        rel="noopener"
        :aria-label="`Instagram @${config.publisher.instagram}`"
      >
        <i class="bi bi-instagram"></i> @{{ config.publisher.instagram }}
      </a>
    </p>
    <p class="mb-2 d-flex flex-wrap justify-content-center align-items-center gap-2">
      <span><i class="bi bi-shield-lock"></i> Seus dados ficam só neste aparelho.</span>
      <RouterLink to="/privacidade">Privacidade</RouterLink>
      <span aria-hidden="true">·</span>
      <RouterLink to="/sobre">Sobre</RouterLink>
      <template v-if="config.pix.key">
        <span aria-hidden="true">·</span>
        <button type="button" class="btn btn-link btn-support p-0" @click="$emit('support')">
          <i class="bi bi-heart"></i> Apoie este projeto
        </button>
      </template>
    </p>
    <p class="mb-0 small">© {{ year }} {{ config.publisher.legalName }}</p>
  </footer>
</template>
