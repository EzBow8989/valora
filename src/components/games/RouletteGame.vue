<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import BetControls from './BetControls.vue'
import { useBank } from '../../lib/bank'

const props = defineProps({ mode: { type: String, default: 'demo' } })
const emit = defineEmits(['update:mode'])
const mode = computed({ get: () => props.mode, set: (v) => emit('update:mode', v) })
const bank = useBank(mode)

const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36])
const colorOf = (n) => (n === 0 ? 'green' : RED.has(n) ? 'red' : 'black')

// Single-zero roulette: every bet returns ~97.3% (2.7% house edge from the 0).
const BETS = [
  { key: 'red', label: 'Red', pay: 2, test: (n) => colorOf(n) === 'red' },
  { key: 'black', label: 'Black', pay: 2, test: (n) => colorOf(n) === 'black' },
  { key: 'odd', label: 'Odd', pay: 2, test: (n) => n !== 0 && n % 2 === 1 },
  { key: 'even', label: 'Even', pay: 2, test: (n) => n !== 0 && n % 2 === 0 },
  { key: 'low', label: '1–18', pay: 2, test: (n) => n >= 1 && n <= 18 },
  { key: 'high', label: '19–36', pay: 2, test: (n) => n >= 19 && n <= 36 },
  { key: 'd1', label: '1st 12', pay: 3, test: (n) => n >= 1 && n <= 12 },
  { key: 'd2', label: '2nd 12', pay: 3, test: (n) => n >= 13 && n <= 24 },
  { key: 'd3', label: '3rd 12', pay: 3, test: (n) => n >= 25 && n <= 36 },
]

const stake = ref(5)
const pick = ref('red')
const straight = ref(false)
const number = ref(7)
const spinning = ref(false)
const display = ref(null)
const outcome = ref(null)
const history = ref([])
let iv = 0

function spin() {
  if (spinning.value || !bank.canBet(stake.value)) return
  if (!bank.bet(stake.value)) return
  spinning.value = true
  outcome.value = null
  const result = Math.floor(Math.random() * 37)
  let ticks = 0
  iv = setInterval(() => {
    display.value = Math.floor(Math.random() * 37)
    if (++ticks > 16) {
      clearInterval(iv)
      display.value = result
      let won, pay
      if (straight.value) { won = result === Number(number.value); pay = 36 }
      else { const b = BETS.find((x) => x.key === pick.value); won = b.test(result); pay = b.pay }
      const win = won ? stake.value * pay : 0
      if (win > 0) bank.win(win)
      bank.log(stake.value, win, 'European Roulette')
      outcome.value = { result, won, win }
      history.value.unshift(result)
      history.value = history.value.slice(0, 14)
      spinning.value = false
    }
  }, 90)
}

onBeforeUnmount(() => clearInterval(iv))
</script>

<template>
  <div class="game">
    <div class="left">
      <div class="table">
        <div class="ball" :class="display === null ? '' : colorOf(display)">
          <span>{{ display === null ? '—' : display }}</span>
        </div>
        <div class="out" :class="outcome && (outcome.won ? 'win' : 'lose')">
          <template v-if="outcome">
            <b v-if="outcome.won" class="win">{{ outcome.result }} {{ colorOf(outcome.result) }} · +{{ bank.symbol.value }}{{ outcome.win.toFixed(2) }} 🎉</b>
            <b v-else class="lose">{{ outcome.result }} {{ colorOf(outcome.result) }} — no win</b>
          </template>
          <span v-else>Place a bet and spin the wheel</span>
        </div>
        <div class="hist">
          <span v-for="(h, i) in history" :key="i" class="chip" :class="colorOf(h)">{{ h }}</span>
        </div>
      </div>
    </div>

    <BetControls v-model:stake="stake" v-model:mode="mode" :balance="bank.balance.value" :symbol="bank.symbol.value" :mode="mode" :disabled="spinning">
      <div class="tabs">
        <button :class="{ on: !straight }" :disabled="spinning" @click="straight = false">Outside</button>
        <button :class="{ on: straight }" :disabled="spinning" @click="straight = true">Straight 35:1</button>
      </div>
      <div v-if="!straight" class="grid">
        <button v-for="b in BETS" :key="b.key" class="opt" :class="[b.key, { on: pick === b.key }]" :disabled="spinning" @click="pick = b.key">
          {{ b.label }}
        </button>
      </div>
      <label v-else class="straight">Number (0–36)
        <input v-model.number="number" type="number" min="0" max="36" :disabled="spinning" />
      </label>
      <button class="btn btn-cta act" :disabled="spinning || !bank.canBet(stake)" @click="spin">
        {{ spinning ? 'Spinning…' : `Spin · ${bank.symbol.value}${stake.toFixed(2)}` }}
      </button>
    </BetControls>
  </div>
</template>

<style scoped>
.game { display: grid; grid-template-columns: 1fr 300px; gap: 16px; align-items: start; }
.table { background: radial-gradient(120% 120% at 50% 0%, #0d3b26, #06201400); border: 1px solid var(--line); border-radius: 18px; padding: 34px; text-align: center; background-color: #08281a; }
.ball { width: 130px; height: 130px; border-radius: 999px; margin: 0 auto; display: grid; place-items: center; font-weight: 900; font-size: 46px; color: #fff; border: 4px solid rgba(255,255,255,.15); box-shadow: 0 14px 40px rgba(0,0,0,.5); }
.ball.red { background: radial-gradient(circle at 35% 30%, #ff6b6b, #c81e2e); }
.ball.black { background: radial-gradient(circle at 35% 30%, #4b5563, #111827); }
.ball.green { background: radial-gradient(circle at 35% 30%, #34d399, #0e7a4e); }
.out { margin-top: 20px; color: #bfeede; font-weight: 700; min-height: 24px; text-transform: capitalize; }
.out .win { color: #6ee7b7; font-size: 18px; } .out .lose { color: #fca5a5; }
.hist { display: flex; gap: 5px; flex-wrap: wrap; justify-content: center; margin-top: 12px; }
.chip { min-width: 24px; height: 24px; padding: 0 5px; border-radius: 6px; display: grid; place-items: center; font-size: 11px; font-weight: 800; color: #fff; }
.chip.red { background: #c81e2e; } .chip.black { background: #111827; } .chip.green { background: #0e7a4e; }
.tabs { display: flex; gap: 6px; background: var(--bg-2); border: 1px solid var(--line); border-radius: 10px; padding: 4px; }
.tabs button { flex: 1; border: 0; background: none; color: var(--muted); font-weight: 800; padding: 8px; border-radius: 8px; font-size: 12.5px; }
.tabs button.on { background: linear-gradient(135deg,var(--brand-2),var(--brand)); color: #fff; }
.grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
.opt { border: 1px solid var(--line); background: var(--panel-3); color: #fff; border-radius: 9px; padding: 11px 4px; font-weight: 800; font-size: 12.5px; }
.opt.red { background: #7f1620; } .opt.black { background: #1f2733; }
.opt.on { outline: 2px solid var(--gold); }
.straight { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: var(--muted); font-weight: 700; }
.straight input { background: var(--bg-2); border: 1px solid var(--line); border-radius: 9px; padding: 11px 13px; color: var(--text); font-size: 16px; outline: none; }
.act { width: 100%; padding: 14px; font-size: 16px; }
@media (max-width: 780px) { .game { grid-template-columns: 1fr; } }
</style>
