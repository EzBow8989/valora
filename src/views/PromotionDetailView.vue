<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { promoById } from '../data/promotions'
import { useUserStore } from '../store/user'

const route = useRoute()
const store = useUserStore()
const promo = computed(() => promoById(route.params.id))
const claimed = ref(false)

// Illustrative wagering progress for a claimed bonus.
const progress = computed(() => (store.bonus > 0 ? Math.min(100, Math.round((1 - store.bonus / 50) * 100)) : 0))

function claim() {
  if (!store.isAuthed) return
  claimed.value = true
  store.notify('promo', 'Promotion opted in', `You opted in to “${promo.value.title}”.`)
}
</script>

<template>
  <div v-if="promo" class="container wrap">
    <router-link to="/promotions" class="back">← All promotions</router-link>

    <div class="hero" :style="{ background: `linear-gradient(135deg, ${promo.accent}, #0e0b2b)` }">
      <span class="tag">{{ promo.tag }}</span>
      <h1>{{ promo.title }}</h1>
      <p>{{ promo.short }}</p>
    </div>

    <div class="cols">
      <div class="main">
        <div class="qa card">
          <div><span>What do I get?</span><b>{{ promo.reward }}</b></div>
          <div><span>How do I qualify?</span><b>Deposit {{ promo.minDeposit ? store.symbol + promo.minDeposit + '+' : 'no deposit needed' }}</b></div>
          <div><span>Wagering</span><b>{{ promo.wagering ? promo.wagering + '×' : 'None' }}</b></div>
          <div><span>When does it expire?</span><b>{{ promo.expires }}</b></div>
        </div>

        <h3>How it works</h3>
        <ol class="steps">
          <li v-for="(s, i) in promo.steps" :key="i">{{ s }}</li>
        </ol>

        <h3>Terms &amp; conditions</h3>
        <ul class="terms">
          <li v-for="(t, i) in promo.terms" :key="i">{{ t }}</li>
        </ul>
      </div>

      <aside class="side card">
        <div v-if="promo.status !== 'active'" class="ineligible">
          This promotion is <b>{{ promo.status }}</b>.
        </div>
        <template v-else>
          <div v-if="claimed || (store.isAuthed && promo.id === 'welcome-slots' && store.bonus > 0)" class="claimed">
            <p class="ok">✓ Active on your account</p>
            <div class="wager">
              <div class="wtop"><span>Wagering progress</span><b>{{ progress }}%</b></div>
              <div class="bar"><div :style="{ width: progress + '%' }"></div></div>
              <p class="rem">Bonus balance: {{ store.symbol }}{{ store.bonus.toFixed(2) }} · expires in 7 days</p>
            </div>
          </div>
          <template v-else>
            <p class="elig">You're eligible for this offer.</p>
            <button v-if="store.isAuthed" class="btn btn-cta full" @click="claim">Opt in / Claim</button>
            <button v-else class="btn btn-cta full" @click="$emit('auth', 'register')">Sign up to claim</button>
          </template>
        </template>
        <p class="rgnote">18+ · Please gamble responsibly · Demo offer</p>
      </aside>
    </div>
  </div>

  <div v-else class="container missing">
    <p>Promotion not found.</p>
    <router-link to="/promotions" class="btn btn-brand">Back to promotions</router-link>
  </div>
</template>

<style scoped>
.wrap { padding-top: 16px; }
.back { color: var(--muted); font-weight: 700; }
.hero { border-radius: 18px; padding: clamp(22px, 4vw, 40px); margin: 12px 0 22px; border: 1px solid var(--line); }
.tag { display: inline-block; background: rgba(255,255,255,.2); color: #fff; font-weight: 800; font-size: 12px; padding: 4px 12px; border-radius: 999px; }
.hero h1 { font-size: clamp(24px, 4vw, 38px); margin: 12px 0 8px; }
.hero p { margin: 0; color: #eee; }
.cols { display: grid; grid-template-columns: 1fr 320px; gap: 22px; align-items: start; }
.qa { padding: 6px 18px; margin-bottom: 24px; }
.qa div { display: flex; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line); }
.qa div:last-child { border-bottom: 0; }
.qa span { color: var(--muted); font-size: 13.5px; }
.qa b { text-align: right; font-size: 13.5px; }
h3 { font-size: 17px; margin: 22px 0 10px; }
.steps, .terms { color: var(--muted); font-size: 14px; line-height: 1.8; padding-left: 20px; }
.side { padding: 20px; position: sticky; top: 120px; }
.elig { font-weight: 700; margin: 0 0 14px; }
.full { width: 100%; padding: 12px; }
.ineligible { color: var(--muted); }
.ok { color: var(--green); font-weight: 800; margin: 0 0 14px; }
.wtop { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
.bar { height: 8px; background: var(--bg-2); border-radius: 999px; overflow: hidden; }
.bar div { height: 100%; background: linear-gradient(90deg, var(--brand-2), var(--cta)); }
.rem { color: var(--muted); font-size: 12px; margin: 8px 0 0; }
.rgnote { color: var(--muted); font-size: 11px; margin: 16px 0 0; text-align: center; }
.missing { padding: 80px 0; text-align: center; display: grid; gap: 14px; place-items: center; }
@media (max-width: 820px) { .cols { grid-template-columns: 1fr; } .side { position: static; } }
</style>
