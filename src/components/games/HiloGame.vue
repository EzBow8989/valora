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
const current = ref(dealCard()) // the card being bet on
const revealed = ref(null)      // the drawn next card (result)
const outcome = ref(null)       // { res, win }
const busy = ref(false)         // during the brief reveal
const done = ref(false)         // a result is shown; must deal before next bet

function suited() {
  const s = SUITS[Math.floor(Math.random() * 4)]
  return { s, red: s === '♥' || s === '♦' }
}
// Betting card is always mid-range (5–9): neither side is ever a near-lock.
function dealCard() {
  return { v: 5 + Math.floor(Math.random() * 5), ...suited() }
}
// Revealed card is a full 1–13 draw.
function draw() {
  return { v: Math.floor(Math.random() * 13) + 1, ...suited() }
}

const higherCount = computed(() => 13 - current.value.v)
const lowerCount = computed(() => current.value.v - 1)
// Ties lose. Fair side pays (13/count)*0.90 -> 10% house edge.
const payHigher = computed(() => (higherCount.value ? Math.max(1.01, (13 / higherCount.value) * 0.90) : 0))
const payLower = computed(() => (lowerCount.value ? Math.max(1.01, (13 / lowerCount.value) * 0.90) : 0))

function guess(dir) {
  if (busy.value || done.value || !bank.canBet(stake.value)) return
  if (dir === 'hi' && !higherCount.value) return
  if (dir === 'lo' && !lowerCount.value) return
  if (!bank.bet(stake.value)) return
  busy.value = true
  outcome.value = null
  revealed.value = null
  const n = draw()
  setTimeout(() => {
    revealed.value = n
    let win = 0, res
    if (n.v === current.value.v) { win = 0; res = 'tie' }
    else if (dir === 'hi' && n.v > current.value.v) { win = stake.value * payHigher.value; res = 'win' }
    else if (dir === 'lo' && n.v < current.value.v) { win = stake.value * payLower.value; res = 'win' }
    else res = 'lose'
    if (win > 0) bank.win(win)
    bank.log(stake.value, win, 'Hi-Lo')
    outcome.value = { res, win }
    busy.value = false
    done.value = true
  }, 450)
}

// Only now is a fresh card dealt — never mid-result.
function playAgain() {
  current.value = dealCard()
  revealed.value = null
  outcome.value = null
  done.value = false
}
</script>

<template>
  <div class="game">
    <div class="left">
      <div class="table">
        <div class="cards">
          <div class="cardslot">
            <div class="cardface" :class="{ red: current.red }">
              <span class="rank">{{ RANKS[current.v - 1] }}</span>
              <span class="suit">{{ current.s }}</span>
            </div>
            <span class="clabel">Your card</span>
          </div>
          <span class="vs">→</span>
          <div class="cardslot">
            <div v-if="revealed" class="cardface" :class="{ red: revealed.red }">
              <span class="rank">{{ RANKS[revealed.v - 1] }}</span>
              <span class="suit">{{ revealed.s }}</span>
            </div>
            <div v-else class="cardface back">?</div>
            <span class="clabel">Next card</span>
          </div>
        </div>

        <div class="out" :class="outcome && outcome.res">
          <template v-if="outcome">
            <b v-if="outcome.res === 'win'" class="win">Correct! +{{ bank.symbol.value }}{{ outcome.win.toFixed(2) }} 🎉</b>
            <b v-else-if="outcome.res === 'tie'" class="push">Tie ({{ RANKS[revealed.v - 1] }}) — house wins</b>
            <b v-else class="lose">Wrong guess — you lost</b>
          </template>
          <span v-else-if="busy">Revealing…</span>
          <span v-else>Will the next card be higher or lower?</span>
        </div>
        <p class="odds">A low → K high · <b>{{ higherCount }}</b> higher · <b>{{ lowerCount }}</b> lower · ties lose · 10% house edge</p>
      </div>
    </div>

    <BetControls v-model:stake="stake" v-model:mode="mode" :balance="bank.balance.value" :symbol="bank.symbol.value" :mode="mode" :disabled="busy || done">
      <div v-if="!done" class="guesses">
        <button class="g hi" :disabled="busy || !higherCount || !bank.canBet(stake)" @click="guess('hi')">
          <span>▲ Higher</span><b>{{ payHigher ? payHigher.toFixed(2) + '×' : '—' }}</b>
        </button>
        <button class="g lo" :disabled="busy || !lowerCount || !bank.canBet(stake)" @click="guess('lo')">
          <span>▼ Lower</span><b>{{ payLower ? payLower.toFixed(2) + '×' : '—' }}</b>
        </button>
      </div>
      <button v-else class="btn btn-cta again" @click="playAgain">Deal next card ▸</button>
    </BetControls>
  </div>
</template>

<style scoped>
.game { display: grid; grid-template-columns: 1fr 300px; gap: 16px; align-items: start; }
.table { background: radial-gradient(120% 120% at 50% 0%, #123a2a, #0b2019); border: 1px solid var(--line); border-radius: 18px; padding: 34px; text-align: center; }
.cards { display: flex; justify-content: center; align-items: center; gap: 16px; }
.cardslot { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.clabel { font-size: 11px; color: #9fd6c2; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
.vs { font-size: 26px; color: #6ee7b7; font-weight: 900; }
.cardface { width: 112px; height: 158px; border-radius: 14px; background: #fff; color: #10141f; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 16px 40px rgba(0,0,0,.4); }
.cardface.red { color: #d32f4a; }
.cardface.back { background: repeating-linear-gradient(45deg, #1e1953, #1e1953 8px, #2a2270 8px, #2a2270 16px); color: rgba(255,255,255,.5); font-size: 44px; font-weight: 900; }
.rank { font-size: 40px; font-weight: 900; line-height: 1; }
.suit { font-size: 34px; }
.out { margin-top: 22px; color: #bfeede; font-weight: 700; min-height: 24px; }
.out .win { color: #6ee7b7; font-size: 18px; } .out .lose { color: #fca5a5; } .out .push { color: #fde68a; }
.odds { margin: 10px 0 0; color: #9fd6c2; font-size: 12px; }
.odds b { color: #fff; }
.guesses { display: grid; gap: 8px; }
.g { display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--line); border-radius: 10px; padding: 13px 16px; font-weight: 800; color: #fff; }
.g.hi { background: linear-gradient(135deg,#34d399,#0e7490); }
.g.lo { background: linear-gradient(135deg,#fb7185,#be123c); }
.g:disabled { opacity: .45; }
.again { width: 100%; padding: 14px; font-size: 16px; }
@media (max-width: 780px) { .game { grid-template-columns: 1fr; } }
</style>
