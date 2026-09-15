// Original Instant Games registry — invented names + abstract art.
export const INSTANT = [
  { id: 'crash', name: 'Liftoff', tag: 'Crash', accent: '#22d3ee', emoji: '🚀', blurb: 'Cash out before the rocket flies away.' },
  { id: 'mines', name: 'Gem Hunt', tag: 'Mines', accent: '#34d399', emoji: '💎', blurb: 'Uncover gems, dodge the bombs.' },
  { id: 'dice', name: 'Turbo Dice', tag: 'Dice', accent: '#f59e0b', emoji: '🎲', blurb: 'Roll over or under your target.' },
  { id: 'wheel', name: 'Spin Fortune', tag: 'Wheel', accent: '#b47bff', emoji: '🎡', blurb: 'Spin the multiplier wheel.' },
  { id: 'slots', name: 'Rune Reels', tag: 'Slots', accent: '#ff2d78', emoji: '🎰', blurb: 'Match three runes to win.' },
  { id: 'plinko', name: 'Plinko Drop', tag: 'Plinko', accent: '#3b82f6', emoji: '🔵', blurb: 'Drop the ball, chase the edges.' },
  { id: 'hilo', name: 'Hi-Lo', tag: 'Cards', accent: '#ef4444', emoji: '🃏', blurb: 'Guess higher or lower.' },
]

export function instantById(id) {
  return INSTANT.find((g) => g.id === id)
}
