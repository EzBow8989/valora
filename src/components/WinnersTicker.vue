<script setup>
import { computed } from 'vue'
import { useUserStore } from '../store/user'
import { GAMES } from '../data/games'

const store = useUserStore()
// Deterministic-ish demo winners row (masked names).
const winners = computed(() => {
  const pick = [4, 11, 19, 27, 33, 41, 6, 22, 15, 30]
  return pick.map((i, k) => {
    const g = GAMES[i % GAMES.length]
    const amt = [50, 120, 300, 75, 500, 90, 240, 60, 150, 420][k]
    return { name: '****' + String.fromCharCode(97 + (i % 20)) + '***', game: g.title, amt }
  })
})
</script>

<template>
  <div class="ticker">
    <div class="container inner">
      <span class="label">🏆 Latest Payouts</span>
      <div class="marquee">
        <div class="row">
          <span v-for="(w, i) in [...winners, ...winners]" :key="i" class="item">
            <span class="who">{{ w.name }}</span>
            <span class="game">{{ w.game }}</span>
            <span class="amt">{{ store.symbol }}{{ w.amt.toFixed(2) }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticker { background: linear-gradient(90deg, var(--panel-2), var(--panel)); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.inner { display: flex; align-items: center; gap: 14px; height: 44px; overflow: hidden; }
.label { flex-shrink: 0; font-weight: 800; font-size: 12.5px; color: var(--gold); text-transform: uppercase; letter-spacing: .04em; }
.marquee { flex: 1; overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent); mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent); }
.row { display: inline-flex; gap: 26px; white-space: nowrap; animation: slide 34s linear infinite; }
.item { display: inline-flex; align-items: center; gap: 8px; font-size: 12.5px; }
.who { color: var(--muted); }
.game { color: var(--text); font-weight: 600; }
.amt { color: var(--green); font-weight: 800; }
@keyframes slide { from { transform: translateX(0); } to { transform: translateX(-50%); } }
</style>
