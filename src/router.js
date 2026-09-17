import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/games', name: 'games', component: () => import('./views/InstantGamesView.vue'), meta: { title: 'Games' } },
  { path: '/games/:cat', name: 'games-cat', component: () => import('./views/InstantGamesView.vue') },
  { path: '/instant/:game', name: 'play', component: () => import('./views/PlayView.vue') },
  { path: '/promotions', name: 'promotions', component: () => import('./views/PromotionsView.vue'), meta: { title: 'Promotions' } },
  { path: '/promotions/:id', name: 'promotion', component: () => import('./views/PromotionDetailView.vue') },
  { path: '/vip', name: 'vip', component: () => import('./views/VipView.vue'), meta: { title: 'VIP Club' } },
  { path: '/wallet', name: 'wallet', component: () => import('./views/WalletView.vue'), meta: { auth: true } },
  { path: '/account', name: 'account', component: () => import('./views/AccountView.vue'), meta: { auth: true } },
  { path: '/support', name: 'support', component: () => import('./views/SupportView.vue'), meta: { title: 'Help Center' } },
  { path: '/lab', name: 'lab', component: () => import('./views/LabView.vue'), meta: { title: 'Strategy Lab' } },
  // category / legacy paths
  { path: '/instant', redirect: '/games' },
  { path: '/slots', redirect: '/games/slots' },
  { path: '/table-games', redirect: '/games/table' },
  { path: '/jackpots', redirect: '/games/jackpot' },
  { path: '/live-casino', redirect: '/games/table' },
  { path: '/sports', redirect: '/games' },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } },
})
