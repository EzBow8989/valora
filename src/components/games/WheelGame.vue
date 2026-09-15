<script setup>
import { ref, computed } from 'vue'
import BetControls from './BetControls.vue'
import { useBank } from '../../lib/bank'

const props = defineProps({ mode: { type: String, default: 'demo' } })
const emit = defineEmits(['update:mode'])
const mode = computed({ get: () => props.mode, set: (v) => emit('update:mode', v) })
const bank = useBank(mode)

// 12 segments (avg payout ~0.96 for a house edge)
const SEG = [0, 1.5, 0, 2, 0, 1.5, 0, 3, 0, 1.5, 0, 6]
const COLORS = ['#7c4dff', '#22d3ee', '#7c4dff', '#34d399', '#7c4dff', '#22d3ee', '#7c4dff', '#f59e0b', '#7c4dff', '#22d3ee', '#7c4dff', '#ff2d78']
const N = SEG.length
const seg = 360 / N

const stake = ref(5)
const angle = ref(0)
const spinning = ref(false)
const outcome = ref(null) // {mult, win}

const gradient = computed(() => {
  const stops = SEG.map((_, i) => `${COLORS[i]} ${i * seg}deg ${(i + 1) * seg}deg`).join(', ')
  return `conic-gradient(${stops})`
})

function spin() {
  if (spinning.value || !bank.canBet(stake.value)) return
  if (!bank.bet(stake.value)) return
  spinning.value = true
  outcome.value = null
  const idx = Math.floor(Math.random() * N)
  // land the middle of segment idx under the top pointer
  const target = 360 * 6 + (360 - (idx * seg + seg / 2))
  angle.value += target
  setTimeout(() => {
    const mult = SEG[idx]
    const win = stake.value * mult
    if (win > 0) bank.win(win)
    bank.log(stake.value, win, 'Spin Fortune (Wheel)')
    outcome.value = { mult, win }
    spinning.value = false
    angle.value = angle.value % 360
  }, 4200)
}
</script>

<template>
  <div class="game">
    <div class="left">
      <div class="wheelwrap">
        <div class="pointer">▼</div>
        <div class="wheel" :style="{ background: gradient, transform: `rotate(${angle}deg)`, transition: spinning ? 'transform 4.1s cubic-bezier(.17,.67,.2,1)' : 'none' }">
          <span v-for="(m, i) in SEG" :key="i" class="lbl" :style="{ transform: `rotate(${i * seg + seg / 2}deg) translateY(-38%)` }">{{ m ? m + '×' : '—' }}</span>
        </div>
        <div class="hub">SPIN</div>
      </div>

      <div class="out" :class="outcome && (outcome.win > 0 ? 'win' : 'lose')">
        <template v-if="outcome">
          <b v-if="outcome.win > 0" class="win">{{ outcome.mult }}× · +{{ bank.symbol.value }}{{ outcome.win.toFixed(2) }} 🎉</b>
          <b v-else class="lose">Landed on — · no win</b>
        </template>
        <span v-else>Spin the wheel to win up to 6×</span>
      </div>
    </div>

    <BetControls v-model:stake="stake" v-model:mode="mode" :balance="bank.balance.value" :symbol="bank.symbol.value" :mode="mode" :disabled="spinning">
      <button class="btn btn-cta act" :disabled="spinning || !bank.canBet(stake)" @click="spin">
        {{ spinning ? 'Spinning…' : `Spin · ${bank.symbol.value}${stake.toFixed(2)}` }}
      </button>
    </BetControls>
  </div>
</template>

<style scoped>
.game { display: grid; grid-template-columns: 1fr 300px; gap: 16px; align-items: start; }
.wheelwrap { position: relative; width: min(380px, 82vw); aspect-ratio: 1; margin: 6px auto 0; }
.pointer { position: absolute; top: -6px; left: 50%; transform: translateX(-50%); z-index: 4; color: var(--gold); font-size: 26px; filter: drop-shadow(0 2px 4px #000); }
.wheel { position: absolute; inset: 0; border-radius: 999px; border: 6px solid #1e1953; box-shadow: 0 0 0 4px #2a2270, inset 0 0 40px rgba(0,0,0,.4); }
.lbl { position: absolute; top: 50%; left: 50%; transform-origin: 0 0; color: #fff; font-weight: 800; font-size: 13px; text-shadow: 0 1px 2px rgba(0,0,0,.6); }
.hub { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); z-index: 3; width: 74px; height: 74px; border-radius: 999px; background: linear-gradient(135deg,var(--panel-3),var(--panel)); border: 2px solid var(--line); display: grid; place-items: center; font-weight: 900; font-size: 13px; letter-spacing: .05em; color: var(--brand-2); }
.out { text-align: center; margin-top: 18px; color: var(--muted); font-weight: 700; min-height: 24px; }
.out .win { color: var(--green); font-size: 18px; } .out .lose { color: var(--red); }
.act { width: 100%; padding: 14px; font-size: 16px; }
@media (max-width: 780px) { .game { grid-template-columns: 1fr; } }
</style>
