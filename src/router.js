import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/instant', name: 'instant', component: () => import('./views/InstantGamesView.vue'), meta: { title: 'Games' } },
  { path: '/instant/:game', name: 'play', component: () => import('./views/PlayView.vue') },
  { path: '/promotions', name: 'promotions', component: () => import('./views/PromotionsView.vue'), meta: { title: 'Promotions' } },
  { path: '/promotions/:id', name: 'promotion', component: () => import('./views/PromotionDetailView.vue') },
  { path: '/vip', name: 'vip', component: () => import('./views/VipView.vue'), meta: { title: 'VIP Club' } },
  { path: '/wallet', name: 'wallet', component: () => import('./views/WalletView.vue'), meta: { auth: true } },
  { path: '/account', name: 'account', component: () => import('./views/AccountView.vue'), meta: { auth: true } },
  { path: '/support', name: 'support', component: () => import('./views/SupportView.vue'), meta: { title: 'Help Center' } },
  // legacy casino/catalog paths now redirect to the playable games hub
  { path: '/slots', redirect: '/instant' },
  { path: '/live-casino', redirect: '/instant' },
  { path: '/table-games', redirect: '/instant' },
  { path: '/jackpots', redirect: '/instant' },
  { path: '/sports', redirect: '/instant' },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } },
})
