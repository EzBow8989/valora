<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { byId } from '../data/games'
import { useUserStore } from '../store/user'
import { thumb } from '../lib/thumb'

const route = useRoute()
const router = useRouter()
const store = useUserStore()

const game = computed(() => byId(route.params.id))
const mode = ref(route.query.mode === 'demo' ? 'demo' : 'real')

// launch lifecycle: loading -> ready | error
const phase = ref('loading')
const errorMsg = ref('')
const stake = ref(1)
const demoCredits = ref(5000)
const lastResult = ref(null)
const surface = computed(() => (game.value ? thumb(game.value.title, game.value.cat, 'wide') : ''))

function launch() {
  phase.value = 'loading'
  errorMsg.value = ''
  if (!game.value) { phase.value = 'error'; errorMsg.value = 'This game could not be found.'; return }
  if (mode.value === 'real' && !store.isAuthed) {
    phase.value = 'error'; errorMsg.value = 'auth'; return
  }
  if (mode.value === 'demo' && !game.value.demo) {
    phase.value = 'error'; errorMsg.value = 'Demo play is not available for live tables. Switch to real mode to play.'; return
  }
  // Simulate provider handshake with a small chance of maintenance error.
  setTimeout(() => {
    const down = /-3$|-7$/.test(game.value.id) // deterministic "maintenance" for a couple of ids
    if (down) { phase.value = 'error'; errorMsg.value = 'maintenance'; return }
    store.pushRecent(game.value.id)
    phase.value = 'ready'
  }, 900)
}

function spin() {
  if (mode.value === 'demo') {
    const win = Math.random() < 0.42 ? stake.value * (1 + Math.random() * 3) : 0
    demoCredits.value = Math.max(0, demoCredits.value - stake.value + win)
    lastResult.value = { win, demo: true }
    return
  }
  const res = store.settleRound(stake.value)
  if (!res.ok) { lastResult.value = { error: res.reason }; return }
  lastResult.value = { win: res.win, demo: false }
}

function setMode(m) { mode.value = m; router.replace({ query: { ...route.query, mode: m } }); launch() }

const container = ref(null)
function fullscreen() {
  const el = container.value
  if (!el) return
  if (document.fullscreenElement) document.exitFullscreen()
  else el.requestFullscreen?.().catch(() => {})
}

watch(() => route.params.id, launch)
onMounted(launch)
</script>

<template>
  <div class="container wrap">
    <button class="back" @click="router.back()">← Back to lobby</button>

    <div v-if="game" class="head">
      <div>
        <h1>{{ game.title }}</h1>
        <p class="prov">{{ game.provider }} · RTP {{ game.rtp.toFixed(2) }}% · {{ game.volatility }} volatility</p>
      </div>
      <div class="modes">
        <button :class="{ on: mode === 'real' }" @click="setMode('real')">Real</button>
        <button :class="{ on: mode === 'demo' }" :disabled="!game.demo" @click="setMode('demo')">Demo</button>
      </div>
    </div>

    <div ref="container" class="stage" :class="mode">
      <!-- Loading -->
      <div v-if="phase === 'loading'" class="state">
        <div class="spinner"></div>
        <p>Connecting to {{ game ? game.provider : 'provider' }}…</p>
      </div>

      <!-- Errors with specific recovery -->
      <div v-else-if="phase === 'error'" class="state error">
        <template v-if="errorMsg === 'auth'">
          <p class="big">Login required for real-money play</p>
          <p class="sub">You can try this game in demo mode, or log in to play for real.</p>
          <div class="row">
            <button class="btn btn-cta" @click="$emit('auth', 'login')">Login</button>
            <button v-if="game && game.demo" class="btn btn-ghost" @click="setMode('demo')">Play demo</button>
          </div>
        </template>
        <template v-else-if="errorMsg === 'maintenance'">
          <p class="big">🛠️ Game under maintenance</p>
          <p class="sub">{{ game.provider }} is temporarily unavailable. Please try another game.</p>
          <div class="row">
            <button class="btn btn-ghost" @click="launch">Retry</button>
            <router-link class="btn btn-brand" :to="{ name: 'slots' }">Browse games</router-link>
          </div>
        </template>
        <template v-else>
          <p class="big">Couldn't launch this game</p>
          <p class="sub">{{ errorMsg }}</p>
          <div class="row">
            <button class="btn btn-ghost" @click="launch">Retry</button>
            <router-link class="btn btn-brand" :to="{ name: 'slots' }">Browse games</router-link>
          </div>
        </template>
      </div>

      <!-- Ready: mock game surface (stands in for the provider iframe) -->
      <div v-else class="surface" :style="{ backgroundImage: `url(${surface})` }">
        <div class="mode-flag" :class="mode">{{ mode === 'demo' ? 'DEMO — no real money' : 'REAL MONEY' }}</div>
        <button class="fs" aria-label="Fullscreen" @click="fullscreen">⛶</button>

        <div class="panel-play">
          <div class="wallet-line">
            <span v-if="mode === 'demo'">Demo credits: <b>{{ demoCredits.toFixed(2) }}</b></span>
            <span v-else>Balance: <b>{{ store.symbol }}{{ store.total.toFixed(2) }}</b></span>
          </div>

          <div v-if="lastResult" class="result" :class="{ win: lastResult.win > 0, err: lastResult.error }">
            <template v-if="lastResult.error">{{ lastResult.error }}</template>
            <template v-else-if="lastResult.win > 0">You won {{ mode === 'demo' ? '' : store.symbol }}{{ lastResult.win.toFixed(2) }}! 🎉</template>
            <template v-else>No win this round — try again.</template>
          </div>

          <div class="controls">
            <label>Stake
              <input v-model.number="stake" type="number" min="0.2" step="0.2" />
            </label>
            <button class="btn btn-cta spin" :disabled="mode === 'real' && stake > store.balance" @click="spin">Spin</button>
          </div>
          <p v-if="mode === 'real' && stake > store.balance" class="insuf">
            Insufficient balance. <router-link to="/wallet">Deposit</router-link> to keep playing.
          </p>
        </div>
      </div>
    </div>

    <p class="disclaimer">This is a demo game surface, not a real gambling product. Rounds are simulated locally.</p>
  </div>
</template>

<style scoped>
.wrap { padding-top: 16px; }
.back { background: none; border: 0; color: var(--muted); font-weight: 700; padding: 6px 0; }
.head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin: 6px 0 14px; }
h1 { font-size: clamp(20px, 3vw, 28px); margin: 0; }
.prov { color: var(--muted); font-size: 13px; margin: 4px 0 0; }
.modes { display: flex; gap: 4px; background: var(--bg-2); border: 1px solid var(--line); border-radius: 10px; padding: 4px; }
.modes button { border: 0; background: none; color: var(--muted); font-weight: 800; padding: 8px 18px; border-radius: 8px; }
.modes button.on { background: linear-gradient(135deg,var(--brand-2),var(--brand)); color: #fff; }
.modes button:disabled { opacity: .4; }
.stage { position: relative; aspect-ratio: 16/9; border-radius: 16px; overflow: hidden; border: 1px solid var(--line); background: #05040f; display: grid; place-items: center; }
.state { text-align: center; display: grid; gap: 12px; place-items: center; padding: 20px; }
.state .big { font-size: 20px; font-weight: 800; margin: 0; }
.state .sub { color: var(--muted); margin: 0; max-width: 420px; }
.row { display: flex; gap: 10px; margin-top: 6px; }
.spinner { width: 44px; height: 44px; border-radius: 999px; border: 4px solid var(--line); border-top-color: var(--brand-2); animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.surface { position: relative; width: 100%; height: 100%; background-size: cover; background-position: center; }
.mode-flag { position: absolute; top: 12px; left: 12px; font-size: 11px; font-weight: 800; padding: 5px 10px; border-radius: 999px; letter-spacing: .04em; }
.mode-flag.demo { background: #22d3ee; color: #04121a; }
.mode-flag.real { background: var(--cta); color: #fff; }
.fs { position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; border-radius: 8px; border: 0; background: rgba(0,0,0,.4); color: #fff; font-size: 16px; }
.panel-play { position: absolute; left: 0; right: 0; bottom: 0; padding: 16px; background: linear-gradient(0deg, rgba(5,4,15,.92), transparent); }
.wallet-line { font-size: 13.5px; color: #ddd; margin-bottom: 8px; }
.result { font-weight: 800; margin-bottom: 8px; }
.result.win { color: var(--green); }
.result.err { color: var(--red); }
.controls { display: flex; gap: 10px; align-items: flex-end; }
.controls label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--muted); font-weight: 700; }
.controls input { width: 110px; background: var(--bg-2); border: 1px solid var(--line); border-radius: 8px; padding: 9px 12px; color: var(--text); font-size: 15px; }
.spin { padding: 11px 30px; }
.insuf { color: var(--red); font-size: 12.5px; margin: 8px 0 0; }
.insuf a { color: var(--cta); font-weight: 700; }
.disclaimer { color: var(--muted); font-size: 12px; text-align: center; margin: 16px 0; }
@media (max-width: 560px) { .head { flex-direction: column; } }
</style>
