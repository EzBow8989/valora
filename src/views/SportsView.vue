<script setup>
import { ref, computed } from 'vue'
import { SPORTS, MATCHES } from '../data/sports'

const active = ref('all')
const filtered = computed(() => (active.value === 'all' ? MATCHES : MATCHES.filter((m) => m.sport === active.value)))
const live = computed(() => filtered.value.filter((m) => m.live))
const upcoming = computed(() => filtered.value.filter((m) => !m.live))
const oddLabels = ['1', 'X', '2']
</script>

<template>
  <div class="container wrap">
    <h1>Sports</h1>

    <div class="sportbar">
      <button :class="{ on: active === 'all' }" @click="active = 'all'">All</button>
      <button v-for="s in SPORTS" :key="s.key" :class="{ on: active === s.key }" @click="active = s.key">
        <span>{{ s.icon }}</span> {{ s.label }}
      </button>
    </div>

    <template v-if="live.length">
      <div class="rail-head"><h2>🔴 Live now</h2></div>
      <div class="matches">
        <div v-for="m in live" :key="m.id" class="match card">
          <div class="lg"><span class="livedot">LIVE {{ m.minute }}</span> {{ m.league }}</div>
          <div class="teams">
            <div class="team"><span>{{ m.a }}</span><b>{{ m.sa }}</b></div>
            <div class="team"><span>{{ m.b }}</span><b>{{ m.sb }}</b></div>
          </div>
          <div class="odds">
            <button v-for="(o, i) in m.odds" :key="i" :disabled="o == null">
              <span>{{ oddLabels[i] }}</span><b>{{ o == null ? '—' : o.toFixed(2) }}</b>
            </button>
          </div>
        </div>
      </div>
    </template>

    <div class="rail-head"><h2>Upcoming</h2></div>
    <div class="matches">
      <div v-for="m in upcoming" :key="m.id" class="match card">
        <div class="lg">{{ m.kick }} · {{ m.league }}</div>
        <div class="teams">
          <div class="team"><span>{{ m.a }}</span></div>
          <div class="team"><span>{{ m.b }}</span></div>
        </div>
        <div class="odds">
          <button v-for="(o, i) in m.odds" :key="i" :disabled="o == null">
            <span>{{ oddLabels[i] }}</span><b>{{ o == null ? '—' : o.toFixed(2) }}</b>
          </button>
        </div>
      </div>
    </div>

    <p class="note">Odds and fixtures are fictional demo data. 18+ · Please gamble responsibly.</p>
  </div>
</template>

<style scoped>
.wrap { padding-top: 18px; }
h1 { font-size: 28px; margin: 0 0 14px; }
.sportbar { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: none; }
.sportbar::-webkit-scrollbar { display: none; }
.sportbar button { flex-shrink: 0; border: 1px solid var(--line); background: var(--panel); color: var(--muted); border-radius: 999px; padding: 8px 16px; font-weight: 800; font-size: 13.5px; }
.sportbar button.on { background: linear-gradient(135deg,var(--brand-2),var(--brand)); border-color: transparent; color: #fff; }
.matches { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.match { padding: 14px 16px; }
.lg { color: var(--muted); font-size: 12px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.livedot { background: #ef4444; color: #fff; font-weight: 800; font-size: 10.5px; padding: 2px 8px; border-radius: 999px; }
.teams { margin-bottom: 12px; }
.team { display: flex; justify-content: space-between; padding: 4px 0; font-weight: 700; font-size: 14.5px; }
.team b { color: var(--brand-2); }
.odds { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.odds button { display: flex; flex-direction: column; align-items: center; gap: 2px; border: 1px solid var(--line); background: var(--panel-2); color: var(--text); border-radius: 9px; padding: 8px; font-weight: 700; }
.odds button span { color: var(--muted); font-size: 11px; }
.odds button:hover:not(:disabled) { border-color: var(--brand); background: var(--panel-3); }
.odds button:disabled { opacity: .4; }
.note { color: var(--muted); font-size: 12px; margin: 20px 0; }
@media (max-width: 640px) { .matches { grid-template-columns: 1fr; } }
</style>
