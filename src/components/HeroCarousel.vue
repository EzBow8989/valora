<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const i = ref(0)
let timer = null

// Original promo banners, gradient art (no third-party imagery).
const slides = [
  { id: 'welcome-slots', kicker: 'Welcome Offer', title: '100% Slots Welcome Bonus', sub: 'Double your 1st deposit for Slots — up to €500 + 100 spins.', cta: 'Deposit Now', to: { name: 'promotion', params: { id: 'welcome-slots' } }, g: ['#3a1a6b', '#ff2d78'] },
  { id: 'cashback', kicker: 'Every Week', title: '10% Weekly Cashback', sub: 'Get real cash back on your net losses — no wagering.', cta: 'Learn More', to: { name: 'promotion', params: { id: 'cashback' } }, g: ['#0e3a4a', '#22d3ee'] },
  { id: 'vip', kicker: 'VIP Club', title: 'Climb the Ranks', sub: 'Faster withdrawals, personal host and bespoke rewards.', cta: 'Explore VIP', to: { name: 'vip' }, g: ['#2a1a5e', '#b47bff'] },
]

function go(n) { i.value = (n + slides.length) % slides.length; restart() }
function restart() { clearInterval(timer); timer = setInterval(() => go(i.value + 1), 6000) }
onMounted(restart)
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <section class="container hero-wrap">
    <button class="arrow left" aria-label="Previous" @click="go(i - 1)">‹</button>
    <div class="stage">
      <div v-for="(s, idx) in slides" :key="s.id" class="slide" :class="{ on: idx === i }"
           :style="{ background: `radial-gradient(120% 120% at 80% 20%, ${s.g[1]}55, transparent 60%), linear-gradient(120deg, ${s.g[0]}, ${s.g[1]})` }">
        <div class="copy">
          <span class="kicker">{{ s.kicker }}</span>
          <h1>{{ s.title }}</h1>
          <p>{{ s.sub }}</p>
          <button class="btn btn-cta" @click="router.push(s.to)">{{ s.cta }}</button>
        </div>
        <div class="glow" aria-hidden="true"></div>
      </div>
    </div>
    <button class="arrow right" aria-label="Next" @click="go(i + 1)">›</button>
    <div class="dots">
      <button v-for="(s, idx) in slides" :key="s.id" :class="{ active: idx === i }" :aria-label="`Slide ${idx + 1}`" @click="go(idx)"></button>
    </div>
  </section>
</template>

<style scoped>
.hero-wrap { position: relative; margin-top: 18px; }
.stage { position: relative; height: clamp(220px, 30vw, 320px); border-radius: 18px; overflow: hidden; border: 1px solid var(--line); }
.slide { position: absolute; inset: 0; display: flex; align-items: center; padding: clamp(20px, 4vw, 48px); opacity: 0; transition: opacity .7s ease; pointer-events: none; }
.slide.on { opacity: 1; pointer-events: auto; }
.copy { max-width: 60%; z-index: 2; }
.kicker { display: inline-block; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: #fff; background: rgba(255,255,255,.16); padding: 4px 10px; border-radius: 999px; }
h1 { font-size: clamp(22px, 3.6vw, 42px); margin: 12px 0 8px; line-height: 1.05; letter-spacing: -.02em; }
.copy p { margin: 0 0 18px; color: #eee; font-size: clamp(13px, 1.6vw, 16px); }
.glow { position: absolute; right: -60px; top: -60px; width: 320px; height: 320px; border-radius: 999px; background: radial-gradient(circle, rgba(255,255,255,.25), transparent 60%); filter: blur(10px); }
.arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 3; width: 38px; height: 38px; border-radius: 999px; border: 1px solid var(--line); background: rgba(14,11,43,.7); color: #fff; font-size: 22px; line-height: 1; }
.arrow.left { left: 6px; } .arrow.right { right: 6px; }
.arrow:hover { background: var(--panel-3); }
.dots { position: absolute; bottom: 12px; left: 0; right: 0; display: flex; gap: 7px; justify-content: center; z-index: 3; }
.dots button { width: 8px; height: 8px; border: 0; border-radius: 999px; background: rgba(255,255,255,.4); transition: width .25s, background .25s; }
.dots button.active { width: 24px; background: #fff; }
@media (max-width: 600px) { .copy { max-width: 100%; } .arrow { display: none; } }
</style>
