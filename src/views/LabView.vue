<script setup>
import { ref, reactive, computed, onBeforeUnmount, nextTick } from 'vue'
import { GAME_SIMS, GAME_LIST } from '../lib/gamesim'
import { STRATEGIES, nextBet, parseStrategy } from '../lib/strategy'

const game = ref('coinflip')
const nl = ref('bet 5, double on loss, reset to 5 on win, max 250, 200 rounds')
const cfg = reactive({ kind: 'martingale', base: 5, factor: 2, maxBet: 250, rounds: 200, startBalance: 1000 })
const speed = ref(20) // rounds per tick

const running = ref(false)
const st = reactive({ round: 0, balance: 1000, bet: 5, wins: 0, losses: 0, lossStreak: 0, maxLossStreak: 0, capHits: 0, bust: false, wagered: 0, paid: 0, peak: 1000, trough: 1000 })
const log = ref([])
let history = []
let timer = 0
let s = { bet: 5, won: false, fi: 0 }

const chart = ref(null)
const gmeta = computed(() => GAME_SIMS[game.value])
const rtp = computed(() => (st.wagered ? (st.paid / st.wagered) * 100 : 0))
const pl = computed(() => st.balance - cfg.startBalance)

function applyNl() {
  const p = parseStrategy(nl.value)
  Object.assign(cfg, p)
}

function reset() {
  clearInterval(timer)
  running.value = false
  Object.assign(st, { round: 0, balance: cfg.startBalance, bet: cfg.base, wins: 0, losses: 0, lossStreak: 0, maxLossStreak: 0, capHits: 0, bust: false, wagered: 0, paid: 0, peak: cfg.startBalance, trough: cfg.startBalance })
  s = { bet: cfg.base, won: false, fi: 0 }
  history = [cfg.startBalance]
  log.value = []
  nextTick(draw)
}

function step() {
  let bet = Math.round(s.bet * 100) / 100
  // If the next progression bet would exceed the table max, reset to base —
  // you can't keep doubling past the cap, so the sequence starts over.
  if (bet > cfg.maxBet) { bet = cfg.base; s.bet = cfg.base; s.fi = 0; st.capHits++ }
  bet = Math.max(cfg.base, bet)
  if (bet > st.balance) { st.bust = true; return false }
  st.balance -= bet; st.wagered += bet
  const mult = gmeta.value.sample()
  const ret = bet * mult; st.balance += ret; st.paid += ret
  s.won = ret >= bet
  if (s.won) { st.wins++; st.lossStreak = 0 } else { st.losses++; st.lossStreak++; st.maxLossStreak = Math.max(st.maxLossStreak, st.lossStreak) }
  st.round++
  st.peak = Math.max(st.peak, st.balance); st.trough = Math.min(st.trough, st.balance)
  history.push(st.balance)
  log.value.unshift({ r: st.round, bet, mult, ret, won: s.won, bal: st.balance })
  if (log.value.length > 14) log.value.pop()
  s.bet = nextBet(cfg, { ...s, bet })
  st.bet = s.bet > cfg.maxBet ? cfg.base : Math.max(cfg.base, s.bet)
  return true
}

function start() {
  reset()
  running.value = true
  timer = setInterval(() => {
    for (let i = 0; i < speed.value; i++) {
      if (st.round >= cfg.rounds || st.bust) { stop(); break }
      if (!step()) { stop(); break }
    }
    draw()
  }, 32)
}
function stop() { clearInterval(timer); running.value = false }

function draw() {
  const cv = chart.value; if (!cv) return
  const ctx = cv.getContext('2d')
  const w = cv.width = cv.clientWidth, h = cv.height = cv.clientHeight
  ctx.clearRect(0, 0, w, h)
  const n = history.length
  const min = Math.min(cfg.startBalance, ...history), max = Math.max(cfg.startBalance, ...history)
  const pad = (max - min) * 0.08 || 1
  const lo = min - pad, hi = max + pad
  const x = (i) => (i / Math.max(1, n - 1)) * w
  const y = (v) => h - ((v - lo) / (hi - lo)) * h
  // starting-balance baseline
  ctx.strokeStyle = '#3a3570'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(0, y(cfg.startBalance)); ctx.lineTo(w, y(cfg.startBalance)); ctx.stroke(); ctx.setLineDash([])
  // balance line
  ctx.beginPath()
  for (let i = 0; i < n; i++) { const px = x(i), py = y(history[i]); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py) }
  ctx.strokeStyle = pl.value >= 0 ? '#34d399' : '#f87171'; ctx.lineWidth = 2; ctx.stroke()
  // fill
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath()
  ctx.fillStyle = (pl.value >= 0 ? 'rgba(52,211,153,' : 'rgba(248,113,113,') + '0.12)'; ctx.fill()
}

reset()
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="wrap">
    <div class="head">
      <h1>🧪 Strategy Lab</h1>
      <p>Auto-run any betting strategy against a game's real math. Testing tool — no real money, no wallet touched.</p>
    </div>

    <div class="grid">
      <aside class="panel card">
        <label class="fld">Game
          <select v-model="game" :disabled="running">
            <option v-for="[k, name] in GAME_LIST" :key="k" :value="k">{{ name }}</option>
          </select>
        </label>
        <p class="gnote">{{ gmeta.label }} · pays {{ gmeta.pay }}</p>

        <label class="fld">Describe your strategy
          <textarea v-model="nl" rows="3" :disabled="running" placeholder="e.g. bet 5, double on loss, reset to 5 on win, max 250, 200 rounds"></textarea>
        </label>
        <button class="btn btn-ghost sm" :disabled="running" @click="applyNl">✨ Read my strategy</button>

        <div class="row2">
          <label class="fld sm">Strategy
            <select v-model="cfg.kind" :disabled="running">
              <option v-for="[k, name] in STRATEGIES" :key="k" :value="k">{{ name }}</option>
            </select>
          </label>
        </div>
        <div class="row2">
          <label class="fld sm">Base bet <input v-model.number="cfg.base" type="number" min="0.2" :disabled="running" /></label>
          <label class="fld sm">On-loss × <input v-model.number="cfg.factor" type="number" min="1" step="0.5" :disabled="running" /></label>
        </div>
        <div class="row2">
          <label class="fld sm">Max bet <input v-model.number="cfg.maxBet" type="number" :disabled="running" /></label>
          <label class="fld sm">Balance <input v-model.number="cfg.startBalance" type="number" :disabled="running" /></label>
        </div>
        <div class="row2">
          <label class="fld sm">Rounds <input v-model.number="cfg.rounds" type="number" :disabled="running" /></label>
          <label class="fld sm">Speed <input v-model.number="speed" type="range" min="1" max="200" /></label>
        </div>

        <div class="actions">
          <button v-if="!running" class="btn btn-cta full" @click="start">▶ Run test</button>
          <button v-else class="btn stop full" @click="stop">⏹ Stop</button>
          <button class="btn btn-ghost" :disabled="running" @click="reset">Reset</button>
        </div>
      </aside>

      <section class="results">
        <div class="stats">
          <div class="stat"><span>Balance</span><b>{{ '€' + st.balance.toFixed(2) }}</b></div>
          <div class="stat"><span>Profit / Loss</span><b :class="pl >= 0 ? 'up' : 'down'">{{ (pl >= 0 ? '+' : '') + '€' + pl.toFixed(2) }}</b></div>
          <div class="stat"><span>Round</span><b>{{ st.round }} / {{ cfg.rounds }}</b></div>
          <div class="stat"><span>Next bet</span><b>{{ '€' + st.bet.toFixed(2) }}</b></div>
          <div class="stat"><span>Wins / Losses</span><b>{{ st.wins }} / {{ st.losses }}</b></div>
          <div class="stat"><span>Longest loss streak</span><b>{{ st.maxLossStreak }}</b></div>
          <div class="stat"><span>Max-bet hits</span><b>{{ st.capHits }}</b></div>
          <div class="stat"><span>Actual RTP</span><b>{{ rtp.toFixed(2) }}%</b></div>
        </div>

        <div v-if="st.bust" class="bust">💥 Bankroll couldn't cover the next bet — strategy busted at round {{ st.round }}.</div>

        <div class="chartwrap card"><canvas ref="chart"></canvas></div>

        <div class="logwrap card">
          <div class="loghead"><span>#</span><span>Bet</span><span>Result</span><span>Return</span><span>Balance</span></div>
          <div v-for="l in log" :key="l.r" class="logrow" :class="l.won ? 'w' : 'l'">
            <span>{{ l.r }}</span>
            <span>€{{ l.bet.toFixed(2) }}</span>
            <span>{{ l.mult.toFixed(2) }}× {{ l.won ? 'WIN' : 'loss' }}</span>
            <span>€{{ l.ret.toFixed(2) }}</span>
            <span>€{{ l.bal.toFixed(2) }}</span>
          </div>
          <div v-if="!log.length" class="empty">Run a test to see round-by-round results.</div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.wrap { padding-top: 18px; }
.head h1 { font-size: clamp(22px, 4vw, 30px); margin: 0 0 4px; }
.head p { color: var(--muted); margin: 0 0 18px; font-size: 13.5px; }
.grid { display: grid; grid-template-columns: 320px 1fr; gap: 16px; align-items: start; }
.panel { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.fld { display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: var(--muted); font-weight: 700; min-width: 0; }
.fld.sm { font-size: 11.5px; }
select, input, textarea { width: 100%; min-width: 0; box-sizing: border-box; background: var(--bg-2); border: 1px solid var(--line); border-radius: 9px; padding: 9px 11px; color: var(--text); font-size: 14px; outline: none; font-family: inherit; }
select:focus, input:focus, textarea:focus { border-color: var(--brand); }
input[type=range] { padding: 0; }
.gnote { color: var(--brand-2); font-size: 12px; margin: -2px 0 4px; font-weight: 700; }
.sm { font-size: 12.5px; }
.row2 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
.actions { display: flex; gap: 8px; margin-top: 4px; }
.full { flex: 1; padding: 12px; }
.stop { background: linear-gradient(135deg,#fb7185,#be123c); color: #fff; }
.results { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.stat { background: var(--panel-2); border: 1px solid var(--line); border-radius: 10px; padding: 11px 12px; }
.stat span { display: block; color: var(--muted); font-size: 11px; }
.stat b { font-size: 17px; }
.stat .up { color: var(--green); } .stat .down { color: var(--red); }
.bust { background: rgba(248,113,113,.14); border: 1px solid rgba(248,113,113,.4); color: var(--red); border-radius: 10px; padding: 10px 14px; font-weight: 700; font-size: 13.5px; }
.chartwrap { padding: 10px; height: 240px; }
.chartwrap canvas { width: 100%; height: 100%; display: block; }
.logwrap { padding: 8px 12px; }
.loghead, .logrow { display: grid; grid-template-columns: 40px 1fr 1.4fr 1fr 1.2fr; gap: 8px; font-size: 12.5px; padding: 6px 4px; }
.loghead { color: var(--muted); font-weight: 800; border-bottom: 1px solid var(--line); text-transform: uppercase; font-size: 10.5px; }
.logrow { border-bottom: 1px solid var(--line); }
.logrow.w { color: var(--green); } .logrow.l { color: var(--muted); }
.empty { color: var(--muted); text-align: center; padding: 20px; font-size: 13px; }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } .stats { grid-template-columns: repeat(2, 1fr); } }
</style>
