// Payout samplers that mirror each game's REAL math (see components/games/*.vue).
// Each returns a payout multiplier of the stake for one round (0 = total loss).
// Used by the Strategy Lab to auto-run strategies without clicking the UI.
const R = () => Math.random()

const R_RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36])
const SLOT_W = [30,22,16,12,8,5,3], SLOT_PAY = [8,12,22,38,80,160,500]
const SLOT_POOL = SLOT_W.flatMap((w, i) => Array(w).fill(i))
const WHEEL = ['red','blue','red','green','red','blue','red','gold','red','blue','red','green','red','blue','red','gold','red','blue','red','green','house','blue','house','house']
const PLINKO = [10, 2.5, 1.0, 0.8, 0.35, 0.8, 1.0, 2.5, 10]

function slot() {
  const a = SLOT_POOL[R()*SLOT_POOL.length|0], b = SLOT_POOL[R()*SLOT_POOL.length|0], c = SLOT_POOL[R()*SLOT_POOL.length|0]
  if (a === b && b === c) return SLOT_PAY[a]
  if (a === b || b === c || a === c) return 0.55
  return 0
}
function crash(target) {
  const r = R()
  const c = r < 0.04 ? 1.0 : Math.max(1.01, Math.floor((0.90 / (1 - r)) * 100) / 100)
  return c >= target ? target : 0
}
function mines(m, picks) {
  let minesLeft = m, tiles = 25
  for (let i = 0; i < picks; i++) { if (R() < minesLeft / tiles) return 0; tiles-- }
  let mult = 1
  for (let i = 0; i < picks; i++) mult *= (25 - i) / (25 - m - i)
  return mult * 0.90
}
function hilo() {
  const c = 5 + (R()*5|0)          // betting card 5–9
  const hi = 13 - c, lo = c - 1
  const dir = hi >= lo ? 'hi' : 'lo'
  const count = dir === 'hi' ? hi : lo
  const pay = Math.max(1.01, (13 / count) * 0.90)
  const n = (R()*13|0) + 1
  if (n === c) return 0
  return (dir === 'hi' ? n > c : n < c) ? pay : 0
}

// key -> { label, pay (display), winMult (typical win payout, for smart recovery), sample() }
export const GAME_SIMS = {
  coinflip:   { label: 'Coin Flip — heads', pay: '1.9× · 50%',  winMult: 1.9,  sample: () => (R() < 0.5 ? 1.9 : 0) },
  dice:       { label: 'Turbo Dice — over 50', pay: '1.8× · 50%', winMult: 1.8, sample: () => (R()*100 > 50 ? 1.8 : 0) },
  roulette:   { label: 'Roulette — red', pay: '2× · 48.6%',      winMult: 2,    sample: () => (R_RED.has(R()*37|0) ? 2 : 0) },
  wheel:      { label: 'Spin Fortune — red', pay: '2.16× · 41.7%', winMult: 2.16, sample: () => (WHEEL[R()*24|0] === 'red' ? 2.16 : 0) },
  dragontiger:{ label: 'Dragon Tiger — dragon', pay: '1.95× · 46%', winMult: 1.95, sample: () => { const d=(R()*13|0)+1,t=(R()*13|0)+1; return d>t?1.95:0 } },
  hilo:       { label: 'Hi-Lo — best side', pay: 'variable · ~55%', winMult: 1.6, sample: hilo },
  crash:      { label: 'Liftoff — cashout 2×', pay: '2× · ~44%',  winMult: 2,    sample: () => crash(2) },
  plinko:     { label: 'Plinko Drop', pay: '0.35–10×',           winMult: 2.5,  sample: () => PLINKO[(() => { let r=0; for (let i=0;i<8;i++) if (R()<0.5) r++; return r })()] },
  mines:      { label: 'Gem Hunt — 3 mines, 3 picks', pay: '1.34× · 67%', winMult: 1.34, sample: () => mines(3, 3) },
  slots:      { label: 'Rune Reels', pay: '0–500×',              winMult: 8,    sample: slot },
}

export const GAME_LIST = [
  ['coinflip', 'Coin Flip'], ['dice', 'Turbo Dice'], ['roulette', 'Roulette'],
  ['wheel', 'Spin Fortune'], ['dragontiger', 'Dragon Tiger'], ['hilo', 'Hi-Lo'],
  ['crash', 'Liftoff (Crash)'], ['plinko', 'Plinko'], ['mines', 'Gem Hunt'], ['slots', 'Slots'],
]
