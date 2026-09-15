<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import BetControls from './BetControls.vue'
import { useBank } from '../../lib/bank'

const props = defineProps({ mode: { type: String, default: 'demo' } })
const emit = defineEmits(['update:mode'])
const mode = computed({ get: () => props.mode, set: (v) => emit('update:mode', v) })
const bank = useBank(mode)

const ROWS = 8
const MULTS = [10, 2.5, 1.0, 0.8, 0.35, 0.8, 1.0, 2.5, 10] // ~0.90 EV (10% house edge)
const MCLASS = (m) => (m >= 3 ? 'hi' : m >= 1 ? 'mid' : 'lo')

const stake = ref(5)
const dropping = ref(false)
const ball = ref(null) // {row, x}  x in 0..ROWS
const landed = ref(null) // bucket index
const outcome = ref(null)
const results = ref([])
let iv = 0

function drop() {
  if (dropping.value || !bank.canBet(stake.value)) return
  if (!bank.bet(stake.value)) return
  dropping.value = true
  outcome.value = null
  landed.value = null
  let rights = 0
  const path = []
  for (let r = 0; r < ROWS; r++) { const right = Math.random() < 0.5 ? 1 : 0; rights += right; path.push(right) }
  let row = 0, x = ROWS / 2
  ball.value = { row: 0, x }
  iv = setInterval(() => {
    if (row >= ROWS) {
      clearInterval(iv)
      const bucket = rights
      landed.value = bucket
      const mult = MULTS[bucket]
      const win = stake.value * mult
      if (win > 0) bank.win(win)
      bank.log(stake.value, win, 'Plinko Drop')
      outcome.value = { mult, win }
      results.value.unshift({ mult })
      results.value = results.value.slice(0, 10)
      dropping.value = false
      return
    }
    x += path[row] ? 0.5 : -0.5
    row++
    ball.value = { row, x }
  }, 130)
}

onBeforeUnmount(() => clearInterval(iv))
</script>

<template>
  <div class="game">
    <div class="left">
      <div class="board">
        <div class="pegs">
          <div v-for="r in ROWS" :key="r" class="pegrow" :style="{ paddingInline: (ROWS - r) * 3.4 + '%' }">
            <span v-for="c in (r + 1)" :key="c" class="peg"></span>
          </div>
        </div>
        <div v-if="ball" class="ball" :style="{ top: (ball.row / ROWS) * 88 + '%', left: (ball.x / ROWS) * 100 + '%' }"></div>
        <div class="buckets">
          <div v-for="(m, i) in MULTS" :key="i" class="bucket" :class="[MCLASS(m), { hit: landed === i }]">{{ m }}×</div>
        </div>
      </div>

      <div class="out" :class="outcome && (outcome.win > 0 ? 'win' : 'lose')">
        <template v-if="outcome">
          <b v-if="outcome.win >= stake" class="win">{{ outcome.mult }}× · +{{ bank.symbol.value }}{{ outcome.win.toFixed(2) }}</b>
          <b v-else class="lose">{{ outcome.mult }}× · {{ bank.symbol.value }}{{ outcome.win.toFixed(2) }} back</b>
        </template>
        <span v-else>Drop the ball — hit the edges for 10×</span>
      </div>
      <div class="hist"><span v-for="(r, i) in results" :key="i" :class="MCLASS(r.mult)">{{ r.mult }}×</span></div>
    </div>

    <BetControls v-model:stake="stake" v-model:mode="mode" :balance="bank.balance.value" :symbol="bank.symbol.value" :mode="mode" :disabled="dropping">
      <button class="btn btn-cta act" :disabled="dropping || !bank.canBet(stake)" @click="drop">
        {{ dropping ? 'Dropping…' : `Drop · ${bank.symbol.value}${stake.toFixed(2)}` }}
      </button>
    </BetControls>
  </div>
</template>

<style scoped>
.game { display: grid; grid-template-columns: 1fr 300px; gap: 16px; align-items: start; }
.board { position: relative; aspect-ratio: 1/1; max-width: 460px; margin: 0 auto; background: radial-gradient(120% 120% at 50% 0%, #1a1550, #0e0b2b); border: 1px solid var(--line); border-radius: 16px; padding: 16px; }
.pegs { display: flex; flex-direction: column; gap: 2.6%; height: 86%; }
.pegrow { display: flex; justify-content: space-between; }
.peg { width: 9px; height: 9px; border-radius: 999px; background: #6b63b8; box-shadow: 0 0 6px rgba(124,77,255,.5); }
.ball { position: absolute; width: 16px; height: 16px; border-radius: 999px; background: radial-gradient(circle at 30% 30%, #fff, var(--cta)); transform: translate(-50%,-50%); transition: top .12s linear, left .12s linear; box-shadow: 0 0 10px var(--cta); z-index: 2; }
.buckets { position: absolute; left: 16px; right: 16px; bottom: 10px; display: grid; grid-template-columns: repeat(9, 1fr); gap: 3px; }
.bucket { text-align: center; font-size: 11px; font-weight: 800; padding: 5px 0; border-radius: 6px; }
.bucket.lo { background: #1e2a4a; color: #9fb3d9; }
.bucket.mid { background: #2a2270; color: #cdc4ff; }
.bucket.hi { background: linear-gradient(135deg,#ff9f1c,#ff2d78); color: #fff; }
.bucket.hit { outline: 2px solid #fff; transform: translateY(-3px); }
.out { text-align: center; margin: 16px 0 10px; color: var(--muted); font-weight: 700; min-height: 22px; }
.out .win { color: var(--green); font-size: 17px; } .out .lose { color: var(--gold); }
.hist { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
.hist span { font-size: 11px; font-weight: 800; padding: 2px 7px; border-radius: 999px; background: var(--panel-2); }
.hist .hi { color: var(--cta); } .hist .mid { color: var(--brand-2); } .hist .lo { color: var(--muted); }
.act { width: 100%; padding: 14px; font-size: 16px; }
@media (max-width: 780px) { .game { grid-template-columns: 1fr; } }
</style>
