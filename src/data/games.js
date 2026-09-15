// Original demo catalog. All game and provider names are invented for this
// demo; nothing references real studios, titles or characters.

export const PROVIDERS = [
  'SpinForge', 'Boreal Studios', 'Quantum Reels', 'MonarchPlay',
  'Nordly', 'HexaBet Live', 'Aurora Gaming', 'Vortex',
]

export const CATEGORIES = [
  { key: 'slots', label: 'Slots' },
  { key: 'live', label: 'Live Casino' },
  { key: 'table', label: 'Table Games' },
  { key: 'jackpot', label: 'Jackpots' },
  { key: 'crash', label: 'Crash' },
]

const SLOT_NAMES = [
  'Fortune Fjord', 'Neon Valkyrie', 'Gates of Valora', 'Frost Giants',
  'Aztec Ember', 'Midas Mine', 'Cosmic Cascade', 'Dragon Hoard',
  'Lucky Lanterns', 'Book of Runes', 'Pirate Bounty', 'Diamond Voltage',
  'Wild Safari', 'Mystic Orbs', 'Sugar Storm', 'Golden Koi',
  'Thunder Reels', 'Emerald Empire', 'Sunset Samba', 'Vault Breakers',
  'Cyber Fruits', 'Phoenix Rising', 'Crystal Caverns', 'Jungle Jackpot',
]
const LIVE_NAMES = [
  'Voltage Roulette', 'Immersive Blackjack', 'Baccarat Royale', 'Fortune Wheel Live',
  'Mega Board Live', 'Speed Roulette', 'Infinite Blackjack', 'Dragon Tiger Live',
]
const TABLE_NAMES = [
  'European Roulette', 'Blackjack Classic', 'Baccarat Pro', 'Casino Hold’em',
  'Jacks or Better', 'Sic Bo', 'Craps', 'Three Card Poker',
]
const JACKPOT_NAMES = [
  'Mega Fortune Vault', 'Divine Jackpot', 'Empire Riches', 'Colossus Coins',
  'Titan Treasure', 'Royal Millions',
]
const CRASH_NAMES = ['Skybound', 'Crash Comet', 'Ignition', 'Rocket Ascent']

function build() {
  const games = []
  let n = 0
  const add = (title, cat, extra = {}) => {
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    games.push({
      id: id + '-' + (n++),
      title,
      cat,
      provider: PROVIDERS[n % PROVIDERS.length],
      rtp: 94 + ((n * 7) % 500) / 100,
      volatility: ['Low', 'Medium', 'High'][n % 3],
      plays: 1000 + ((n * 9301 + 49297) % 90000),
      new: n % 6 === 0,
      hot: n % 4 === 0,
      demo: cat !== 'live', // live tables have no demo mode
      ...extra,
    })
  }
  SLOT_NAMES.forEach((t) => add(t, 'slots'))
  // pad slots to a larger catalog to exercise pagination/lazy-load
  SLOT_NAMES.forEach((t) => add(t + ' 2', 'slots'))
  SLOT_NAMES.slice(0, 12).forEach((t) => add(t + ' Deluxe', 'slots'))
  LIVE_NAMES.forEach((t) => add(t, 'live'))
  TABLE_NAMES.forEach((t) => add(t, 'table'))
  CRASH_NAMES.forEach((t) => add(t, 'crash', { hot: true }))
  JACKPOT_NAMES.forEach((t, i) =>
    add(t, 'jackpot', { jackpot: 50000 + i * 137500 + ((i * 9973) % 90000) })
  )
  return games
}

export const GAMES = build()

export function byId(id) {
  return GAMES.find((g) => g.id === id)
}

// Simulates a paginated, filterable server-side search API. Returns a slice —
// the frontend never holds the whole catalog in a single rendered list.
export function queryGames({ cat, q, provider, sort, page = 1, pageSize = 24 } = {}) {
  let list = GAMES.slice()
  if (cat) list = list.filter((g) => g.cat === cat)
  if (provider) list = list.filter((g) => g.provider === provider)
  if (q) {
    const s = q.toLowerCase()
    list = list.filter((g) => g.title.toLowerCase().includes(s) || g.provider.toLowerCase().includes(s))
  }
  if (sort === 'popular') list.sort((a, b) => b.plays - a.plays)
  else if (sort === 'new') list.sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0))
  else if (sort === 'az') list.sort((a, b) => a.title.localeCompare(b.title))
  else if (sort === 'rtp') list.sort((a, b) => b.rtp - a.rtp)
  const total = list.length
  const start = (page - 1) * pageSize
  return { items: list.slice(start, start + pageSize), total, page, pageSize, hasMore: start + pageSize < total }
}

export function rail(kind, count = 12) {
  if (kind === 'popular') return [...GAMES].sort((a, b) => b.plays - a.plays).slice(0, count)
  if (kind === 'new') return GAMES.filter((g) => g.new).slice(0, count)
  if (kind === 'jackpot') return GAMES.filter((g) => g.cat === 'jackpot').slice(0, count)
  if (kind === 'live') return GAMES.filter((g) => g.cat === 'live').slice(0, count)
  if (kind === 'crash') return GAMES.filter((g) => g.cat === 'crash').slice(0, count)
  return GAMES.slice(0, count)
}
