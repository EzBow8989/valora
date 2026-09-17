<script setup>
import { ref, computed } from 'vue'
import BetControls from './BetControls.vue'
import { useBank } from '../../lib/bank'

const props = defineProps({ mode: { type: String, default: 'demo' } })
const emit = defineEmits(['update:mode'])
const mode = computed({ get: () => props.mode, set: (v) => emit('update:mode', v) })
const bank = useBank(mode)

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const SUITS = ['♠', '♥', '♦', '♣']
// Dragon/Tiger pay 1.95x (~10% edge); Tie pays 9x (sucker bet, big edge).
const BETS = [
  { key: 'dragon', label: 'Dragon', pay: 1.95, hex: '#f97316' },
  { key: 'tie', label: 'Tie', pay: 9, hex: '#a78bfa' },
  { key: 'tiger', label: 'Tiger', pay: 1.95, hex: '#22d3ee' },
]

const stake = ref(5)
const pick = ref('dragon')
const busy = ref(false)
const dragon = ref(null)
const tiger = ref(null)
const outcome = ref(null)
const history = ref([])

function card() {
  const s = SUITS[Math.floor(Math.random() * 4)]
  return { v: Math.floor(Math.random() * 13) + 1, s, red: s === '♥' || s === '♦' }
}
const payOf = (k) => BETS.find((b) => b.key === k).pay

function deal() {
  if (busy.value || !bank.canBet(stake.value)) return
  if (!bank.bet(stake.value)) return
  busy.value = true
  outcome.value = null
  dragon.value = null
  tiger.value = null
  const d = card(), t = card()
  setTimeout(() => {
    dragon.value = d
    tiger.value = t
    const winner = d.v > t.v ? 'dragon' : t.v > d.v ? 'tiger' : 'tie'
    const won = winner === pick.value
    const win = won ? stake.value * payOf(pick.value) : 0
    if (win > 0) bank.win(win)
    bank.log(stake.value, win, 'Dragon Tiger')
    outcome.value = { winner, won, win }
    history.value.unshift(winner)
    history.value = history.value.slice(0, 16)
    busy.value = false
  }, 650)
}
</script>

<template>
  <div class="game">
    <div class="left">
      <div class="table">
        <div class="seats">
          <div class="seat">
            <span class="stitle dragon">🐉 Dragon</span>
            <div v-if="dragon" class="cardface" :class="{ red: dragon.red }"><span>{{ RANKS[dragon.v - 1] }}</span><em>{{ dragon.s }}</em></div>
            <div v-else class="cardface back">?</div>
          </div>
          <span class="vs">VS</span>
          <div class="seat">
            <span class="stitle tiger">🐯 Tiger</span>
            <div v-if="tiger" class="cardface" :class="{ red: tiger.red }"><span>{{ RANKS[tiger.v - 1] }}</span><em>{{ tiger.s }}</em></div>
            <div v-else class="cardface back">?</div>
          </div>
        </div>
        <div class="out" :class="outcome && (outcome.won ? 'win' : 'lose')">
          <template v-if="outcome">
            <b v-if="outcome.won" class="win">{{ outcome.winner === 'tie' ? 'Tie' : outcome.winner === 'dragon' ? 'Dragon' : 'Tiger' }} wins · +{{ bank.symbol.value }}{{ outcome.win.toFixed(2) }} 🎉</b>
            <b v-else class="lose">{{ outcome.winner === 'tie' ? 'Tie' : outcome.winner === 'dragon' ? 'Dragon' : 'Tiger' }} wins — your {{ pick }} lost</b>
          </template>
          <span v-else>Bet Dragon, Tiger or Tie — highest card wins</span>
        </div>
        <div class="hist"><span v-for="(h, i) in history" :key="i" class="chip" :class="h">{{ h === 'dragon' ? 'D' : h === 'tiger' ? 'T' : '=' }}</span></div>
      </div>
    </div>

    <BetControls v-model:stake="stake" v-model:mode="mode" :balance="bank.balance.value" :symbol="bank.symbol.value" :mode="mode" :disabled="busy">
      <div class="picker">
        <button v-for="b in BETS" :key="b.key" class="bet" :class="{ on: pick === b.key }" :style="{ '--c': b.hex }" :disabled="busy" @click="pick = b.key">
          <span class="bl">{{ b.label }}</span><b>{{ b.pay }}×</b>
        </button>
      </div>
      <button class="btn btn-cta act" :disabled="busy || !bank.canBet(stake)" @click="deal">
        {{ busy ? 'Dealing…' : `Deal · ${bank.symbol.value}${stake.toFixed(2)}` }}
      </button>
    </BetControls>
  </div>
</template>

<style scoped>
.game { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 16px; align-items: start; }
.table { background: radial-gradient(120% 120% at 50% 0%, #2a1508, #140a04); border: 1px solid var(--line); border-radius: 18px; padding: 30px; text-align: center; }
.seats { display: flex; align-items: center; justify-content: center; gap: 20px; }
.seat { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.stitle { font-weight: 800; font-size: 14px; }
.stitle.dragon { color: #f97316; } .stitle.tiger { color: #22d3ee; }
.vs { color: var(--muted); font-weight: 900; font-size: 14px; }
.cardface { width: 104px; height: 146px; border-radius: 14px; background: #fff; color: #10141f; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 16px 40px rgba(0,0,0,.45); }
.cardface span { font-size: 38px; font-weight: 900; line-height: 1; }
.cardface em { font-size: 30px; font-style: normal; }
.cardface.red { color: #d32f4a; }
.cardface.back { background: repeating-linear-gradient(45deg,#3a1508,#3a1508 8px,#5a2510 8px,#5a2510 16px); color: rgba(255,255,255,.5); font-size: 40px; font-weight: 900; }
.out { margin-top: 20px; color: #f4d6b0; font-weight: 700; min-height: 24px; }
.out .win { color: #6ee7b7; font-size: 18px; } .out .lose { color: #fca5a5; }
.hist { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; margin-top: 12px; }
.chip { width: 24px; height: 24px; border-radius: 999px; display: grid; place-items: center; font-size: 11px; font-weight: 900; color: #fff; }
.chip.dragon { background: #f97316; } .chip.tiger { background: #22d3ee; color: #04121a; } .chip.tie { background: #a78bfa; }
.picker { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
.bet { display: flex; flex-direction: column; align-items: center; gap: 3px; border: 1px solid var(--line); background: var(--panel-3); border-radius: 10px; padding: 10px 4px; color: #fff; font-weight: 800; }
.bet .bl { font-size: 12.5px; } .bet b { font-size: 12px; color: var(--muted); }
.bet.on { border-color: var(--c); box-shadow: 0 0 0 2px var(--c) inset; }
.act { width: 100%; padding: 14px; font-size: 16px; }
@media (max-width: 780px) { .game { grid-template-columns: 1fr; } }
</style>
