<script setup>
import { PROVIDERS } from '../data/games'
</script>

<template>
  <footer class="foot">
    <div class="container">
      <div class="cols">
        <div class="col brandcol">
          <div class="brand">VALORA</div>
          <p class="tag">Slots · Live Casino · Sports</p>
          <p class="rg">
            <span class="age">18+</span> Play responsibly. Gambling can be addictive.
          </p>
        </div>
        <div class="col">
          <h4>Casino</h4>
          <router-link to="/slots">Slots</router-link>
          <router-link to="/live-casino">Live Casino</router-link>
          <router-link to="/table-games">Table Games</router-link>
          <router-link to="/jackpots">Jackpots</router-link>
        </div>
        <div class="col">
          <h4>Account</h4>
          <router-link to="/wallet">Wallet</router-link>
          <router-link to="/account">Profile & Security</router-link>
          <router-link to="/account">Responsible Gaming</router-link>
          <router-link to="/promotions">Promotions</router-link>
        </div>
        <div class="col">
          <h4>Support</h4>
          <router-link to="/support">Help Center</router-link>
          <router-link to="/support">Contact Us</router-link>
          <router-link to="/support">FAQ</router-link>
          <router-link to="/support">Live Chat</router-link>
        </div>
      </div>

      <div class="providers">
        <span v-for="p in PROVIDERS" :key="p">{{ p }}</span>
      </div>

      <div class="legal">
        <div class="badges">
          <span class="badge">18+</span>
          <span class="badge">Responsible Gaming</span>
          <span class="badge">SSL Secured</span>
          <span class="badge">Demo Build</span>
        </div>
        <p>© 2026 Valora (demo). This is a non-commercial frontend demo with mock data — no real gambling, accounts, money or payments are involved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.foot { margin-top: 44px; border-top: 1px solid var(--line); background: rgba(11,9,33,.6); padding: 34px 0 84px; }
.cols { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 24px; }
.brand { font-weight: 900; letter-spacing: 2px; font-size: 20px; background: linear-gradient(135deg,#fff,#d9c7ff); -webkit-background-clip: text; background-clip: text; color: transparent; }
.tag { color: var(--muted); font-size: 13px; margin: 6px 0 12px; }
.rg { color: var(--muted); font-size: 12.5px; max-width: 280px; }
.age { background: var(--cta); color: #fff; font-weight: 800; border-radius: 6px; padding: 1px 6px; font-size: 12px; margin-right: 4px; }
.col h4 { font-size: 13px; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); margin: 0 0 10px; }
.col a { display: block; color: var(--text); font-size: 13.5px; padding: 4px 0; }
.col a:hover { color: var(--brand-2); }
.providers { display: flex; flex-wrap: wrap; gap: 10px 22px; margin: 26px 0; padding: 18px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); color: var(--muted); font-size: 13px; font-weight: 700; }
.badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.badge { border: 1px solid var(--line); background: var(--panel); border-radius: 8px; padding: 5px 11px; font-size: 11.5px; font-weight: 700; color: var(--muted); }
.legal p { color: var(--muted); font-size: 12px; margin: 0; }
@media (max-width: 720px) { .cols { grid-template-columns: 1fr 1fr; } }
</style>
