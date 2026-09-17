<script setup>
import { ref, computed } from 'vue'
import BetControls from './BetControls.vue'
import { useBank } from '../../lib/bank'

const props = defineProps({ mode: { type: String, default: 'demo' } })
const emit = defineEmits(['update:mode'])
const mode = computed({ get: () => props.mode, set: (v) => emit('update:mode', v) })
const bank = useBank(mode)

const PAY = 1.9 // 50% win * 1.9 = 0.95 RTP (5% house edge)
const stake = ref(5)
const pick = ref('heads')
const flipping = ref(false)
const face = ref('heads')
const spin = ref(0)
const outcome = ref(null)
const history = ref([])

function flip() {
  if (flipping.value || !bank.canBet(stake.value)) return
  if (!bank.bet(stake.value)) return
  flipping.value = true
  outcome.value = null
  const result = Math.random() < 0.5 ? 'heads' : 'tails'
  spin.value += 1800 + (result === 'heads' ? 0 : 180)
  setTimeout(() => {
    face.value = result
    const won = result === pick.value
    const win = won ? stake.value * PAY : 0
    if (win > 0) bank.win(win)
    bank.log(stake.value, win, 'Coin Flip')
    outcome.value = { won, win, result }
    history.value.unshift(result)
    history.value = history.value.slice(0, 16)
    flipping.value = false
  }, 1200)
}
</script>

<template>
  <div class="game">
    <div class="left">
      <div class="stage">
        <div class="coin" :style="{ transform: `rotateY(${spin}deg)`, transition: flipping ? 'transform 1.15s ease-out' : 'none' }">
          <div class="side h">H</div>
          <div class="side t">T</div>
        </div>
      </div>
      <div class="out" :class="outcome && (outcome.won ? 'win' : 'lose')">
        <template v-if="outcome">
          <b v-if="outcome.won" class="win">{{ outcome.result === 'heads' ? 'Heads' : 'Tails' }}! +{{ bank.symbol.value }}{{ outcome.win.toFixed(2) }} 🎉</b>
          <b v-else class="lose">{{ outcome.result === 'heads' ? 'Heads' : 'Tails' }} — you lost</b>
        </template>
        <span v-else>Pick a side and flip · pays {{ PAY }}×</span>
      </div>
      <div class="hist">
        <span v-for="(h, i) in history" :key="i" class="chip" :class="h">{{ h === 'heads' ? 'H' : 'T' }}</span>
      </div>
    </div>

    <BetControls v-model:stake="stake" v-model:mode="mode" :balance="bank.balance.value" :symbol="bank.symbol.value" :mode="mode" :disabled="flipping">
      <div class="picker">
        <button class="side-btn h" :class="{ on: pick === 'heads' }" :disabled="flipping" @click="pick = 'heads'">Heads</button>
        <button class="side-btn t" :class="{ on: pick === 'tails' }" :disabled="flipping" @click="pick = 'tails'">Tails</button>
      </div>
      <button class="btn btn-cta act" :disabled="flipping || !bank.canBet(stake)" @click="flip">
        {{ flipping ? 'Flipping…' : `Flip · ${bank.symbol.value}${stake.toFixed(2)}` }}
      </button>
    </BetControls>
  </div>
</template>

<style scoped>
.game { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 16px; align-items: start; }
.stage { display: grid; place-items: center; padding: 40px 0; perspective: 900px; }
.coin { position: relative; width: 150px; height: 150px; transform-style: preserve-3d; }
.side { position: absolute; inset: 0; border-radius: 999px; display: grid; place-items: center; font-size: 64px; font-weight: 900; color: #3a2a00; backface-visibility: hidden; box-shadow: inset 0 0 0 6px rgba(0,0,0,.15), 0 14px 30px rgba(0,0,0,.4); }
.side.h { background: radial-gradient(circle at 35% 30%, #ffe37a, #ff9f1c); }
.side.t { background: radial-gradient(circle at 35% 30%, #d9e2ff, #8aa0d8); transform: rotateY(180deg); }
.out { text-align: center; color: var(--muted); font-weight: 700; min-height: 24px; }
.out .win { color: var(--green); font-size: 18px; } .out .lose { color: var(--red); }
.hist { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; margin-top: 14px; }
.chip { width: 24px; height: 24px; border-radius: 999px; display: grid; place-items: center; font-size: 11px; font-weight: 900; }
.chip.heads { background: linear-gradient(135deg,#ffe37a,#ff9f1c); color: #3a2a00; }
.chip.tails { background: linear-gradient(135deg,#d9e2ff,#8aa0d8); color: #10203a; }
.picker { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.side-btn { border: 1px solid var(--line); border-radius: 10px; padding: 12px; font-weight: 800; color: #fff; }
.side-btn.h { background: linear-gradient(135deg,#ffb020,#ff8a00); color: #3a2a00; }
.side-btn.t { background: linear-gradient(135deg,#7aa0ff,#4a63c9); }
.side-btn.on { box-shadow: 0 0 0 2px #fff inset; }
.side-btn:disabled { opacity: .5; }
.act { width: 100%; padding: 14px; font-size: 16px; }
@media (max-width: 780px) { .game { grid-template-columns: 1fr; } }
</style>
