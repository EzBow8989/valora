<script setup>
import { computed } from 'vue'
import { useUserStore } from '../store/user'
import { rail, byId, CATEGORIES } from '../data/games'
import HeroCarousel from '../components/HeroCarousel.vue'
import WinnersTicker from '../components/WinnersTicker.vue'
import GameRail from '../components/GameRail.vue'

const store = useUserStore()

const catTiles = [
  { to: '/slots', label: 'Slots', icon: '🎰', g: ['#7c4dff', '#ff2d78'] },
  { to: '/live-casino', label: 'Live Casino', icon: '🎥', g: ['#ef4444', '#7c4dff'] },
  { to: '/table-games', label: 'Table Games', icon: '🃏', g: ['#22d3ee', '#3b82f6'] },
  { to: '/jackpots', label: 'Jackpots', icon: '💎', g: ['#ffc53d', '#ff9f1c'] },
  { to: '/sports', label: 'Sports', icon: '⚽', g: ['#34d399', '#0e7490'] },
  { to: '/promotions', label: 'Promotions', icon: '🎁', g: ['#b47bff', '#7c4dff'] },
]

const gotw = computed(() => rail('crash', 6))
const popular = computed(() => rail('popular', 12))
const recent = computed(() => store.recent.map(byId).filter(Boolean))
const favs = computed(() => store.favourites.map(byId).filter(Boolean))
</script>

<template>
  <div>
    <HeroCarousel />

    <section class="container tiles">
      <router-link v-for="c in catTiles" :key="c.label" :to="c.to" class="tile"
        :style="{ background: `linear-gradient(135deg, ${c.g[0]}, ${c.g[1]})` }">
        <span class="i">{{ c.icon }}</span>
        <span class="l">{{ c.label }}</span>
      </router-link>
    </section>

    <div class="ticker-wrap"><WinnersTicker /></div>

    <GameRail v-if="recent.length" title="Continue Playing" icon="🕑" :games="recent" />
    <GameRail v-if="favs.length" title="Your Favourites" icon="❤️" :games="favs" />
    <GameRail title="Game of the Week" icon="🚀" :games="gotw" :to="{ name: 'slots' }" />
    <GameRail title="Most Popular" icon="🔥" :games="popular" :to="{ name: 'slots', query: { sort: 'popular' } }" />
    <GameRail title="New Releases" icon="✨" :games="rail('new', 12)" :to="{ name: 'slots', query: { sort: 'new' } }" />
    <GameRail title="Jackpots" icon="💎" :games="rail('jackpot', 6)" :to="{ name: 'jackpots' }" />
    <GameRail title="Live Casino" icon="🎥" :games="rail('live', 8)" :to="{ name: 'live' }" />
  </div>
</template>

<style scoped>
.tiles { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-top: 18px; }
.tile { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 18px 8px; border-radius: 14px; font-weight: 800; color: #fff; text-align: center; box-shadow: 0 8px 22px -12px #000; transition: transform .12s ease; }
.tile:hover { transform: translateY(-2px); }
.tile .i { font-size: 26px; }
.tile .l { font-size: 13px; }
.ticker-wrap { margin-top: 22px; }
@media (max-width: 720px) { .tiles { grid-template-columns: repeat(3, 1fr); } }
</style>
