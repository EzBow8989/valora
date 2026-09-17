<script setup>
import { ref, computed } from 'vue'
import BetControls from './BetControls.vue'
import { useBank } from '../../lib/bank'

const props = defineProps({ mode: { type: String, default: 'demo' } })
const emit = defineEmits(['update:mode'])
const mode = computed({ get: () => props.mode, set: (v) => emit('update:mode', v) })
const bank = useBank(mode)

const stake = ref(5)
const target = ref(50)
const dir = ref('over') // over | under
const rolling = ref(false)
const result = ref(null) // last roll number
const outcome = ref(null) // 'win' | 'lose' | null
const lastWin = ref(0)
const landed = ref(false)

const chance = computed(() => (dir.value === 'over' ? 100 - target.value : target.value))
// 10% house edge; slider is capped to 25–75 so no near-certain bet exists.
const payout = computed(() => Math.max(1.01, (100 / chance.value) * 0.90))

function roll() {
  if (rolling.value || !bank.canBet(stake.value)) return
  if (!bank.bet(stake.value)) return
  rolling.value = true
  outcome.value = null
  landed.value = false
  // authoritative result first; the tumble is just its representation
  const r = Math.round(Math.random() * 10000) / 100
  let delay = 40, elapsed = 0
  const step = () => {
    if (elapsed < 1350) {
      result.value = Math.round(Math.random() * 10000) / 100
      elapsed += delay
      delay = Math.min(delay * 1.22, 240) // decelerate like a settling die
      setTimeout(step, delay)
    } else {
      result.value = r
      landed.value = true
      const won = dir.value === 'over' ? r > target.value : r < target.value
      if (won) {
        const win = stake.value * payout.value
        bank.win(win); lastWin.value = win; outcome.value = 'win'
        bank.log(stake.value, win, 'Turbo Dice')
      } else {
        outcome.value = 'lose'
        bank.log(stake.value, 0, 'Turbo Dice')
      }
      rolling.value = false
    }
  }
  step()
}
</script>

<template>
  <div class="game">
    <div class="left">
      <div class="result card" :class="[outcome, { rolling, landed }]">
        <div class="die" :class="{ spin: rolling, win: outcome === 'win', lose: outcome === 'lose' }" aria-hidden="true">🎲</div>
        <div class="num" :class="[outcome, { rolling, landed }]">{{ result === null ? '—' : result.toFixed(2) }}</div>
        <p v-if="outcome === 'win'" class="msg win">🎯 {{ result.toFixed(2) }} {{ dir === 'over' ? '>' : '<' }} {{ target }} — Win! +{{ bank.symbol.value }}{{ lastWin.toFixed(2) }}</p>
        <p v-else-if="outcome === 'lose'" class="msg lose">💥 {{ result.toFixed(2) }} {{ dir === 'over' ? '<' : '>' }} {{ target }} — missed</p>
        <p v-else-if="rolling" class="msg">Rolling…</p>
        <p v-else class="msg">Roll {{ dir }} {{ target }}.00 to win</p>
      </div>

      <div class="slider">
        <div class="track">
          <div class="fill" :class="dir" :style="dir === 'over' ? { left: target + '%', right: 0 } : { left: 0, width: target + '%' }"></div>
          <div v-if="result !== null" class="marker" :style="{ left: result + '%' }"></div>
        </div>
        <input v-model.number="target" type="range" min="25" max="75" :disabled="rolling" />
        <div class="ticks"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
      </div>

      <div class="stats">
        <div><span>Chance</span><b>{{ chance.toFixed(0) }}%</b></div>
        <div><span>Payout</span><b>{{ payout.toFixed(2) }}×</b></div>
        <div><span>Target</span><b>{{ target }}.00</b></div>
      </div>
    </div>

    <BetControls v-model:stake="stake" v-model:mode="mode" :balance="bank.balance.value" :symbol="bank.symbol.value" :mode="mode" :disabled="rolling">
      <div class="dir">
        <button :class="{ on: dir === 'under' }" :disabled="rolling" @click="dir = 'under'">Roll Under</button>
        <button :class="{ on: dir === 'over' }" :disabled="rolling" @click="dir = 'over'">Roll Over</button>
      </div>
      <button class="btn btn-cta act" :disabled="rolling || !bank.canBet(stake)" @click="roll">
        {{ rolling ? 'Rolling…' : `Roll · ${bank.symbol.value}${stake.toFixed(2)}` }}
      </button>
    </BetControls>
  </div>
</template>

<style scoped>
.game { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 16px; align-items: start; }
.result { padding: 22px 26px 26px; text-align: center; margin-bottom: 18px; transition: box-shadow .2s ease, background .2s ease; }
.result.win { box-shadow: 0 0 0 1px #1c5b45, 0 0 40px -8px var(--green); }
.result.lose { animation: shake .4s ease; }
@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
.die { font-size: 40px; line-height: 1; display: inline-block; filter: drop-shadow(0 6px 10px rgba(0,0,0,.4)); }
.die.spin { animation: tumble .5s linear infinite; }
.die.win { animation: pop .4s ease; } .die.lose { filter: grayscale(1) drop-shadow(0 6px 10px rgba(0,0,0,.4)); }
@keyframes tumble { from { transform: rotate(0) scale(1); } 50% { transform: rotate(180deg) scale(1.12); } to { transform: rotate(360deg) scale(1); } }
@keyframes pop { 0%{transform:scale(1)} 40%{transform:scale(1.4)} to{transform:scale(1)} }
.num { font-size: clamp(40px, 8.5vw, 72px); font-weight: 900; letter-spacing: -.03em; transition: color .15s ease; }
.num.rolling { color: var(--muted); opacity: .85; filter: blur(.4px); }
.num.landed { animation: bounce .45s cubic-bezier(.2,1.4,.5,1); }
@keyframes bounce { 0%{transform:scale(1.5);opacity:.4} to{transform:scale(1);opacity:1} }
.num.win { color: var(--green); } .num.lose { color: var(--red); }
.msg { color: var(--muted); margin: 6px 0 0; font-weight: 700; }
.msg.win { color: var(--green); } .msg.lose { color: var(--red); }
.slider { padding: 8px 4px 0; }
.track { position: relative; height: 12px; border-radius: 999px; background: var(--red); overflow: visible; margin-bottom: 8px; }
.fill { position: absolute; top: 0; bottom: 0; background: var(--green); border-radius: 999px; }
.marker { position: absolute; top: -6px; width: 4px; height: 24px; background: #fff; border-radius: 3px; transform: translateX(-50%); box-shadow: 0 0 8px #fff; transition: left .12s linear; }
input[type=range] { width: 100%; accent-color: var(--brand-2); }
.ticks { display: flex; justify-content: space-between; color: var(--muted); font-size: 11px; margin-top: 2px; }
.stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-top: 16px; }
.stats div { background: var(--panel-2); border: 1px solid var(--line); border-radius: 10px; padding: 10px; text-align: center; }
.stats span { display: block; color: var(--muted); font-size: 11.5px; }
.stats b { font-size: 16px; }
.dir { display: flex; gap: 6px; }
.dir button { flex: 1; border: 1px solid var(--line); background: var(--panel-3); color: var(--text); border-radius: 9px; padding: 10px; font-weight: 800; font-size: 13px; }
.dir button.on { background: linear-gradient(135deg,var(--brand-2),var(--brand)); border-color: transparent; }
.act { width: 100%; padding: 14px; font-size: 16px; }
@media (max-width: 780px) { .game { grid-template-columns: 1fr; } }
</style>
