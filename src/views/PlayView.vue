<script setup>
import { computed, ref, watch, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { instantById, INSTANT } from '../data/instant'
import { useUserStore } from '../store/user'

const route = useRoute()
const router = useRouter()
const store = useUserStore()

const SlotsGame = defineAsyncComponent(() => import('../components/games/SlotsGame.vue'))
const COMPONENTS = {
  crash: defineAsyncComponent(() => import('../components/games/CrashGame.vue')),
  mines: defineAsyncComponent(() => import('../components/games/MinesGame.vue')),
  dice: defineAsyncComponent(() => import('../components/games/DiceGame.vue')),
  wheel: defineAsyncComponent(() => import('../components/games/WheelGame.vue')),
  plinko: defineAsyncComponent(() => import('../components/games/PlinkoGame.vue')),
  hilo: defineAsyncComponent(() => import('../components/games/HiloGame.vue')),
  coinflip: defineAsyncComponent(() => import('../components/games/CoinFlipGame.vue')),
  roulette: defineAsyncComponent(() => import('../components/games/RouletteGame.vue')),
  blackjack: defineAsyncComponent(() => import('../components/games/BlackjackGame.vue')),
  dragontiger: defineAsyncComponent(() => import('../components/games/DragonTigerGame.vue')),
  slots: SlotsGame,
  'slots-fruit': SlotsGame,
  'slots-gem': SlotsGame,
}

const meta = computed(() => instantById(route.params.game))
const comp = computed(() => COMPONENTS[route.params.game] || null)
const mode = ref('demo')

const others = computed(() => INSTANT.filter((g) => g.id !== route.params.game))

watch(() => route.params.game, () => {
  document.title = meta.value ? `${meta.value.name} — Valora` : 'Valora'
  // real mode requires login; fall back to fun mode otherwise
  if (mode.value === 'real' && !store.isAuthed) mode.value = 'demo'
}, { immediate: true })

function setMode(m) {
  if (m === 'real' && !store.isAuthed) return
  mode.value = m
}
</script>

<template>
  <div v-if="meta && comp" class="wrap">
    <button class="back" @click="router.push('/instant')">← All instant games</button>

    <div class="head">
      <div class="title">
        <span class="emoji" :style="{ background: meta.accent + '33', color: meta.accent }">{{ meta.emoji }}</span>
        <div>
          <h1>{{ meta.name }}</h1>
          <p>{{ meta.tag }} · {{ meta.blurb }}</p>
        </div>
      </div>
      <div v-if="mode === 'real' && !store.isAuthed" class="loginhint">
        <button class="btn btn-cta" @click="$emit('auth', 'login')">Log in for real play</button>
      </div>
    </div>

    <component :is="comp" v-model:mode="mode" @auth="$emit('auth', $event)" />

    <p class="disclaimer">
      Demo game — outcomes are generated locally in your browser for entertainment.
      No real money is involved.
      <span v-if="mode === 'real'">“Real” mode uses your demo wallet balance.</span>
      <span v-else>“Fun” mode uses free credits.</span>
    </p>

    <h3 class="more-title">More instant games</h3>
    <div class="more">
      <router-link v-for="g in others" :key="g.id" :to="`/instant/${g.id}`" class="mini" :style="{ borderColor: g.accent + '55' }">
        <span class="me" :style="{ color: g.accent }">{{ g.emoji }}</span>
        <span class="mn">{{ g.name }}</span>
      </router-link>
    </div>
  </div>

  <div v-else class="wrap notfound">
    <p>🎮 That game isn’t available.</p>
    <router-link to="/instant" class="btn btn-brand">Browse instant games</router-link>
  </div>
</template>

<style scoped>
.wrap { padding: 16px 4px 0; }
.back { background: none; border: 0; color: var(--muted); font-weight: 700; padding: 6px 0; }
.head { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin: 6px 0 16px; flex-wrap: wrap; }
.title { display: flex; align-items: center; gap: 14px; }
.emoji { width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center; font-size: 26px; }
h1 { font-size: clamp(20px, 3vw, 28px); margin: 0; }
.title p { margin: 3px 0 0; color: var(--muted); font-size: 13px; }
.disclaimer { color: var(--muted); font-size: 12px; text-align: center; margin: 18px 0; }
.more-title { font-size: 16px; margin: 22px 0 12px; }
.more { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
.mini { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 8px; border: 1px solid var(--line); border-radius: 12px; background: var(--panel-2); }
.mini:hover { background: var(--panel-3); transform: translateY(-2px); transition: .12s; }
.me { font-size: 24px; } .mn { font-size: 12px; font-weight: 700; text-align: center; }
.notfound { text-align: center; padding: 70px 0; display: grid; gap: 16px; place-items: center; }
@media (max-width: 780px) { .more { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 480px) { .more { grid-template-columns: repeat(3, 1fr); } }
</style>
