<script setup>
import { ref, computed } from 'vue'
import { PROMOTIONS } from '../data/promotions'

const filter = ref('all')
const tabs = ['all', 'active', 'upcoming', 'expired']
const list = computed(() =>
  filter.value === 'all' ? PROMOTIONS : PROMOTIONS.filter((p) => p.status === filter.value)
)
</script>

<template>
  <div class="container wrap">
    <h1>Promotions</h1>
    <p class="lead">Bonuses, cashback and tournaments. All offers are demo illustrations — 18+, terms apply.</p>

    <div class="tabs">
      <button v-for="t in tabs" :key="t" :class="{ on: filter === t }" @click="filter = t">{{ t }}</button>
    </div>

    <div class="grid">
      <router-link v-for="p in list" :key="p.id" :to="{ name: 'promotion', params: { id: p.id } }" class="promo card">
        <div class="banner" :style="{ background: `linear-gradient(135deg, ${p.accent}, #0e0b2b)` }">
          <span class="tag">{{ p.tag }}</span>
          <span class="status" :class="p.status">{{ p.status }}</span>
        </div>
        <div class="body">
          <h3>{{ p.title }}</h3>
          <p>{{ p.short }}</p>
          <div class="foot">
            <span class="reward">{{ p.reward }}</span>
            <span class="more">Details →</span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.wrap { padding-top: 18px; }
h1 { font-size: 28px; margin: 0 0 4px; }
.lead { color: var(--muted); margin: 0 0 18px; font-size: 14px; }
.tabs { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
.tabs button { border: 1px solid var(--line); background: var(--panel); color: var(--muted); border-radius: 999px; padding: 8px 18px; font-weight: 800; text-transform: capitalize; }
.tabs button.on { background: linear-gradient(135deg,var(--brand-2),var(--brand)); border-color: transparent; color: #fff; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.promo { overflow: hidden; transition: transform .12s ease; }
.promo:hover { transform: translateY(-3px); }
.banner { height: 120px; position: relative; padding: 12px; }
.tag { position: absolute; top: 12px; left: 12px; background: rgba(255,255,255,.2); color: #fff; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 999px; }
.status { position: absolute; top: 12px; right: 12px; font-size: 10.5px; font-weight: 800; padding: 3px 9px; border-radius: 999px; text-transform: uppercase; }
.status.active { background: var(--green); color: #04140d; }
.status.upcoming { background: var(--cyan); color: #04121a; }
.status.expired { background: #555; color: #ddd; }
.body { padding: 14px 16px 16px; }
.body h3 { margin: 0 0 6px; font-size: 16px; }
.body p { margin: 0 0 14px; color: var(--muted); font-size: 13.5px; }
.foot { display: flex; align-items: center; justify-content: space-between; }
.reward { font-weight: 800; font-size: 13px; color: var(--brand-2); }
.more { color: var(--muted); font-weight: 700; font-size: 12.5px; }
@media (max-width: 900px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
</style>
