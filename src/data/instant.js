// Games registry — every entry is an actually-playable game with a house edge.
export const CATEGORIES = [
  { key: 'slots', label: 'Slots', icon: '🎰' },
  { key: 'table', label: 'Table Games', icon: '🃏' },
  { key: 'instant', label: 'Instant Games', icon: '🚀' },
  { key: 'jackpot', label: 'Jackpots', icon: '💎' },
]

export const INSTANT = [
  // ---- Instant ----
  { id: 'crash', name: 'Liftoff', cat: 'instant', tag: 'Crash', accent: '#22d3ee', emoji: '🚀', blurb: 'Cash out before the rocket flies away.' },
  { id: 'mines', name: 'Gem Hunt', cat: 'instant', tag: 'Mines', accent: '#34d399', emoji: '💎', blurb: 'Uncover gems, dodge the bombs.' },
  { id: 'dice', name: 'Turbo Dice', cat: 'instant', tag: 'Dice', accent: '#f59e0b', emoji: '🎲', blurb: 'Roll over or under your target.' },
  { id: 'plinko', name: 'Plinko Drop', cat: 'instant', tag: 'Plinko', accent: '#3b82f6', emoji: '🔵', blurb: 'Drop the ball, chase the edges.' },
  { id: 'coinflip', name: 'Coin Flip', cat: 'instant', tag: 'Coin', accent: '#eab308', emoji: '🪙', blurb: 'Heads or tails — pick a side.' },
  { id: 'wheel', name: 'Spin Fortune', cat: 'instant', tag: 'Wheel', accent: '#b47bff', emoji: '🎡', blurb: 'Bet a colour, spin the wheel.' },
  // ---- Slots ----
  { id: 'slots', name: 'Rune Reels', cat: 'slots', tag: 'Slots', accent: '#ff2d78', emoji: '🎰', blurb: 'Match three runes to win up to 500×.' },
  { id: 'slots-fruit', name: 'Fruit Frenzy', cat: 'slots', tag: 'Slots', accent: '#22c55e', emoji: '🍉', blurb: 'Juicy 3-reel classic slot.' },
  { id: 'slots-gem', name: 'Gem Storm', cat: 'slots', tag: 'Slots', accent: '#38bdf8', emoji: '💠', jackpot: true, blurb: 'High-volatility gems, 500× top prize.' },
  // ---- Table ----
  { id: 'roulette', name: 'European Roulette', cat: 'table', tag: 'Roulette', accent: '#ef4444', emoji: '🎯', jackpot: true, blurb: 'Single-zero roulette — 35× on a straight number.' },
  { id: 'blackjack', name: 'Blackjack 21', cat: 'table', tag: 'Cards', accent: '#f8fafc', emoji: '🂡', blurb: 'Beat the dealer to 21. Blackjack pays 3:2.' },
  { id: 'dragontiger', name: 'Dragon Tiger', cat: 'table', tag: 'Cards', accent: '#f97316', emoji: '🐉', blurb: 'One card each — Dragon, Tiger or Tie.' },
  { id: 'hilo', name: 'Hi-Lo', cat: 'table', tag: 'Cards', accent: '#ef4444', emoji: '🎴', blurb: 'Higher or lower, live auto-rounds.' },
]

export function instantById(id) {
  return INSTANT.find((g) => g.id === id)
}
export function byCat(cat) {
  if (cat === 'jackpot') return INSTANT.filter((g) => g.jackpot)
  return INSTANT.filter((g) => g.cat === cat)
}
