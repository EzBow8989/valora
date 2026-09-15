<script setup>
import { ref } from 'vue'

const faqs = [
  { q: 'How do I make a deposit?', a: 'Go to Wallet → Deposit, choose a payment method and amount (min €10), then confirm. Funds appear instantly.' },
  { q: 'How long do withdrawals take?', a: 'Withdrawal requests are reviewed within 24 hours. Once approved, timing depends on your payment method.' },
  { q: 'What is the difference between demo and real play?', a: 'Demo uses free credits with no real-money interaction. Real play draws from your wallet balance. Live tables are real-only.' },
  { q: 'How do bonuses and wagering work?', a: 'Bonus funds carry a wagering requirement (e.g. 35×). You must wager the bonus that many times before it converts to withdrawable cash.' },
  { q: 'How do I set responsible-gaming limits?', a: 'Open Account → Responsible Gaming to set deposit, loss and session limits, reality checks, cooling-off or self-exclusion.' },
  { q: 'I was charged but my deposit failed.', a: 'Failed deposits are never captured — any authorisation is released automatically. Contact support with your reference if it persists.' },
]

const open = ref(-1)
const sent = ref(false)
const form = ref({ subject: 'Payments', message: '' })
function submit() { if (form.value.message.trim()) sent.value = true }
</script>

<template>
  <div class="container wrap">
    <h1>Help Center</h1>
    <p class="lead">Find quick answers or reach our 24/7 support team.</p>

    <div class="quick">
      <div class="qcard card"><span>💬</span><b>Live Chat</b><p>Avg. reply &lt; 2 min</p><button class="btn btn-cta">Start chat</button></div>
      <div class="qcard card"><span>✉️</span><b>Email</b><p>support@valora.demo</p><button class="btn btn-ghost">Email us</button></div>
      <div class="qcard card"><span>📄</span><b>Ticket</b><p>Track a request</p><button class="btn btn-ghost">New ticket</button></div>
    </div>

    <div class="cols">
      <div class="faq">
        <h2>Frequently asked</h2>
        <div v-for="(f, i) in faqs" :key="i" class="item card" :class="{ open: open === i }">
          <button class="q" @click="open = open === i ? -1 : i">
            {{ f.q }}<span class="chev">{{ open === i ? '−' : '+' }}</span>
          </button>
          <div v-if="open === i" class="a">{{ f.a }}</div>
        </div>
      </div>

      <div class="contact card">
        <h2>Contact support</h2>
        <div v-if="sent" class="sent">
          <p class="ok">✓ Ticket submitted</p>
          <p>We'll reply to your email shortly. Reference #{{ Math.floor(Math.random()*900000+100000) }}.</p>
          <button class="btn btn-ghost" @click="sent = false; form.message = ''">New request</button>
        </div>
        <form v-else @submit.prevent="submit">
          <label>Topic
            <select v-model="form.subject"><option>Payments</option><option>Account</option><option>Bonuses</option><option>Technical</option><option>Responsible Gaming</option></select>
          </label>
          <label>Message
            <textarea v-model="form.message" rows="5" placeholder="Describe your issue…"></textarea>
          </label>
          <button class="btn btn-brand full" type="submit">Submit ticket</button>
        </form>
      </div>
    </div>

    <p class="note">18+ · Gambling can be addictive. This is a demo — no real accounts or payments. Support contacts are placeholders.</p>
  </div>
</template>

<style scoped>
.wrap { padding-top: 18px; }
h1 { font-size: 28px; margin: 0 0 4px; }
.lead { color: var(--muted); margin: 0 0 20px; }
.quick { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 26px; }
.qcard { padding: 20px; text-align: center; }
.qcard span { font-size: 26px; } .qcard b { display: block; margin: 8px 0 2px; }
.qcard p { color: var(--muted); font-size: 12.5px; margin: 0 0 12px; }
.cols { display: grid; grid-template-columns: 1fr 360px; gap: 22px; align-items: start; }
h2 { font-size: 18px; margin: 0 0 12px; }
.item { margin-bottom: 10px; overflow: hidden; }
.q { width: 100%; text-align: left; background: none; border: 0; color: var(--text); font-weight: 700; font-size: 14.5px; padding: 15px 16px; display: flex; justify-content: space-between; gap: 12px; }
.chev { color: var(--brand-2); font-size: 18px; }
.a { padding: 0 16px 16px; color: var(--muted); font-size: 13.5px; }
.contact { padding: 20px; position: sticky; top: 120px; }
form { display: flex; flex-direction: column; gap: 12px; }
label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: var(--muted); font-weight: 700; }
select, textarea { background: var(--bg-2); border: 1px solid var(--line); border-radius: 10px; padding: 11px 13px; color: var(--text); font-size: 14.5px; outline: none; font-family: inherit; resize: vertical; }
select:focus, textarea:focus { border-color: var(--brand); }
.full { width: 100%; padding: 12px; }
.sent .ok { color: var(--green); font-weight: 800; margin: 0 0 6px; }
.sent p { color: var(--muted); font-size: 13.5px; }
.note { color: var(--muted); font-size: 12px; margin: 24px 0; }
@media (max-width: 820px) { .cols { grid-template-columns: 1fr; } .contact { position: static; } .quick { grid-template-columns: 1fr; } }
</style>
