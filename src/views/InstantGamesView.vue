<script setup>
import { INSTANT } from '../data/instant'
</script>

<template>
  <div class="wrap">
    <div class="hero">
      <div>
        <h1>🕹️ Instant Games</h1>
        <p>Provably-simple originals you can play right now — Fun mode is free, Real mode uses your demo wallet.</p>
      </div>
    </div>

    <div class="grid">
      <router-link v-for="g in INSTANT" :key="g.id" :to="`/instant/${g.id}`" class="gcard"
        :style="{ background: `radial-gradient(120% 120% at 30% 15%, ${g.accent}44, #14113a)` }">
        <span class="emoji">{{ g.emoji }}</span>
        <div class="meta">
          <span class="tag" :style="{ color: g.accent }">{{ g.tag }}</span>
          <h3>{{ g.name }}</h3>
          <p>{{ g.blurb }}</p>
        </div>
        <span class="play">Play ▸</span>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.wrap { padding-top: 18px; }
.hero { border-radius: 16px; padding: 26px; margin-bottom: 20px; background: radial-gradient(120% 120% at 80% 0%, #3a1a6b, #12103a); border: 1px solid var(--line); }
h1 { font-size: clamp(24px, 4vw, 34px); margin: 0 0 6px; }
.hero p { margin: 0; color: var(--muted); max-width: 560px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.gcard { position: relative; border: 1px solid var(--line); border-radius: 16px; padding: 22px; min-height: 150px; display: flex; gap: 16px; align-items: center; transition: transform .12s ease; overflow: hidden; }
.gcard:hover { transform: translateY(-3px); }
.emoji { font-size: 46px; filter: drop-shadow(0 6px 12px rgba(0,0,0,.4)); }
.tag { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; }
.meta h3 { margin: 4px 0 4px; font-size: 19px; }
.meta p { margin: 0; color: var(--muted); font-size: 13px; }
.play { position: absolute; right: 16px; bottom: 14px; font-weight: 800; color: #fff; font-size: 13px; }
@media (max-width: 900px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
</style>
