<script setup>
import { ref } from 'vue'
import AppNav from './components/AppNav.vue'
import AppFooter from './components/AppFooter.vue'
import ToastContainer from './components/ToastContainer.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import SupportPixModal from './components/SupportPixModal.vue'

const showSupport = ref(false)
</script>

<template>
  <AppNav @support="showSupport = true" />
  <main class="app-main">
    <div class="container app-container">
      <RouterView />
      <AppFooter @support="showSupport = true" />
    </div>
  </main>
  <ToastContainer />
  <ConfirmDialog />
  <SupportPixModal :show="showSupport" @close="showSupport = false" />
</template>
