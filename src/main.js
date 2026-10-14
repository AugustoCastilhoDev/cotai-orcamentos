import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './styles/main.scss'

import App from './App.vue'
import router from './router'
import { requestPersistentStorage } from './db'
// Registra cedo o listener de instalação do PWA (o navegador pode disparar antes do app montar)
import './composables/useInstall'
import { useCompanyStore } from './stores/company'
import { useClientsStore } from './stores/clients'
import { useCatalogStore } from './stores/catalog'
import { useQuotesStore } from './stores/quotes'

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)

  try {
    await Promise.all([
      useCompanyStore().load(),
      useClientsStore().load(),
      useCatalogStore().load(),
      useQuotesStore().load()
    ])
  } catch (err) {
    console.error(err)
    document.getElementById('app').innerHTML =
      '<div style="padding:2rem;font-family:system-ui">Não foi possível abrir o banco de dados local. ' +
      'Verifique se o navegador não está em modo privativo ou bloqueando o armazenamento de sites.</div>'
    return
  }

  app.use(router)
  app.mount('#app')
  requestPersistentStorage()
}

bootstrap()
