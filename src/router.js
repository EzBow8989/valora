import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/slots', name: 'slots', component: () => import('./views/CategoryView.vue'), meta: { cat: 'slots', title: 'Slots' } },
  { path: '/live-casino', name: 'live', component: () => import('./views/CategoryView.vue'), meta: { cat: 'live', title: 'Live Casino' } },
  { path: '/table-games', name: 'table', component: () => import('./views/CategoryView.vue'), meta: { cat: 'table', title: 'Table Games' } },
  { path: '/jackpots', name: 'jackpots', component: () => import('./views/CategoryView.vue'), meta: { cat: 'jackpot', title: 'Jackpots' } },
  { path: '/instant', name: 'instant', component: () => import('./views/InstantGamesView.vue'), meta: { title: 'Instant Games' } },
  { path: '/instant/:game', name: 'play', component: () => import('./views/PlayView.vue') },
  { path: '/sports', name: 'sports', component: () => import('./views/SportsView.vue'), meta: { title: 'Sports' } },
  { path: '/promotions', name: 'promotions', component: () => import('./views/PromotionsView.vue'), meta: { title: 'Promotions' } },
  { path: '/promotions/:id', name: 'promotion', component: () => import('./views/PromotionDetailView.vue') },
  { path: '/vip', name: 'vip', component: () => import('./views/VipView.vue'), meta: { title: 'VIP Club' } },
  { path: '/game/:id', name: 'game', component: () => import('./views/GameView.vue') },
  { path: '/wallet', name: 'wallet', component: () => import('./views/WalletView.vue'), meta: { auth: true } },
  { path: '/account', name: 'account', component: () => import('./views/AccountView.vue'), meta: { auth: true } },
  { path: '/support', name: 'support', component: () => import('./views/SupportView.vue'), meta: { title: 'Help Center' } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } },
})
