import { createRouter, createWebHistory } from 'vue-router'
import QuotesView from './views/QuotesView.vue'
import config from './config'

const routes = [
  { path: '/', name: 'quotes', component: QuotesView, meta: { title: 'Orçamentos' } },
  { path: '/orcamentos/novo', name: 'quote-new', component: () => import('./views/QuoteEditView.vue'), meta: { title: 'Novo orçamento' } },
  { path: '/orcamentos/:id(\\d+)', name: 'quote-edit', component: () => import('./views/QuoteEditView.vue'), props: true, meta: { title: 'Orçamento' } },
  { path: '/clientes', name: 'clients', component: () => import('./views/ClientsView.vue'), meta: { title: 'Clientes' } },
  { path: '/catalogo', name: 'catalog', component: () => import('./views/CatalogView.vue'), meta: { title: 'Catálogo' } },
  { path: '/empresa', name: 'company', component: () => import('./views/CompanyView.vue'), meta: { title: 'Minha empresa' } },
  { path: '/backup', name: 'backup', component: () => import('./views/BackupView.vue'), meta: { title: 'Backup' } },
  { path: '/sobre', name: 'about', component: () => import('./views/AboutView.vue'), meta: { title: 'Sobre' } },
  { path: '/privacidade', name: 'privacy', component: () => import('./views/PrivacyView.vue'), meta: { title: 'Privacidade' } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./views/NotFoundView.vue'), meta: { title: 'Página não encontrada' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    return saved || { top: 0 }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | ${config.appName}` : `${config.appName} - ${config.slogan}`
})

export default router
