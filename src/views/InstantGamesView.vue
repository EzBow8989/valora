<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { INSTANT, CATEGORIES, byCat } from '../data/instant'

const route = useRoute()
const activeCat = computed(() => route.params.cat || null)
const heading = computed(() => {
  const c = CATEGORIES.find((x) => x.key === activeCat.value)
  return c ? `${c.icon} ${c.label}` : '🎮 All Games'
})
// Either one category, or all categories as sections.
const sections = computed(() => {
  if (activeCat.value) return [{ key: activeCat.value, games: byCat(activeCat.value) }]
  return CATEGORIES.map((c) => ({ key: c.key, label: c.label, icon: c.icon, games: byCat(c.key) })).filter((s) => s.games.length)
})
</script>

<template>
  <div class="wrap">
    <div class="hero">
      <h1>{{ heading }}</h1>
      <p>Every game is playable right now — Fun mode is free, Real mode uses your wallet. Each carries a house edge.</p>
    </div>

    <div class="cattabs">
      <router-link to="/games" class="ct" :class="{ on: !activeCat }">All</router-link>
      <router-link v-for="c in CATEGORIES" :key="c.key" :to="`/games/${c.key}`" class="ct" :class="{ on: activeCat === c.key }">
        {{ c.icon }} {{ c.label }}
      </router-link>
    </div>

    <section v-for="s in sections" :key="s.key" class="section">
      <h2 v-if="!activeCat" class="rail-head-title">{{ s.icon }} {{ s.label }}</h2>
      <div class="grid">
        <router-link v-for="g in s.games" :key="g.id" :to="`/instant/${g.id}`" class="gcard"
          :style="{ background: `radial-gradient(120% 120% at 30% 15%, ${g.accent}44, #14113a)` }">
          <span class="emoji">{{ g.emoji }}</span>
          <div class="meta">
            <span class="tag" :style="{ color: g.accent }">{{ g.tag }}</span>
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
.wrap { padding-top: 18px; }
.hero { border-radius: 16px; padding: 24px; margin-bottom: 18px; background: radial-gradient(120% 120% at 80% 0%, #3a1a6b, #12103a); border: 1px solid var(--line); }
h1 { font-size: clamp(22px, 4vw, 32px); margin: 0 0 6px; }
.hero p { margin: 0; color: var(--muted); max-width: 620px; }
.cattabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 14px; scrollbar-width: none; }
.cattabs::-webkit-scrollbar { display: none; }
.ct { flex-shrink: 0; border: 1px solid var(--line); background: var(--panel); color: var(--muted); border-radius: 999px; padding: 8px 16px; font-weight: 800; font-size: 13.5px; white-space: nowrap; }
.ct.on { background: linear-gradient(135deg,var(--brand-2),var(--brand)); border-color: transparent; color: #fff; }
.rail-head-title { font-size: 18px; margin: 22px 0 12px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.gcard { position: relative; border: 1px solid var(--line); border-radius: 16px; padding: 20px; min-height: 132px; display: flex; gap: 14px; align-items: center; transition: transform .12s ease; overflow: hidden; }
.gcard:hover { transform: translateY(-3px); }
.emoji { font-size: 40px; filter: drop-shadow(0 6px 12px rgba(0,0,0,.4)); }
.tag { font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; }
.meta h3 { margin: 4px 0; font-size: 17px; }
.meta p { margin: 0; color: var(--muted); font-size: 12.5px; }
.jp { position: absolute; top: 10px; right: 10px; font-size: 9.5px; font-weight: 900; padding: 2px 7px; border-radius: 999px; background: linear-gradient(135deg,#ffc53d,#ff9f1c); color: #2a1e00; }
.play { position: absolute; right: 16px; bottom: 14px; font-weight: 800; color: #fff; font-size: 13px; }
@media (max-width: 900px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
</style>
