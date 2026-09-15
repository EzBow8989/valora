<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import BetControls from './BetControls.vue'
import { useBank } from '../../lib/bank'

const props = defineProps({ mode: { type: String, default: 'demo' } })
const emit = defineEmits(['update:mode'])
const mode = computed({ get: () => props.mode, set: (v) => emit('update:mode', v) })
const bank = useBank(mode)
const route = useRoute()

// Skins share the SAME weights/pays -> identical ~90% RTP; only art differs.
const WEIGHTS = [30, 22, 16, 12, 8, 5, 3]
const PAYS = [8, 12, 22, 38, 80, 160, 500]
const SKINS = {
  slots: ['🍒', '🔔', '⭐', '🍀', '💎', '👑', '7️⃣'],
  'slots-fruit': ['🍒', '🍋', '🍊', '🍉', '🍇', '🔔', '7️⃣'],
  'slots-gem': ['🔷', '🔶', '💠', '🟣', '💎', '👑', '⭐'],
}
const EMOJIS = SKINS[route.params.game] || SKINS.slots
const SYMS = EMOJIS.map((s, i) => ({ s, w: WEIGHTS[i], pay: PAYS[i] }))
const POOL = SYMS.flatMap((x) => Array(x.w).fill(x.s))
const payOf = (s) => SYMS.find((x) => x.s === s).pay

const stake = ref(5)
const reels = ref([EMOJIS[0], EMOJIS[1], EMOJIS[2]])
const spinning = ref([false, false, false])
const busy = ref(false)
const outcome = ref(null)
const timers = []

function rnd() { return POOL[Math.floor(Math.random() * POOL.length)] }

function spin() {
  if (busy.value || !bank.canBet(stake.value)) return
  if (!bank.bet(stake.value)) return
  busy.value = true
  outcome.value = null
  const final = [rnd(), rnd(), rnd()]
  spinning.value = [true, true, true]
  const cyclers = [0, 1, 2].map((r) =>
    setInterval(() => { reels.value[r] = rnd() }, 70)
  )
  ;[0, 1, 2].forEach((r) => {
    timers.push(setTimeout(() => {
      clearInterval(cyclers[r])
      reels.value[r] = final[r]
      spinning.value[r] = false
      if (r === 2) settle(final)
    }, 700 + r * 450))
  })
}

function settle(final) {
  let win = 0
  let label = ''
  if (final[0] === final[1] && final[1] === final[2]) {
    win = stake.value * payOf(final[0])
    label = `Three ${final[0]} — ${payOf(final[0])}×`
  } else if (final[0] === final[1] || final[1] === final[2] || final[0] === final[2]) {
    win = stake.value * 0.55 // any pair returns 0.55x
    label = 'Pair — 0.55×'
  }
  if (win > 0) bank.win(win)
  bank.log(stake.value, win, 'Rune Reels (Slots)')
  outcome.value = { win, label: win > 0 ? label : 'No match' }
  busy.value = false
}

onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <div class="game">
    <div class="left">
      <div class="machine">
        <div class="reels">
          <div v-for="(r, i) in reels" :key="i" class="reel" :class="{ spin: spinning[i] }">
            <span>{{ r }}</span>
          </div>
        </div>
        <div class="payline"></div>
      </div>

      <div class="out" :class="outcome && (outcome.win > 0 ? 'win' : 'lose')">
        <template v-if="outcome">
          <b v-if="outcome.win > 0" class="win">{{ outcome.label }} · +{{ bank.symbol.value }}{{ outcome.win.toFixed(2) }} 🎉</b>
          <b v-else class="lose">No match — spin again</b>
        </template>
        <span v-else>Match three symbols on the line to win up to 500×</span>
      </div>

      <div class="paytable">
        <span v-for="x in SYMS" :key="x.s">{{ x.s }}×3 = {{ x.pay }}×</span>
      </div>
    </div>

    <BetControls v-model:stake="stake" v-model:mode="mode" :balance="bank.balance.value" :symbol="bank.symbol.value" :mode="mode" :disabled="busy">
      <button class="btn btn-cta act" :disabled="busy || !bank.canBet(stake)" @click="spin">
        {{ busy ? 'Spinning…' : `Spin · ${bank.symbol.value}${stake.toFixed(2)}` }}
      </button>
    </BetControls>
  </div>
</template>

<style scoped>
.game { display: grid; grid-template-columns: 1fr 300px; gap: 16px; align-items: start; }
.machine { position: relative; background: radial-gradient(120% 120% at 50% 0%, #241d66, #12103a); border: 1px solid var(--line); border-radius: 18px; padding: 26px; }
.reels { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.reel { aspect-ratio: 1; background: linear-gradient(180deg,#0e0b2b,#1a1550); border: 2px solid var(--panel-3); border-radius: 14px; display: grid; place-items: center; font-size: clamp(46px, 10vw, 84px); overflow: hidden; }
.reel.spin span { animation: roll .12s linear infinite; }
@keyframes roll { from { transform: translateY(-16%); } to { transform: translateY(16%); } }
.payline { position: absolute; left: 26px; right: 26px; top: 50%; height: 2px; background: linear-gradient(90deg, transparent, var(--gold), transparent); opacity: .5; }
.out { text-align: center; margin: 18px 0 12px; color: var(--muted); font-weight: 700; min-height: 24px; }
.out .win { color: var(--green); font-size: 17px; } .out .lose { color: var(--red); }
.paytable { display: flex; flex-wrap: wrap; gap: 8px 14px; justify-content: center; color: var(--muted); font-size: 12.5px; }
.act { width: 100%; padding: 14px; font-size: 16px; }
@media (max-width: 780px) { .game { grid-template-columns: 1fr; } }
</style>
