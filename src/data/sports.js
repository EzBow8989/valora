// Original demo sports fixtures + odds. Illustrative only.
export const SPORTS = [
  { key: 'football', label: 'Football', icon: '⚽' },
  { key: 'basketball', label: 'Basketball', icon: '🏀' },
  { key: 'tennis', label: 'Tennis', icon: '🎾' },
  { key: 'esports', label: 'Esports', icon: '🎮' },
  { key: 'mma', label: 'MMA', icon: '🥊' },
]

export const MATCHES = [
  { id: 'm1', sport: 'football', league: 'Nordic League', live: true, minute: 63, a: 'Fjordvik FC', b: 'Boreal United', sa: 1, sb: 1, odds: [2.35, 3.1, 2.9] },
  { id: 'm2', sport: 'football', league: 'Nordic League', live: true, minute: 21, a: 'Aurora City', b: 'Vortex Athletic', sa: 0, sb: 2, odds: [4.5, 3.6, 1.72] },
  { id: 'm3', sport: 'football', league: 'Continental Cup', live: false, kick: 'Today 20:45', a: 'Monarch SC', b: 'Quantum Rovers', odds: [1.9, 3.4, 3.8] },
  { id: 'm4', sport: 'basketball', league: 'Pro Hoops', live: true, minute: 'Q3', a: 'Hex Hawks', b: 'Nova Nets', sa: 61, sb: 58, odds: [1.65, null, 2.2] },
  { id: 'm5', sport: 'tennis', league: 'Open Series', live: false, kick: 'Tomorrow 14:00', a: 'K. Sørensen', b: 'L. Marchetti', odds: [1.55, null, 2.45] },
  { id: 'm6', sport: 'esports', league: 'Arena Masters', live: true, minute: 'Map 2', a: 'Team Ignite', b: 'Frost Byte', sa: 1, sb: 0, odds: [1.42, null, 2.9] },
  { id: 'm7', sport: 'mma', league: 'Cage Night', live: false, kick: 'Sat 22:00', a: 'D. Okoro', b: 'R. Halvorsen', odds: [1.8, null, 2.0] },
  { id: 'm8', sport: 'basketball', league: 'Pro Hoops', live: false, kick: 'Today 23:00', a: 'Titan Ballers', b: 'Ember Blaze', odds: [2.05, null, 1.78] },
]
