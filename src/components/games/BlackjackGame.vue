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
const phase = ref('betting') // betting | player | dealer | done
const player = ref([])
const dealer = ref([])
const totalStake = ref(0)
const outcome = ref(null) // { res, win }

function drawCard() {
  const r = Math.floor(Math.random() * 13) + 1 // 1..13
  const s = SUITS[Math.floor(Math.random() * 4)]
  return { r, s, red: s === '♥' || s === '♦' }
}
function handValue(cards) {
  let total = 0, aces = 0
  for (const c of cards) {
    if (c.r === 1) { total += 11; aces++ }
    else total += Math.min(10, c.r)
  }
  while (total > 21 && aces) { total -= 10; aces-- }
  return total
}
const pVal = computed(() => handValue(player.value))
const dVal = computed(() => handValue(dealer.value))
const canDouble = computed(() => phase.value === 'player' && player.value.length === 2 && bank.canBet(stake.value))

function deal() {
  if (phase.value !== 'betting' && phase.value !== 'done') return
  if (!bank.canBet(stake.value) || !bank.bet(stake.value)) return
  totalStake.value = stake.value
  player.value = [drawCard(), drawCard()]
  dealer.value = [drawCard(), drawCard()] // second is the hole
  outcome.value = null
  phase.value = 'player'
  if (handValue(player.value) === 21) stand() // natural
}
function hit() {
  if (phase.value !== 'player') return
  player.value.push(drawCard())
  if (pVal.value > 21) settle()
}
function double() {
  if (!canDouble.value || !bank.bet(stake.value)) return
  totalStake.value += stake.value
  player.value.push(drawCard())
  if (pVal.value > 21) return settle()
  stand()
}
function stand() {
  phase.value = 'dealer'
  while (handValue(dealer.value) < 17) dealer.value.push(drawCard())
  settle()
}
function settle() {
  phase.value = 'done'
  const p = pVal.value, d = dVal.value
  const pBJ = player.value.length === 2 && p === 21
  const dBJ = dealer.value.length === 2 && d === 21
  let res, win = 0
  if (p > 21) res = 'lose'
  else if (pBJ && !dBJ) { res = 'blackjack'; win = totalStake.value * 2.5 }
  else if (dBJ && !pBJ) res = 'lose'
  else if (d > 21 || p > d) { res = 'win'; win = totalStake.value * 2 }
  else if (p < d) res = 'lose'
  else { res = 'push'; win = totalStake.value }
  if (win > 0) bank.win(win)
  bank.log(totalStake.value, win, 'Blackjack 21')
  outcome.value = { res, win }
}
</script>

<template>
  <div class="game">
    <div class="left">
      <div class="table">
        <div class="row">
          <div class="rlabel">Dealer <b v-if="phase !== 'betting'">{{ phase === 'player' ? handValue([dealer[0]]) + ' + ?' : dVal }}</b></div>
          <div class="hand">
            <template v-if="phase !== 'betting'">
              <div v-for="(c, i) in dealer" :key="i" class="cardface" :class="{ red: c.red, hole: phase === 'player' && i === 1 }">
                <template v-if="!(phase === 'player' && i === 1)"><span>{{ RANKS[c.r - 1] }}</span><em>{{ c.s }}</em></template>
                <template v-else>?</template>
              </div>
            </template>
            <div v-else class="cardface back">?</div>
          </div>
        </div>

        <div class="row">
          <div class="rlabel">You <b v-if="phase !== 'betting'" :class="{ bust: pVal > 21 }">{{ pVal }}</b></div>
          <div class="hand">
            <template v-if="phase !== 'betting'">
              <div v-for="(c, i) in player" :key="i" class="cardface" :class="{ red: c.red }"><span>{{ RANKS[c.r - 1] }}</span><em>{{ c.s }}</em></div>
            </template>
            <div v-else class="cardface back">?</div>
          </div>
        </div>

        <div class="out" :class="outcome && outcome.res">
          <template v-if="outcome">
            <b v-if="outcome.res === 'blackjack'" class="win">Blackjack! +{{ bank.symbol.value }}{{ outcome.win.toFixed(2) }} 🎉</b>
            <b v-else-if="outcome.res === 'win'" class="win">You win · +{{ bank.symbol.value }}{{ outcome.win.toFixed(2) }} 🎉</b>
            <b v-else-if="outcome.res === 'push'" class="push">Push — stake returned</b>
            <b v-else class="lose">{{ pVal > 21 ? 'Bust' : 'Dealer wins' }} — you lost</b>
          </template>
          <span v-else-if="phase === 'player'">Hit, Stand or Double?</span>
          <span v-else>Place your bet and deal. Blackjack pays 3:2.</span>
        </div>
      </div>
    </div>

    <BetControls v-model:stake="stake" v-model:mode="mode" :balance="bank.balance.value" :symbol="bank.symbol.value" :mode="mode" :disabled="phase === 'player' || phase === 'dealer'">
      <div v-if="phase === 'player'" class="actions">
        <button class="ab hit" @click="hit">Hit</button>
        <button class="ab stand" @click="stand">Stand</button>
        <button class="ab dbl" :disabled="!canDouble" @click="double">Double</button>
      </div>
      <button v-else class="btn btn-cta act" :disabled="!bank.canBet(stake)" @click="deal">
        Deal · {{ bank.symbol.value }}{{ stake.toFixed(2) }}
      </button>
    </BetControls>
  </div>
</template>

<style scoped>
.game { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 16px; align-items: start; }
.table { background: radial-gradient(120% 120% at 50% 0%, #0f3d2a, #08221700); background-color: #0a2a1c; border: 1px solid var(--line); border-radius: 18px; padding: 26px 30px; }
.row { margin-bottom: 18px; }
.rlabel { color: #bfeede; font-size: 13px; font-weight: 700; margin-bottom: 8px; }
.rlabel b { color: #fff; margin-left: 6px; } .rlabel .bust { color: #fca5a5; }
.hand { display: flex; gap: 8px; flex-wrap: wrap; min-height: 96px; }
.cardface { width: 66px; height: 92px; border-radius: 10px; background: #fff; color: #10141f; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,.4); }
.cardface span { font-size: 24px; font-weight: 900; line-height: 1; } .cardface em { font-size: 20px; font-style: normal; }
.cardface.red { color: #d32f4a; }
.cardface.back, .cardface.hole { background: repeating-linear-gradient(45deg,#0e3a28,#0e3a28 7px,#155039 7px,#155039 14px); color: rgba(255,255,255,.5); font-size: 26px; font-weight: 900; align-items: center; justify-content: center; }
.out { margin-top: 6px; color: #bfeede; font-weight: 700; min-height: 24px; }
.out .win { color: #6ee7b7; font-size: 17px; } .out .lose { color: #fca5a5; } .out .push { color: #fde68a; }
.actions { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
.ab { border: 1px solid var(--line); border-radius: 10px; padding: 13px 4px; font-weight: 800; color: #fff; }
.ab.hit { background: linear-gradient(135deg,#34d399,#0e7490); }
.ab.stand { background: linear-gradient(135deg,#fb7185,#be123c); }
.ab.dbl { background: linear-gradient(135deg,#f59e0b,#b45309); }
.ab:disabled { opacity: .4; }
.act { width: 100%; padding: 14px; font-size: 16px; }
@media (max-width: 780px) { .game { grid-template-columns: 1fr; } }
</style>
