<script setup>
import { ref, computed } from 'vue'
import BetControls from './BetControls.vue'
import { useBank } from '../../lib/bank'

const props = defineProps({ mode: { type: String, default: 'demo' } })
const emit = defineEmits(['update:mode'])
const mode = computed({ get: () => props.mode, set: (v) => emit('update:mode', v) })
const bank = useBank(mode)

// --- Game math: 24 segments, 3 of them are HOUSE (everyone loses). ---
// Every colour wins < 50% of spins and every colour bet returns 90% RTP:
//   mult = (24 / count) * 0.90
const COLORS = [
  { key: 'red', label: 'Red', hex: '#ff4d5e', mult: 2.16, count: 10 },
  { key: 'blue', label: 'Blue', hex: '#3b82f6', mult: 3.60, count: 6 },
  { key: 'green', label: 'Green', hex: '#34d399', mult: 7.20, count: 3 },
  { key: 'gold', label: 'Gold', hex: '#ffc53d', mult: 10.80, count: 2 },
]
const HOUSE_HEX = '#64748b'
const colorOf = (k) => COLORS.find((c) => c.key === k) || { key: 'house', label: 'House', hex: HOUSE_HEX, mult: 0 }
// 10 red, 6 blue, 3 green, 2 gold, 3 house
const SEGMENTS = ['red','blue','red','green','red','blue','red','gold','red','blue','red','green','red','blue','red','gold','red','blue','red','green','house','blue','house','house']
const SEG = 360 / SEGMENTS.length

const gradient = computed(() => {
  const stops = SEGMENTS.map((k, i) => `${colorOf(k).hex} ${i * SEG}deg ${(i + 1) * SEG}deg`).join(', ')
  return `conic-gradient(${stops})`
})

const stake = ref(5)
const chosen = ref(null)
const spinning = ref(false)
const angle = ref(0)
const result = ref(null)
const history = ref([])

const potential = computed(() => (chosen.value ? stake.value * colorOf(chosen.value).mult : 0))

function spin() {
  if (spinning.value || !chosen.value || !bank.canBet(stake.value)) return
  if (!bank.bet(stake.value)) return
  spinning.value = true
  result.value = null

  const winIndex = Math.floor(Math.random() * SEGMENTS.length)
  const winColor = SEGMENTS[winIndex]
  const targetMod = (360 - (winIndex * SEG + SEG / 2)) % 360
  const delta = ((targetMod - (angle.value % 360)) + 360) % 360
  angle.value += 360 * 6 + delta

  setTimeout(() => {
    const won = winColor === chosen.value
    const mult = colorOf(chosen.value).mult
    const win = won ? stake.value * mult : 0
    if (win > 0) bank.win(win)
    bank.log(stake.value, win, 'Spin Fortune (Wheel)')
    result.value = { winColor, won, win, mult, house: winColor === 'house' }
    history.value.unshift({ color: winColor, won })
    history.value = history.value.slice(0, 14)
    spinning.value = false
  }, 4300)
}
</script>

<template>
  <div class="game">
    <div class="left">
      <div class="wheelwrap">
        <div class="pointer">▼</div>
        <div class="wheel" :style="{ background: gradient, transform: `rotate(${angle}deg)`, transition: spinning ? 'transform 4.2s cubic-bezier(.15,.7,.15,1)' : 'none' }"></div>
        <div class="hub">
          <template v-if="spinning">…</template>
          <template v-else-if="result">
            <span class="hub-x" :style="{ color: colorOf(result.winColor).hex }">{{ colorOf(result.winColor).label.toUpperCase() }}</span>
          </template>
          <template v-else>SPIN</template>
        </div>
      </div>

      <div class="out" :class="result && (result.won ? 'win' : 'lose')">
        <template v-if="result">
          <b v-if="result.won" class="win">🎉 {{ colorOf(result.winColor).label }} wins · +{{ bank.symbol.value }}{{ result.win.toFixed(2) }}</b>
          <b v-else-if="result.house" class="lose">🏦 House segment — everyone loses this spin</b>
          <b v-else class="lose">Landed on {{ colorOf(result.winColor).label }} — your {{ chosen ? colorOf(chosen).label : '' }} lost</b>
        </template>
        <span v-else-if="chosen">You picked {{ colorOf(chosen).label }} · potential {{ bank.symbol.value }}{{ potential.toFixed(2) }}</span>
        <span v-else>Pick a colour, set your stake, then spin</span>
      </div>

      <div class="hist">
        <span v-for="(h, i) in history" :key="i" class="chip" :style="{ background: colorOf(h.color).hex, color: h.color === 'house' ? '#fff' : 'rgba(0,0,0,.65)' }">
          {{ h.color === 'house' ? 'H' : colorOf(h.color).label.charAt(0) }}
        </span>
      </div>
    </div>

    <BetControls v-model:stake="stake" v-model:mode="mode" :balance="bank.balance.value" :symbol="bank.symbol.value" :mode="mode" :disabled="spinning">
      <div class="picker">
        <button v-for="c in COLORS" :key="c.key" class="col" :class="{ on: chosen === c.key }"
          :style="{ '--c': c.hex }" :disabled="spinning" @click="chosen = c.key">
          <span class="sw"></span>
          <span class="nm">{{ c.label }}</span>
          <span class="mx">{{ c.mult.toFixed(2) }}×</span>
        </button>
      </div>
      <p class="hnote"><span class="sw" :style="{ background: HOUSE_HEX }"></span> 3 house segments — house takes the pot (no colour wins)</p>
      <div class="pot">
        <span>Potential win</span>
        <b>{{ bank.symbol.value }}{{ potential.toFixed(2) }}</b>
      </div>
      <button class="btn btn-cta act" :disabled="spinning || !chosen || !bank.canBet(stake)" @click="spin">
        {{ spinning ? 'Spinning…' : chosen ? `Spin · ${bank.symbol.value}${stake.toFixed(2)}` : 'Pick a colour' }}
      </button>
    </BetControls>
  </div>
</template>

<style scoped>
.game { display: grid; grid-template-columns: 1fr 300px; gap: 16px; align-items: start; }
.wheelwrap { position: relative; width: min(380px, 82vw); aspect-ratio: 1; margin: 6px auto 0; }
.pointer { position: absolute; top: -6px; left: 50%; transform: translateX(-50%); z-index: 4; color: #fff; font-size: 26px; filter: drop-shadow(0 2px 4px #000); }
.wheel { position: absolute; inset: 0; border-radius: 999px; border: 6px solid #1e1953; box-shadow: 0 0 0 4px #2a2270, inset 0 0 40px rgba(0,0,0,.45); }
.hub { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); z-index: 3; width: 88px; height: 88px; border-radius: 999px; background: radial-gradient(circle,var(--panel-3),var(--panel)); border: 3px solid var(--line); display: grid; place-items: center; font-weight: 900; font-size: 14px; letter-spacing: .05em; color: var(--brand-2); text-align: center; }
.hub-x { font-size: 15px; }
.out { text-align: center; margin-top: 18px; color: var(--muted); font-weight: 700; min-height: 24px; }
.out .win { color: var(--green); font-size: 18px; } .out .lose { color: var(--red); }
.hist { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; margin-top: 12px; }
.chip { width: 24px; height: 24px; border-radius: 999px; display: grid; place-items: center; font-size: 11px; font-weight: 900; border: 1px solid rgba(255,255,255,.2); }
.picker { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.col { display: flex; align-items: center; gap: 8px; border: 1px solid var(--line); background: var(--panel-3); border-radius: 10px; padding: 9px 10px; color: var(--text); font-weight: 700; }
.col .sw { width: 16px; height: 16px; border-radius: 5px; background: var(--c); flex-shrink: 0; }
.col .nm { font-size: 13px; } .col .mx { margin-left: auto; font-size: 12px; color: var(--muted); }
.col.on { border-color: var(--c); box-shadow: 0 0 0 2px var(--c) inset; }
.hnote { display: flex; align-items: center; gap: 7px; color: var(--muted); font-size: 11.5px; margin: 2px 0 0; }
.hnote .sw { width: 12px; height: 12px; border-radius: 4px; flex-shrink: 0; }
.pot { display: flex; align-items: center; justify-content: space-between; background: var(--bg-2); border: 1px solid var(--line); border-radius: 10px; padding: 10px 14px; }
.pot span { color: var(--muted); font-size: 12.5px; } .pot b { font-size: 16px; color: var(--gold); }
.act { width: 100%; padding: 14px; font-size: 16px; }
@media (max-width: 780px) { .game { grid-template-columns: 1fr; } }
</style>
