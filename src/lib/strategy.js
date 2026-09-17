// Strategy engine + a lightweight natural-language parser.
// A "win" round = the round returned at least the stake (net non-loss).

export const STRATEGIES = [
  ['martingale', 'Martingale (×2 on loss, reset on win)'],
  ['custom', 'Custom (×N on loss, reset on win)'],
  ['paroli', 'Reverse / Paroli (×2 on win, reset on loss)'],
  ['fibonacci', 'Fibonacci'],
  ['dalembert', "D'Alembert (+1 unit loss, −1 win)"],
  ['flat', 'Flat (same bet)'],
]

const FIB = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987]

// Returns the next stake given the round result.
export function nextBet(cfg, s) {
  const { kind, base, factor } = cfg
  if (kind === 'flat') return base
  if (kind === 'martingale' || kind === 'custom') return s.won ? base : s.bet * (factor || 2)
  if (kind === 'paroli') return s.won ? s.bet * (factor || 2) : base
  if (kind === 'dalembert') return s.won ? Math.max(base, s.bet - base) : s.bet + base
  if (kind === 'fibonacci') {
    s.fi = s.won ? Math.max(0, (s.fi ?? 0) - 2) : (s.fi ?? 0) + 1
    return base * FIB[Math.min(s.fi, FIB.length - 1)]
  }
  return base
}

// Plain-English -> config. Understands things like:
// "bet 5, double on loss, reset to 5 on win, max 250, 200 rounds"
export function parseStrategy(text) {
  const t = (text || '').toLowerCase()
  const num = (re, d) => { const m = t.match(re); return m ? parseFloat(m[1]) : d }

  const base = num(/(?:bet|start(?:ing)?(?: with)?|from)\s*\$?€?rm?\s*([\d.]+)/, null)
    ?? num(/\$?€?rm?\s*([\d.]+)/, 5)

  let kind = 'martingale'
  let factor = 2
  if (/flat|same (?:bet|amount)|no change/.test(t)) kind = 'flat'
  else if (/fibonacci|fib\b/.test(t)) kind = 'fibonacci'
  else if (/paroli|reverse|on win.*(?:double|x ?2|two|twice)/.test(t)) kind = 'paroli'
  else if (/d'?alembert/.test(t)) kind = 'dalembert'
  else if (/triple|x ?3|three times|3x/.test(t)) { kind = 'custom'; factor = 3 }
  else if (/x ?([\d.]+)|times ([\d.]+)/.test(t)) { const m = t.match(/x ?([\d.]+)|times ([\d.]+)/); factor = parseFloat(m[1] || m[2]) || 2; kind = factor === 2 ? 'martingale' : 'custom' }
  else if (/double|x ?2|twice|two times|martingale/.test(t)) { kind = 'martingale'; factor = 2 }

  const maxBet = num(/max(?:imum)?(?: bet)?\s*\$?€?rm?\s*([\d.]+)/, 250)
  const rounds = num(/([\d.]+)\s*(?:rounds|spins|bets|plays|times|games)/, 200)
  const startBalance = num(/(?:balance|bankroll|budget)\s*(?:of\s*)?\$?€?rm?\s*([\d.]+)/, 1000)

  return { kind, base: base || 5, factor, maxBet, rounds: Math.round(rounds), startBalance }
}
