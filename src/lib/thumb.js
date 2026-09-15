// Generates original game thumbnails as SVG data URIs — no external images,
// no branded characters. Each tile is a gradient + abstract emblem + title.

function hash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i), (h |= 0)
  return Math.abs(h)
}

const PALETTES = [
  ['#7c4dff', '#ff2d78'],
  ['#22d3ee', '#3b82f6'],
  ['#f7971e', '#ff2d78'],
  ['#00c6ff', '#7c4dff'],
  ['#43cea2', '#185a9d'],
  ['#e96443', '#904e95'],
  ['#ff9966', '#ff5e62'],
  ['#8360c3', '#2ebf91'],
  ['#f8567f', '#5f0f40'],
  ['#12c2e9', '#c471ed'],
]

// Simple abstract emblems keyed by category — drawn, not clip-art.
const EMBLEMS = {
  slots: '<circle cx="0" cy="-22" r="15"/><circle cx="-24" cy="14" r="15"/><circle cx="24" cy="14" r="15"/>',
  live: '<rect x="-26" y="-20" width="52" height="40" rx="8"/><circle cx="0" cy="0" r="10" fill="#000" opacity="0.25"/>',
  table: '<path d="M0 -28 L26 0 L0 28 L-26 0 Z"/>',
  jackpot: '<path d="M0 -30 L9 -9 L31 -9 L13 4 L20 26 L0 12 L-20 26 L-13 4 L-31 -9 L-9 -9 Z"/>',
  crash: '<path d="M-24 24 L6 -20 L2 4 L24 -8 L-2 30 Z"/>',
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function thumb(title, cat = 'slots', ratio = 'square') {
  const seed = hash(title + cat)
  const [c1, c2] = PALETTES[seed % PALETTES.length]
  const [w, h] = ratio === 'wide' ? [640, 360] : [360, 360]
  const angle = seed % 90
  const emblem = EMBLEMS[cat] || EMBLEMS.slots
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" gradientTransform="rotate(${angle})">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="v" cx="50%" cy="40%" r="75%">
      <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.5"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <circle cx="${w * 0.8}" cy="${h * 0.18}" r="${w * 0.22}" fill="#fff" opacity="0.08"/>
  <g transform="translate(${w / 2}, ${h * 0.42})" fill="#ffffff" opacity="0.92">${emblem}</g>
  <rect width="${w}" height="${h}" fill="url(#v)"/>
  <text x="${w / 2}" y="${h - 34}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="800" font-size="26" fill="#fff">${esc(title)}</text>
</svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}
