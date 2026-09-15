<script setup>
import { ref } from 'vue'
import GameCard from './GameCard.vue'

defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  games: { type: Array, required: true },
  to: { type: [String, Object], default: null },
})

const track = ref(null)
function scroll(dir) {
  track.value?.scrollBy({ left: dir * track.value.clientWidth * 0.8, behavior: 'smooth' })
}
</script>

<template>
  <section class="container">
    <div class="rail-head">
      <h2><span v-if="icon">{{ icon }}</span> {{ title }}</h2>
      <div class="right">
        <router-link v-if="to" :to="to" class="see-all">See all →</router-link>
        <button class="nav" aria-label="Scroll left" @click="scroll(-1)">‹</button>
        <button class="nav" aria-label="Scroll right" @click="scroll(1)">›</button>
      </div>
    </div>
    <div ref="track" class="track">
      <div v-for="g in games" :key="g.id" class="cell"><GameCard :game="g" /></div>
    </div>
  </section>
</template>

<style scoped>
.right { display: flex; align-items: center; gap: 8px; }
.nav {
  width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--line);
  background: var(--panel); color: var(--text); font-size: 18px; line-height: 1;
}
.nav:hover { background: var(--panel-3); }
.track {
  display: grid; grid-auto-flow: column; grid-auto-columns: minmax(150px, 1fr);
  gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 4px;
  scrollbar-width: none;
}
.track::-webkit-scrollbar { display: none; }
.cell { scroll-snap-align: start; }
@media (min-width: 720px) { .track { grid-auto-columns: minmax(170px, 1fr); } }
@media (max-width: 520px) { .track { grid-auto-columns: minmax(132px, 1fr); } .nav { display: none; } }
</style>
