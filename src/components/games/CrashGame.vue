<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import BetControls from './BetControls.vue'
import { useBank } from '../../lib/bank'

const props = defineProps({ mode: { type: String, default: 'demo' } })
const emit = defineEmits(['update:mode'])
const mode = computed({ get: () => props.mode, set: (v) => emit('update:mode', v) })
const bank = useBank(mode)

const stake = ref(5)
const phase = ref('idle') // idle | running | crashed | cashed
const mult = ref(1)
const crashAt = ref(0)
const cashedAt = ref(0)
const lastWin = ref(0)
const history = ref([])
let raf = 0
let start = 0

// ~4% house edge crash distribution
function rollCrash() {
  const r = Math.random()
  if (r < 0.03) return 1.0 // instant bust
  return Math.max(1.01, Math.floor((0.96 / (1 - r)) * 100) / 100)
}

const progress = computed(() => 1 - 1 / mult.value)

function loop(now) {
  const t = (now - start) / 1000
  mult.value = Math.max(1, Math.pow(Math.E, 0.35 * t))
  if (mult.value >= crashAt.value) {
    mult.value = crashAt.value
    return end(false)
  }
  raf = requestAnimationFrame(loop)
}

function play() {
  if (phase.value === 'running') return
  if (!bank.canBet(stake.value)) return
  if (!bank.bet(stake.value)) return
  crashAt.value = rollCrash()
  cashedAt.value = 0
  lastWin.value = 0
  mult.value = 1
  phase.value = 'running'
  start = performance.now()
  raf = requestAnimationFrame(loop)
}

function cashout() {
  if (phase.value !== 'running') return
  // Can't cash out at or after the crash point — that round is already busted.
  if (mult.value >= crashAt.value) { cancelAnimationFrame(raf); mult.value = crashAt.value; return end(false) }
  cancelAnimationFrame(raf)
  cashedAt.value = mult.value
  const win = stake.value * mult.value
  bank.win(win)
  bank.log(stake.value, win, 'Liftoff (Crash)')
  lastWin.value = win
  phase.value = 'cashed'
  history.value.unshift({ m: mult.value, win: true })
  history.value = history.value.slice(0, 12)
}

function end(_win) {
  cancelAnimationFrame(raf)
  phase.value = 'crashed'
  if (cashedAt.value === 0) bank.log(stake.value, 0, 'Liftoff (Crash)')
  history.value.unshift({ m: crashAt.value, win: false })
  history.value = history.value.slice(0, 12)
}

onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <div class="game">
    <div class="board" :class="phase">
      <div class="hist">
        <span v-for="(h, i) in history" :key="i" :class="h.win ? 'w' : 'l'">{{ h.m.toFixed(2) }}×</span>
      </div>

      <svg class="trail" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path :d="`M6 92 Q ${6 + progress*82} 92 ${6 + progress*82} ${100 - (8 + progress*72)}`"
              fill="none" :stroke="phase==='crashed' ? '#f87171' : '#22d3ee'" stroke-width="2" stroke-linecap="round" opacity="0.85" />
      </svg>
      <div class="nose" :style="{ left: 6 + progress * 82 + '%', bottom: 8 + progress * 72 + '%' }"></div>
      <div class="rocket" :style="{ left: 6 + progress * 82 + '%', bottom: 8 + progress * 72 + '%' }">🚀</div>

      <div class="center">
        <div class="mult" :class="phase">{{ mult.toFixed(2) }}×</div>
        <p v-if="phase === 'idle'" class="hint">Place a bet to launch</p>
        <p v-else-if="phase === 'crashed'" class="bust">💥 Crashed @ {{ crashAt.toFixed(2) }}×</p>
        <p v-else-if="phase === 'cashed'" class="won">Cashed out @ {{ cashedAt.toFixed(2) }}× · +{{ bank.symbol.value }}{{ lastWin.toFixed(2) }}</p>
        <p v-else class="live">Potential: {{ bank.symbol.value }}{{ (stake * mult).toFixed(2) }}</p>
      </div>
    </div>

    <BetControls v-model:stake="stake" v-model:mode="mode" :balance="bank.balance.value" :symbol="bank.symbol.value" :mode="mode" :disabled="phase === 'running'">
      <button v-if="phase !== 'running'" class="btn btn-cta act" :disabled="!bank.canBet(stake)" @click="play">
        Bet {{ bank.symbol.value }}{{ stake.toFixed(2) }}
      </button>
      <button v-else class="btn cashout act" @click="cashout">
        Cash out {{ bank.symbol.value }}{{ (stake * mult).toFixed(2) }}
      </button>
    </BetControls>
  </div>
</template>

<style scoped>
.game { display: grid; grid-template-columns: 1fr 300px; gap: 16px; align-items: start; }
.board { position: relative; aspect-ratio: 16/10; border-radius: 16px; overflow: hidden; border: 1px solid var(--line);
  background: radial-gradient(120% 120% at 20% 90%, #16224a, #0a0820); }
.board.crashed { background: radial-gradient(120% 120% at 20% 90%, #3a1620, #0a0820); }
.hist { position: absolute; top: 10px; left: 10px; right: 10px; display: flex; gap: 6px; flex-wrap: wrap; z-index: 3; }
.hist span { font-size: 11px; font-weight: 800; padding: 2px 7px; border-radius: 999px; }
.hist .w { background: rgba(52,211,153,.18); color: var(--green); }
.hist .l { background: rgba(248,113,113,.16); color: var(--red); }
.trail { position: absolute; inset: 0; width: 100%; height: 100%; }
.nose { position: absolute; width: 14px; height: 14px; border-radius: 999px; background: radial-gradient(circle, #22d3ee, rgba(34,211,238,0) 70%); transform: translate(-50%, 50%); transition: left .05s linear, bottom .05s linear; pointer-events: none; z-index: 1; }
.board.crashed .nose { background: radial-gradient(circle, #f87171, rgba(248,113,113,0) 70%); }
/* rocket exhaust (its lower-left) sits on the trail tip */
.rocket { position: absolute; font-size: 28px; line-height: 1; transform: translate(-18%, 18%); transition: left .05s linear, bottom .05s linear; filter: drop-shadow(0 0 8px #22d3ee); z-index: 2; }
.board.crashed .rocket { filter: grayscale(1) drop-shadow(0 0 8px #f87171); }
.center { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; pointer-events: none; }
.mult { font-size: clamp(38px, 8vw, 68px); font-weight: 900; letter-spacing: -.03em; text-shadow: 0 4px 30px rgba(34,211,238,.4); }
.mult.crashed { color: var(--red); }
.mult.cashed { color: var(--green); }
.hint { color: var(--muted); } .bust { color: var(--red); font-weight: 800; }
.won { color: var(--green); font-weight: 800; } .live { color: var(--cyan); font-weight: 700; }
.act { width: 100%; padding: 14px; font-size: 16px; }
.cashout { background: linear-gradient(135deg,#34d399,#0e7490); color: #04140d; }
@media (max-width: 780px) { .game { grid-template-columns: 1fr; } }
</style>
