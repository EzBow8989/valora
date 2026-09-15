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
const stake = ref(5)
const current = ref(draw())
const next = ref(null)
const busy = ref(false)
const outcome = ref(null)

function draw() {
  const v = Math.floor(Math.random() * 13) + 1
  const s = SUITS[Math.floor(Math.random() * 4)]
  return { v, s, red: s === '♥' || s === '♦' }
}
const higherCount = computed(() => 13 - current.value.v)
const lowerCount = computed(() => current.value.v - 1)
const payHigher = computed(() => (higherCount.value ? Math.max(1.01, (13 / higherCount.value) * 0.98) : 0))
const payLower = computed(() => (lowerCount.value ? Math.max(1.01, (13 / lowerCount.value) * 0.98) : 0))

function guess(dir) {
  if (busy.value || !bank.canBet(stake.value)) return
  if (dir === 'hi' && !higherCount.value) return
  if (dir === 'lo' && !lowerCount.value) return
  if (!bank.bet(stake.value)) return
  busy.value = true
  outcome.value = null
  const n = draw()
  setTimeout(() => {
    next.value = n
    let win = 0, res
    if (n.v === current.value.v) { win = stake.value; res = 'push' } // tie returns stake
    else if (dir === 'hi' && n.v > current.value.v) { win = stake.value * payHigher.value; res = 'win' }
    else if (dir === 'lo' && n.v < current.value.v) { win = stake.value * payLower.value; res = 'win' }
    else res = 'lose'
    if (win > 0) bank.win(win)
    bank.log(stake.value, win, 'Hi-Lo')
    outcome.value = { res, win }
    current.value = n
    busy.value = false
  }, 450)
}
</script>

<template>
  <div class="game">
    <div class="left">
      <div class="table">
        <div class="cards">
          <div class="cardface" :class="{ red: current.red }">
            <span class="rank">{{ RANKS[current.v - 1] }}</span>
            <span class="suit">{{ current.s }}</span>
          </div>
        </div>
        <div class="out" :class="outcome && outcome.res">
          <template v-if="outcome">
            <b v-if="outcome.res === 'win'" class="win">Correct! +{{ bank.symbol.value }}{{ outcome.win.toFixed(2) }} 🎉</b>
            <b v-else-if="outcome.res === 'push'" class="push">Tie — stake returned</b>
            <b v-else class="lose">Wrong guess</b>
          </template>
          <span v-else>Will the next card be higher or lower?</span>
        </div>
      </div>
    </div>

    <BetControls v-model:stake="stake" v-model:mode="mode" :balance="bank.balance.value" :symbol="bank.symbol.value" :mode="mode" :disabled="busy">
      <div class="guesses">
        <button class="g hi" :disabled="busy || !higherCount || !bank.canBet(stake)" @click="guess('hi')">
          <span>▲ Higher</span><b>{{ payHigher ? payHigher.toFixed(2) + '×' : '—' }}</b>
        </button>
        <button class="g lo" :disabled="busy || !lowerCount || !bank.canBet(stake)" @click="guess('lo')">
          <span>▼ Lower</span><b>{{ payLower ? payLower.toFixed(2) + '×' : '—' }}</b>
        </button>
      </div>
    </BetControls>
  </div>
</template>

<style scoped>
.game { display: grid; grid-template-columns: 1fr 300px; gap: 16px; align-items: start; }
.table { background: radial-gradient(120% 120% at 50% 0%, #123a2a, #0b2019); border: 1px solid var(--line); border-radius: 18px; padding: 34px; text-align: center; }
.cards { display: flex; justify-content: center; }
.cardface { width: 130px; height: 182px; border-radius: 14px; background: #fff; color: #10141f; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 16px 40px rgba(0,0,0,.4); }
.cardface.red { color: #d32f4a; }
.rank { font-size: 46px; font-weight: 900; line-height: 1; }
.suit { font-size: 40px; }
.out { margin-top: 22px; color: #bfeede; font-weight: 700; min-height: 24px; }
.out .win { color: #6ee7b7; font-size: 18px; } .out .lose { color: #fca5a5; } .out .push { color: #fde68a; }
.guesses { display: grid; gap: 8px; }
.g { display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--line); border-radius: 10px; padding: 13px 16px; font-weight: 800; color: #fff; }
.g.hi { background: linear-gradient(135deg,#34d399,#0e7490); }
.g.lo { background: linear-gradient(135deg,#fb7185,#be123c); }
.g:disabled { opacity: .45; }
@media (max-width: 780px) { .game { grid-template-columns: 1fr; } }
</style>
