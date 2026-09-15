<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import BetControls from './BetControls.vue'
import { useBank } from '../../lib/bank'

const props = defineProps({ mode: { type: String, default: 'demo' } })
const emit = defineEmits(['update:mode'])
const mode = computed({ get: () => props.mode, set: (v) => emit('update:mode', v) })
const bank = useBank(mode)

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const SUITS = ['♠', '♥', '♦', '♣']
const BET_SECONDS = 8
const RESULT_SECONDS = 5

const stake = ref(5)
const current = ref(dealCard())
const revealed = ref(null)
const outcome = ref(null)       // { res, win }
const phase = ref('betting')    // betting | revealing | result
const timeLeft = ref(BET_SECONDS)
const betThisRound = ref(false)
let ticker = null

function suited() {
  const s = SUITS[Math.floor(Math.random() * 4)]
  return { s, red: s === '♥' || s === '♦' }
}
function dealCard() { return { v: 5 + Math.floor(Math.random() * 5), ...suited() } } // betting card 5–9
function draw() { return { v: Math.floor(Math.random() * 13) + 1, ...suited() } }     // revealed card 1–13

const higherCount = computed(() => 13 - current.value.v)
const lowerCount = computed(() => current.value.v - 1)
const payHigher = computed(() => (higherCount.value ? Math.max(1.01, (13 / higherCount.value) * 0.90) : 0))
const payLower = computed(() => (lowerCount.value ? Math.max(1.01, (13 / lowerCount.value) * 0.90) : 0))
const phaseTotal = computed(() => (phase.value === 'result' ? RESULT_SECONDS : BET_SECONDS))
const barPct = computed(() => Math.max(0, (timeLeft.value / phaseTotal.value) * 100))

function runTimer(seconds, onDone) {
  clearInterval(ticker)
  timeLeft.value = seconds
  ticker = setInterval(() => {
    timeLeft.value -= 1
    if (timeLeft.value <= 0) { clearInterval(ticker); onDone() }
  }, 1000)
}

function startBetting() {
  phase.value = 'betting'
  current.value = dealCard()
  revealed.value = null
  outcome.value = null
  betThisRound.value = false
  runTimer(BET_SECONDS, () => startBetting()) // no bet placed -> fresh round
}

function guess(dir) {
  if (phase.value !== 'betting') return
  if (dir === 'hi' && !higherCount.value) return
  if (dir === 'lo' && !lowerCount.value) return
  if (!bank.canBet(stake.value) || !bank.bet(stake.value)) return
  clearInterval(ticker) // lock betting the moment a bet lands
  betThisRound.value = true
  phase.value = 'revealing'
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
    phase.value = 'result'
    runTimer(RESULT_SECONDS, () => startBetting())
  }, 600)
}

onMounted(startBetting)
onBeforeUnmount(() => clearInterval(ticker))
</script>

<template>
  <div class="game">
    <div class="left">
      <div class="table">
        <div class="statusrow">
          <span v-if="phase === 'betting'" class="tag open">● Betting open</span>
          <span v-else-if="phase === 'revealing'" class="tag closed">Revealing…</span>
          <span v-else class="tag closed">Round complete</span>
          <span class="count">{{ phase === 'result' ? `Next round in ${timeLeft}s` : phase === 'betting' ? `Closes in ${timeLeft}s` : '' }}</span>
        </div>
        <div class="bar"><div class="fill" :class="phase" :style="{ width: barPct + '%' }"></div></div>

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
          <span v-else-if="phase === 'revealing'">Revealing…</span>
          <span v-else-if="phase === 'result'">No bet this round</span>
          <span v-else>Higher or lower? Bet before betting closes.</span>
        </div>
        <p class="odds">A low → K high · <b>{{ higherCount }}</b> higher · <b>{{ lowerCount }}</b> lower · ties lose · 10% house edge</p>
      </div>
    </div>

    <BetControls v-model:stake="stake" v-model:mode="mode" :balance="bank.balance.value" :symbol="bank.symbol.value" :mode="mode" :disabled="phase !== 'betting'">
      <div class="guesses">
        <button class="g hi" :disabled="phase !== 'betting' || !higherCount || betThisRound || !bank.canBet(stake)" @click="guess('hi')">
          <span>▲ Higher</span><b>{{ payHigher ? payHigher.toFixed(2) + '×' : '—' }}</b>
        </button>
        <button class="g lo" :disabled="phase !== 'betting' || !lowerCount || betThisRound || !bank.canBet(stake)" @click="guess('lo')">
          <span>▼ Lower</span><b>{{ payLower ? payLower.toFixed(2) + '×' : '—' }}</b>
        </button>
      </div>
      <p class="autonote">Rounds run automatically — a new card deals every round.</p>
    </BetControls>
  </div>
</template>

<style scoped>
.game { display: grid; grid-template-columns: 1fr 300px; gap: 16px; align-items: start; }
.table { background: radial-gradient(120% 120% at 50% 0%, #123a2a, #0b2019); border: 1px solid var(--line); border-radius: 18px; padding: 24px 34px 30px; text-align: center; }
.statusrow { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.tag { font-size: 12px; font-weight: 800; }
.tag.open { color: #6ee7b7; } .tag.closed { color: #9fd6c2; }
.count { font-size: 12.5px; color: #9fd6c2; font-weight: 700; }
.bar { height: 5px; border-radius: 999px; background: rgba(255,255,255,.08); overflow: hidden; margin-bottom: 20px; }
.fill { height: 100%; border-radius: 999px; transition: width 1s linear; }
.fill.betting { background: linear-gradient(90deg, #34d399, #6ee7b7); }
.fill.revealing { background: #fde68a; }
.fill.result { background: #64748b; }
.cards { display: flex; justify-content: center; align-items: center; gap: 16px; }
.cardslot { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.clabel { font-size: 11px; color: #9fd6c2; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
.vs { font-size: 26px; color: #6ee7b7; font-weight: 900; }
.cardface { width: 112px; height: 158px; border-radius: 14px; background: #fff; color: #10141f; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 16px 40px rgba(0,0,0,.4); }
.cardface.red { color: #d32f4a; }
.cardface.back { background: repeating-linear-gradient(45deg, #1e1953, #1e1953 8px, #2a2270 8px, #2a2270 16px); color: rgba(255,255,255,.5); font-size: 44px; font-weight: 900; }
.rank { font-size: 40px; font-weight: 900; line-height: 1; }
.suit { font-size: 34px; }
.out { margin-top: 20px; color: #bfeede; font-weight: 700; min-height: 24px; }
.out .win { color: #6ee7b7; font-size: 18px; } .out .lose { color: #fca5a5; } .out .push { color: #fde68a; }
.odds { margin: 10px 0 0; color: #9fd6c2; font-size: 12px; }
.odds b { color: #fff; }
.guesses { display: grid; gap: 8px; }
.g { display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--line); border-radius: 10px; padding: 13px 16px; font-weight: 800; color: #fff; }
.g.hi { background: linear-gradient(135deg,#34d399,#0e7490); }
.g.lo { background: linear-gradient(135deg,#fb7185,#be123c); }
.g:disabled { opacity: .4; cursor: default; }
.autonote { color: var(--muted); font-size: 11px; text-align: center; margin: 2px 0 0; }
@media (max-width: 780px) { .game { grid-template-columns: 1fr; } }
</style>
