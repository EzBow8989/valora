// RTP / win-loss Monte-Carlo for Valora's playable games.
// Reproduces each game's EXACT client math (see src/components/games/*.vue)
// so we can verify RTP and that both win and loss actually occur.
// Run: node sim/rtp.mjs
const N = 1_000_000

function stats(payouts, stake = 1) {
  const rounds = payouts.length
  const totalWager = rounds * stake
  const totalPayout = payouts.reduce((a, b) => a + b, 0)
  let wins = 0, losses = 0, pushes = 0, max = 0
  for (const p of payouts) {
    if (p > stake + 1e-9) wins++
    else if (p < stake - 1e-9) losses++
    else pushes++
    if (p > max) max = p
  }
  return {
    rtp: (totalPayout / totalWager) * 100,
    winRate: (wins / rounds) * 100,
    lossRate: (losses / rounds) * 100,
    pushRate: (pushes / rounds) * 100,
    maxX: max / stake,
  }
}
const rnd = Math.random

// ---- Crash (Liftoff) : rollCrash + fixed auto-cashout target ----
function rollCrash() {
  const r = rnd()
  if (r < 0.03) return 1.0
  return Math.max(1.01, Math.floor((0.96 / (1 - r)) * 100) / 100)
}
function simCrash(target) {
  const out = []
  for (let i = 0; i < N; i++) {
    const c = rollCrash()
    out.push(c >= target ? target : 0)
  }
  return stats(out)
}

// ---- Mines (Gem Hunt) : pick k tiles then cash out ----
function simMines(mines, k) {
  const SIZE = 25
  const out = []
  for (let i = 0; i < N; i++) {
    let safeLeft = SIZE - mines, minesLeft = mines, tilesLeft = SIZE, alive = true
    for (let p = 0; p < k; p++) {
      if (rnd() < minesLeft / tilesLeft) { alive = false; break }
      safeLeft--; tilesLeft--
    }
    if (!alive) { out.push(0); continue }
    let m = 1
    for (let j = 0; j < k; j++) m *= (SIZE - j) / (SIZE - mines - j)
    out.push(m * 0.97)
  }
  return stats(out)
}

// ---- Dice (Turbo Dice) : roll over target ----
function simDice(target, dir = 'over') {
  const out = []
  const chance = dir === 'over' ? 100 - target : target
  const payout = Math.max(1.01, (100 / chance) * 0.98)
  for (let i = 0; i < N; i++) {
    const r = Math.round(rnd() * 10000) / 100
    const won = dir === 'over' ? r > target : r < target
    out.push(won ? payout : 0)
  }
  return stats(out)
}

// ---- Wheel (Spin Fortune) : colour-bet, 20 segments ----
const WHEEL = ['red','blue','red','green','red','blue','red','gold','red','blue','red','green','red','blue','red','gold','red','blue','red','green']
const WMULT = { red: 1.92, blue: 3.84, green: 6.40, gold: 9.60 }
function simWheelColor(betColor) {
  const out = []
  for (let i = 0; i < N; i++) {
    const win = WHEEL[(rnd() * WHEEL.length) | 0]
    out.push(win === betColor ? WMULT[betColor] : 0)
  }
  return stats(out)
}

// ---- Slots (Rune Reels) ----
function simSlots(SYMS, pairPay) {
  const POOL = SYMS.flatMap((x, idx) => Array(x.w).fill(idx))
  const pay = SYMS.map((x) => x.pay)
  const out = []
  for (let i = 0; i < N; i++) {
    const a = POOL[(rnd() * POOL.length) | 0], b = POOL[(rnd() * POOL.length) | 0], c = POOL[(rnd() * POOL.length) | 0]
    if (a === b && b === c) out.push(pay[a])
    else if (a === b || b === c || a === c) out.push(pairPay)
    else out.push(0)
  }
  return stats(out)
}

// ---- Plinko ----
function simPlinko(MULTS, rows) {
  const out = []
  for (let i = 0; i < N; i++) {
    let rights = 0
    for (let r = 0; r < rows; r++) if (rnd() < 0.5) rights++
    out.push(MULTS[rights])
  }
  return stats(out)
}

// ---- Hi-Lo : optimal side ----
function simHilo() {
  const out = []
  for (let i = 0; i < N; i++) {
    const c = (rnd() * 13 | 0) + 1
    const hi = 13 - c, lo = c - 1
    let dir, payWin
    if (hi >= lo && hi > 0) { dir = 'hi'; payWin = Math.max(1.01, (13 / hi) * 0.96) }
    else if (lo > 0) { dir = 'lo'; payWin = Math.max(1.01, (13 / lo) * 0.96) }
    else { dir = 'hi'; payWin = 0 }
    const n = (rnd() * 13 | 0) + 1
    if (n === c) out.push(0) // tie loses
    else if (dir === 'hi' && n > c) out.push(payWin)
    else if (dir === 'lo' && n < c) out.push(payWin)
    else out.push(0)
  }
  return stats(out)
}

const SYMS_OLD = [
  { s: 'cherry', w: 30, pay: 3 }, { s: 'bell', w: 22, pay: 5 }, { s: 'star', w: 16, pay: 8 },
  { s: 'clover', w: 12, pay: 12 }, { s: 'diamond', w: 8, pay: 20 }, { s: 'crown', w: 5, pay: 40 }, { s: 'seven', w: 3, pay: 100 },
]
const SYMS_NEW = [
  { s: 'cherry', w: 30, pay: 8 }, { s: 'bell', w: 22, pay: 12 }, { s: 'star', w: 16, pay: 22 },
  { s: 'clover', w: 12, pay: 38 }, { s: 'diamond', w: 8, pay: 80 }, { s: 'crown', w: 5, pay: 160 }, { s: 'seven', w: 3, pay: 500 },
]
const MULTS = [10, 2.5, 1.1, 0.9, 0.4, 0.9, 1.1, 2.5, 10]

const P = (o) => `RTP ${o.rtp.toFixed(2)}% | win ${o.winRate.toFixed(1)}% loss ${o.lossRate.toFixed(1)}% push ${o.pushRate.toFixed(1)}% | max ${o.maxX.toFixed(2)}x`
console.log(`Rounds per game: ${N.toLocaleString()}\n`)
console.log('Crash @1.5x  ', P(simCrash(1.5)))
console.log('Crash @2.0x  ', P(simCrash(2.0)))
console.log('Crash @5.0x  ', P(simCrash(5.0)))
console.log('Mines 3, k=3 ', P(simMines(3, 3)))
console.log('Mines 5, k=2 ', P(simMines(5, 2)))
console.log('Dice over 50 ', P(simDice(50)))
console.log('Dice over 90 ', P(simDice(90)))
console.log('Wheel RED    ', P(simWheelColor('red')))
console.log('Wheel BLUE   ', P(simWheelColor('blue')))
console.log('Wheel GREEN  ', P(simWheelColor('green')))
console.log('Wheel GOLD   ', P(simWheelColor('gold')))
console.log('Slots OLD    ', P(simSlots(SYMS_OLD, 0.5)))
console.log('Slots NEW    ', P(simSlots(SYMS_NEW, 0.65)))
console.log('Plinko       ', P(simPlinko(MULTS, 8)))
console.log('Hi-Lo        ', P(simHilo()))
