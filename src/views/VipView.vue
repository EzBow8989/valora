<script setup>
import { VIP_TIERS } from '../data/vip'
</script>

<template>
  <div class="container wrap">
    <div class="top">
      <h1>VIP Club</h1>
      <p>Earn points on every real-money bet and climb five tiers of rewards. Higher tiers unlock bigger cashback, faster withdrawals and a personal host.</p>
    </div>

    <div class="tiers">
      <div v-for="(t, i) in VIP_TIERS" :key="t.name" class="tier card" :style="{ borderColor: t.color + '66' }">
        <div class="crown" :style="{ background: t.color }">{{ i + 1 }}</div>
        <h3 :style="{ color: t.color }">{{ t.name }}</h3>
        <p class="pts">{{ t.points.toLocaleString() }} pts</p>
        <ul>
          <li v-for="p in t.perks" :key="p">{{ p }}</li>
        </ul>
      </div>
    </div>

    <div class="how card">
      <h3>How points work</h3>
      <div class="grid">
        <div><b>Play</b><span>Every {{ '€' }}10 wagered on slots = 1 point (table/live rates vary).</span></div>
        <div><b>Climb</b><span>Reach a tier's threshold to unlock its perks permanently for the season.</span></div>
        <div><b>Get rewarded</b><span>Cashback, reloads and bespoke gifts, credited automatically.</span></div>
      </div>
      <p class="note">18+ · Play responsibly · Demo programme, illustrative rates only.</p>
    </div>
  </div>
</template>

<style scoped>
.wrap { padding-top: 20px; }
.top { text-align: center; max-width: 640px; margin: 0 auto 28px; }
h1 { font-size: clamp(26px, 4vw, 38px); margin: 0 0 10px; }
.top p { color: var(--muted); }
.tiers { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
.tier { padding: 22px 16px; text-align: center; position: relative; }
.crown { width: 34px; height: 34px; border-radius: 999px; display: grid; place-items: center; margin: 0 auto 10px; font-weight: 900; color: #0e0b2b; }
.tier h3 { margin: 0; font-size: 18px; }
.pts { color: var(--muted); font-size: 12.5px; margin: 4px 0 12px; }
.tier ul { list-style: none; padding: 0; margin: 0; text-align: left; }
.tier li { font-size: 12.5px; color: var(--text); padding: 6px 0 6px 18px; position: relative; border-top: 1px solid var(--line); }
.tier li::before { content: '✓'; position: absolute; left: 0; color: var(--green); }
.how { margin-top: 26px; padding: 24px; }
.how h3 { margin: 0 0 16px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.grid div { display: flex; flex-direction: column; gap: 4px; }
.grid b { font-size: 15px; }
.grid span { color: var(--muted); font-size: 13.5px; }
.note { color: var(--muted); font-size: 12px; margin: 18px 0 0; }
@media (max-width: 900px) { .tiers { grid-template-columns: repeat(2, 1fr); } .grid { grid-template-columns: 1fr; } }
@media (max-width: 520px) { .tiers { grid-template-columns: 1fr; } }
</style>
