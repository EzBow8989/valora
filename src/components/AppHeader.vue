<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import NotificationBell from './NotificationBell.vue'

const emit = defineEmits(['auth', 'toggle-sidebar'])
const store = useUserStore()
const router = useRouter()
const q = ref('')

function submit() {
  router.push({ name: 'slots', query: q.value.trim() ? { q: q.value.trim() } : {} })
}
</script>

<template>
  <header class="hdr">
    <div class="inner">
      <div class="left">
        <button class="burger" aria-label="Menu" @click="emit('toggle-sidebar')">
          <span></span><span></span><span></span>
        </button>
        <router-link to="/" class="brand" aria-label="Valora home">
          <svg viewBox="0 0 64 64" width="26" height="26" aria-hidden="true">
            <path d="M14 14l16 34h4l16-34h-11l-7 20-7-20z" fill="url(#hb)"/>
            <defs><linearGradient id="hb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b47bff"/><stop offset="1" stop-color="#ff2d78"/></linearGradient></defs>
          </svg>
          <span class="word">VALORA</span>
        </router-link>
      </div>

      <nav class="mid">
        <router-link to="/" class="home" aria-label="Home">
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1z"/></svg>
        </router-link>
        <span class="sep"></span>
        <router-link to="/instant" class="mlink">Free</router-link>
        <router-link to="/vip" class="mlink ref"><span class="ri">🎁</span> Referral</router-link>
      </nav>

      <form class="search" @submit.prevent="submit">
        <svg viewBox="0 0 24 24" width="17" height="17"><path fill="currentColor" d="M10 4a6 6 0 104.47 10.03l4.25 4.25 1.41-1.42-4.24-4.24A6 6 0 0010 4m0 2a4 4 0 110 8 4 4 0 010-8"/></svg>
        <input v-model="q" type="search" placeholder="Find the game, for example, Rune Reels" />
      </form>

      <div class="right">
        <a class="soc" href="#" aria-label="Telegram" @click.prevent><svg viewBox="0 0 24 24" width="17" height="17"><path fill="currentColor" d="M21.9 4.3l-3.3 15.6c-.2 1-.9 1.3-1.9.8l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6 13.4l-4.9-1.5c-1-.3-1-1 .2-1.5L20.6 3c.9-.3 1.6.2 1.3 1.3z"/></svg></a>
        <a class="soc" href="#" aria-label="Discord" @click.prevent><svg viewBox="0 0 24 24" width="17" height="17"><path fill="currentColor" d="M19.5 5.5A16 16 0 0015.5 4l-.3.5a12 12 0 013.4 1.7 11 11 0 00-9.2 0A12 12 0 0112.8 4.5L12.5 4A16 16 0 008.5 5.5C5.6 9.7 4.8 13.8 5.2 17.8a16 16 0 004.9 2.5l.6-1a10 10 0 01-1.7-.8l.4-.3a11 11 0 009.2 0l.4.3c-.5.3-1.1.6-1.7.8l.6 1a16 16 0 004.9-2.5c.5-4.6-.8-8.7-3-12.3zM9.7 15.3c-.9 0-1.7-.8-1.7-1.9s.7-1.9 1.7-1.9 1.7.8 1.7 1.9-.8 1.9-1.7 1.9zm4.6 0c-.9 0-1.7-.8-1.7-1.9s.7-1.9 1.7-1.9 1.7.8 1.7 1.9-.8 1.9-1.7 1.9z"/></svg></a>
        <a class="soc" href="#" aria-label="Instagram" @click.prevent><svg viewBox="0 0 24 24" width="17" height="17"><path fill="currentColor" d="M12 2c2.7 0 3 0 4.1.1 1 .1 1.6.2 2 .4.5.2.9.5 1.3.9.4.4.7.8.9 1.3.2.4.3 1 .4 2C20.9 8 21 8.3 21 11v2c0 2.7 0 3-.1 4.1-.1 1-.2 1.6-.4 2a3.6 3.6 0 01-.9 1.3c-.4.4-.8.7-1.3.9-.4.2-1 .3-2 .4C15 21.9 14.7 22 12 22s-3 0-4.1-.1c-1-.1-1.6-.2-2-.4a3.6 3.6 0 01-1.3-.9 3.6 3.6 0 01-.9-1.3c-.2-.4-.3-1-.4-2C3.1 15 3 14.7 3 12s0-3 .1-4.1c.1-1 .2-1.6.4-2 .2-.5.5-.9.9-1.3.4-.4.8-.7 1.3-.9.4-.2 1-.3 2-.4C8.9 2.1 9.3 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm5.3-3.1a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"/></svg></a>
        <span class="divider"></span>

        <template v-if="store.isAuthed">
          <NotificationBell />
          <router-link to="/wallet" class="bal">{{ store.symbol }}{{ store.total.toFixed(2) }}</router-link>
          <router-link to="/wallet" class="btn btn-cta dep">Deposit</router-link>
          <router-link to="/account" class="avatar">{{ store.user.name.charAt(0) }}</router-link>
        </template>
        <template v-else>
          <button class="login" @click="emit('auth', 'login')">Log In</button>
          <button class="btn btn-cta signup" @click="emit('auth', 'register')">Sign Up</button>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.hdr { position: sticky; top: 0; z-index: 50; background: rgba(11,9,33,.94); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); }
.inner { display: flex; align-items: center; gap: 14px; height: 58px; padding: 0 16px; }
.left { display: flex; align-items: center; gap: 10px; }
.burger { display: none; flex-direction: column; gap: 4px; background: none; border: 0; padding: 6px; }
.burger span { width: 20px; height: 2px; background: var(--text); border-radius: 2px; }
.brand { display: flex; align-items: center; gap: 8px; }
.word { font-weight: 900; letter-spacing: 1.5px; font-size: 18px; background: linear-gradient(135deg,#fff,#d9c7ff); -webkit-background-clip: text; background-clip: text; color: transparent; }
.mid { display: flex; align-items: center; gap: 14px; }
.home { color: var(--gold); display: inline-flex; }
.sep { width: 1px; height: 18px; background: var(--line); }
.mlink { color: var(--muted); font-weight: 700; font-size: 14px; }
.mlink:hover, .mlink.router-link-active { color: #fff; }
.ref .ri { filter: drop-shadow(0 0 3px var(--cta)); }
.search { flex: 1; max-width: 420px; display: flex; align-items: center; gap: 8px; background: var(--panel); border: 1px solid var(--line); border-radius: 999px; padding: 8px 16px; color: var(--muted); }
.search:focus-within { border-color: var(--brand); }
.search input { flex: 1; min-width: 0; background: none; border: 0; outline: none; color: var(--text); font-size: 13.5px; }
.right { display: flex; align-items: center; gap: 9px; margin-left: auto; }
.soc { width: 34px; height: 34px; border-radius: 9px; background: linear-gradient(135deg,var(--brand),#5b34c9); color: #fff; display: grid; place-items: center; }
.soc:hover { filter: brightness(1.15); }
.divider { width: 1px; height: 22px; background: var(--line); margin: 0 2px; }
.login { background: none; border: 0; color: var(--text); font-weight: 800; font-size: 14px; padding: 8px 6px; }
.signup { padding: 9px 20px; }
.bal { font-weight: 800; background: var(--panel-2); border: 1px solid var(--line); border-radius: 9px; padding: 8px 12px; font-size: 14px; }
.dep { padding: 8px 14px; }
.avatar { width: 36px; height: 36px; border-radius: 999px; display: grid; place-items: center; font-weight: 800; background: linear-gradient(135deg,var(--brand-2),var(--brand)); color: #fff; }
@media (max-width: 1024px) { .mid { display: none; } }
@media (max-width: 900px) { .burger { display: flex; } }
@media (max-width: 720px) { .search { display: none; } .soc { display: none; } .word { display: none; } }
@media (max-width: 480px) { .bal, .dep { display: none; } }
</style>
