<script setup>
import { ref, computed } from 'vue'
import BetControls from './BetControls.vue'
import { useBank } from '../../lib/bank'

const props = defineProps({ mode: { type: String, default: 'demo' } })
const emit = defineEmits(['update:mode'])
const mode = computed({ get: () => props.mode, set: (v) => emit('update:mode', v) })
const bank = useBank(mode)

const SIZE = 25
const stake = ref(5)
const mineCount = ref(3)
const phase = ref('idle') // idle | playing | won | lost
const tiles = ref([]) // {mine, revealed}
const picks = ref(0)
const lastWin = ref(0)

const multiplier = computed(() => {
  let m = 1
  for (let i = 0; i < picks.value; i++) m *= (SIZE - i) / (SIZE - mineCount.value - i)
  return m * 0.90
})
const nextMultiplier = computed(() => {
  let m = 1
  for (let i = 0; i <= picks.value; i++) m *= (SIZE - i) / (SIZE - mineCount.value - i)
  return m * 0.90
})

function start() {
  if (!bank.canBet(stake.value)) return
  if (!bank.bet(stake.value)) return
  const mines = new Set()
  while (mines.size < mineCount.value) mines.add(Math.floor(Math.random() * SIZE))
  tiles.value = Array.from({ length: SIZE }, (_, i) => ({ mine: mines.has(i), revealed: false }))
  picks.value = 0
  lastWin.value = 0
  phase.value = 'playing'
}
function reveal(i) {
  if (phase.value !== 'playing' || tiles.value[i].revealed) return
  tiles.value[i].revealed = true
  if (tiles.value[i].mine) {
    phase.value = 'lost'
    tiles.value.forEach((t) => (t.revealed = true))
    bank.log(stake.value, 0, 'Gem Hunt (Mines)')
    return
  }
  picks.value++
  if (picks.value === SIZE - mineCount.value) cashout() // cleared board
}
function cashout() {
  if (phase.value !== 'playing' || picks.value === 0) return
  const win = stake.value * multiplier.value
  bank.win(win)
  bank.log(stake.value, win, 'Gem Hunt (Mines)')
  lastWin.value = win
  tiles.value.forEach((t) => (t.revealed = true))
  phase.value = 'won'
}
</script>

<template>
  <div class="game">
    <div class="left">
      <div class="statusbar" :class="phase">
        <template v-if="phase === 'playing'">
          <span>{{ picks }} safe</span>
          <b>{{ multiplier.toFixed(2) }}×</b>
          <span>next {{ nextMultiplier.toFixed(2) }}×</span>
        </template>
        <template v-else-if="phase === 'won'"><b class="win">You won {{ bank.symbol.value }}{{ lastWin.toFixed(2) }} 🎉</b></template>
        <template v-else-if="phase === 'lost'"><b class="lose">💥 Boom! Better luck next time.</b></template>
        <template v-else><span>Pick tiles, avoid the bombs. Cash out anytime.</span></template>
      </div>

      <div class="grid" :class="{ idle: phase !== 'playing' }">
        <button v-for="(t, i) in (tiles.length ? tiles : Array(SIZE).fill({}))" :key="i"
                class="tile" :class="{ rev: t.revealed, mine: t.revealed && t.mine, gem: t.revealed && !t.mine }"
                :disabled="phase !== 'playing'" @click="reveal(i)">
          <span v-if="t.revealed">{{ t.mine ? '💣' : '💎' }}</span>
        </button>
      </div>
    </div>

    <BetControls v-model:stake="stake" v-model:mode="mode" :balance="bank.balance.value" :symbol="bank.symbol.value" :mode="mode" :disabled="phase === 'playing'">
      <label class="mines">Mines
        <div class="seg">
          <button v-for="n in [1,3,5]" :key="n" :class="{ on: mineCount === n }" :disabled="phase === 'playing'" @click="mineCount = n">{{ n }}</button>
        </div>
      </label>
      <button v-if="phase !== 'playing'" class="btn btn-cta act" :disabled="!bank.canBet(stake)" @click="start">Bet {{ bank.symbol.value }}{{ stake.toFixed(2) }}</button>
      <button v-else class="btn cashout act" :disabled="picks === 0" @click="cashout">
        {{ picks === 0 ? 'Pick a tile…' : `Cash out ${bank.symbol.value}${(stake * multiplier).toFixed(2)}` }}
      </button>
    </BetControls>
  </div>
</template>

<style scoped>
.game { display: grid; grid-template-columns: 1fr 300px; gap: 16px; align-items: start; }
.statusbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: var(--panel-2); border: 1px solid var(--line); border-radius: 12px; padding: 12px 16px; margin-bottom: 12px; color: var(--muted); font-size: 13.5px; }
.statusbar b { color: var(--cyan); font-size: 18px; }
.statusbar .win { color: var(--green); } .statusbar .lose { color: var(--red); }
.grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
.tile { aspect-ratio: 1; border: 1px solid var(--line); border-radius: 12px; background: linear-gradient(180deg,var(--panel-3),var(--panel-2)); font-size: 26px; display: grid; place-items: center; transition: transform .08s ease, background .15s ease; }
.tile:hover:not(:disabled) { transform: translateY(-2px); border-color: var(--brand); }
.tile.rev { background: var(--bg-2); }
.tile.gem { background: rgba(52,211,153,.14); border-color: rgba(52,211,153,.4); }
.tile.mine { background: rgba(248,113,113,.16); border-color: rgba(248,113,113,.5); }
.grid.idle .tile { opacity: .8; }
.act { width: 100%; padding: 14px; font-size: 16px; }
.cashout { background: linear-gradient(135deg,#34d399,#0e7490); color: #04140d; }
.mines { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: var(--muted); font-weight: 700; }
.seg { display: flex; gap: 6px; }
.seg button { flex: 1; border: 1px solid var(--line); background: var(--panel-3); color: var(--text); border-radius: 8px; padding: 9px; font-weight: 800; }
.seg button.on { background: linear-gradient(135deg,var(--brand-2),var(--brand)); border-color: transparent; }
@media (max-width: 780px) { .game { grid-template-columns: 1fr; } }
</style>
