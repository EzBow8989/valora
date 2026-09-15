<script setup>
import { computed } from 'vue'
import { useUserStore } from '../store/user'
import { rail, byId } from '../data/games'
import { INSTANT } from '../data/instant'
import HeroCarousel from '../components/HeroCarousel.vue'
import ActivityScreen from '../components/ActivityScreen.vue'
import GameRail from '../components/GameRail.vue'

const store = useUserStore()

const popular = computed(() => rail('popular', 12))
const recent = computed(() => store.recent.map(byId).filter(Boolean))
const favs = computed(() => store.favourites.map(byId).filter(Boolean))
</script>

<template>
  <div>
    <HeroCarousel />

    <ActivityScreen />

    <section class="container instant">
      <div class="rail-head"><h2>🕹️ Instant Games</h2><router-link to="/instant" class="see-all">See all →</router-link></div>
      <div class="ig-row">
        <router-link v-for="g in INSTANT" :key="g.id" :to="`/instant/${g.id}`" class="ig"
          :style="{ background: `radial-gradient(120% 120% at 30% 15%, ${g.accent}55, #14113a)` }">
          <span class="e">{{ g.emoji }}</span>
          <span class="n">{{ g.name }}</span>
          <span class="t">{{ g.tag }}</span>
        </router-link>
      </div>
    </section>

    <GameRail v-if="recent.length" title="Continue Playing" icon="🕑" :games="recent" />
    <GameRail v-if="favs.length" title="Your Favourites" icon="❤️" :games="favs" />
    <GameRail title="Top Games" icon="🔥" :games="popular" :to="{ name: 'slots', query: { sort: 'popular' } }" />
    <GameRail title="New Releases" icon="✨" :games="rail('new', 12)" :to="{ name: 'slots', query: { sort: 'new' } }" />
    <GameRail title="Jackpots" icon="💎" :games="rail('jackpot', 6)" :to="{ name: 'jackpots' }" />
    <GameRail title="Live Casino" icon="🎥" :games="rail('live', 8)" :to="{ name: 'live' }" />
  </div>
</template>

<style scoped>
.instant { margin-top: 8px; }
.ig-row { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(140px, 1fr); gap: 12px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
.ig-row::-webkit-scrollbar { display: none; }
.ig { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 18px 10px; border: 1px solid var(--line); border-radius: 14px; text-align: center; transition: transform .12s ease; }
.ig:hover { transform: translateY(-3px); }
.ig .e { font-size: 34px; }
.ig .n { font-weight: 800; font-size: 13.5px; }
.ig .t { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; }
@media (min-width: 900px) { .ig-row { grid-auto-columns: minmax(150px, 1fr); } }
</style>
