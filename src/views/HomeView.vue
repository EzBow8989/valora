<script setup>
import HeroCarousel from '../components/HeroCarousel.vue'
import ActivityScreen from '../components/ActivityScreen.vue'
import { CATEGORIES, byCat } from '../data/instant'

const rails = CATEGORIES.map((c) => ({ ...c, games: byCat(c.key) })).filter((r) => r.games.length)
</script>

<template>
  <div>
    <HeroCarousel />

    <ActivityScreen />

    <section v-for="r in rails" :key="r.key" class="container games">
      <div class="rail-head">
        <h2>{{ r.icon }} {{ r.label }}</h2>
        <router-link :to="`/games/${r.key}`" class="see-all">See all →</router-link>
      </div>
      <div class="grid">
        <router-link v-for="g in r.games" :key="g.id" :to="`/instant/${g.id}`" class="gcard"
          :style="{ background: `radial-gradient(120% 120% at 30% 15%, ${g.accent}55, #14113a)` }">
          <span class="e">{{ g.emoji }}</span>
          <div class="meta">
            <span class="t" :style="{ color: g.accent }">{{ g.tag }}</span>
            <h3>{{ g.name }}</h3>
            <p>{{ g.blurb }}</p>
          </div>
          <span v-if="g.jackpot" class="jp">JACKPOT</span>
          <span class="play">Play ▸</span>
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.games { margin-top: 8px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.gcard { position: relative; border: 1px solid var(--line); border-radius: 16px; padding: 20px; min-height: 140px; display: flex; gap: 14px; align-items: center; transition: transform .12s ease; overflow: hidden; }
.gcard:hover { transform: translateY(-3px); }
.e { font-size: 42px; filter: drop-shadow(0 6px 12px rgba(0,0,0,.4)); }
.t { font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; }
.meta h3 { margin: 4px 0; font-size: 18px; }
.meta p { margin: 0; color: var(--muted); font-size: 12.5px; }
.play { position: absolute; right: 16px; bottom: 14px; font-weight: 800; color: #fff; font-size: 13px; }
.jp { position: absolute; top: 10px; right: 10px; font-size: 9.5px; font-weight: 900; padding: 2px 7px; border-radius: 999px; background: linear-gradient(135deg,#ffc53d,#ff9f1c); color: #2a1e00; }
@media (max-width: 900px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
</style>
