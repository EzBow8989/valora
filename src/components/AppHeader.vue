<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import NotificationBell from './NotificationBell.vue'

const emit = defineEmits(['auth', 'search'])
const store = useUserStore()
const router = useRouter()
const q = ref('')
const showSearch = ref(false)

const primary = [
  { to: '/sports', label: 'Sports' },
  { to: '/slots', label: 'Slots' },
  { to: '/live-casino', label: 'Live Casino' },
  { to: '/promotions', label: 'Promotions' },
  { to: '/vip', label: 'VIP Club' },
]
const secondary = [
  { to: '/sports', label: 'Prematch' },
  { to: '/sports', label: 'Live Sports' },
  { to: '/slots', label: 'Slots' },
  { to: '/live-casino', label: 'Live Casino' },
  { to: '/table-games', label: 'Table Games' },
  { to: '/jackpots', label: 'Jackpots' },
]

function submit() {
  emit('search', q.value.trim())
  router.push({ name: 'slots', query: q.value.trim() ? { q: q.value.trim() } : {} })
  showSearch.value = false
}
</script>

<template>
  <header class="hdr">
    <div class="top">
      <div class="container top-inner">
        <router-link to="/" class="brand" aria-label="Valora home">
          <svg viewBox="0 0 64 64" width="30" height="30" aria-hidden="true">
            <path d="M14 14l16 34h4l16-34h-11l-7 20-7-20z" fill="url(#bg)"/>
            <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b47bff"/><stop offset="1" stop-color="#ff2d78"/></linearGradient></defs>
          </svg>
          <span class="word">VALORA</span>
        </router-link>

        <nav class="primary">
          <router-link v-for="l in primary" :key="l.label" :to="l.to">{{ l.label }}</router-link>
        </nav>

        <div class="actions">
          <button class="ic" aria-label="Search" @click="showSearch = !showSearch">
            <svg viewBox="0 0 24 24" width="19" height="19"><path fill="currentColor" d="M10 4a6 6 0 104.47 10.03l4.25 4.25 1.41-1.42-4.24-4.24A6 6 0 0010 4m0 2a4 4 0 110 8 4 4 0 010-8"/></svg>
          </button>

          <template v-if="store.isAuthed">
            <NotificationBell />
            <router-link to="/wallet" class="bal">
              <span class="amt">{{ store.symbol }}{{ store.total.toFixed(2) }}</span>
              <span class="dep">Deposit</span>
            </router-link>
            <router-link to="/account" class="avatar" :title="store.user.name">{{ store.user.name.charAt(0) }}</router-link>
          </template>
          <template v-else>
            <button class="btn btn-ghost login" @click="emit('auth', 'login')">Login</button>
            <button class="btn btn-cta" @click="emit('auth', 'register')">Join Now</button>
          </template>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showSearch" class="searchbar">
        <div class="container">
          <form @submit.prevent="submit">
            <input v-model="q" type="search" placeholder="Search 100+ games and providers…" autofocus />
            <button class="btn btn-brand" type="submit">Search</button>
          </form>
        </div>
      </div>
    </transition>

    <div class="sub">
      <div class="container sub-inner">
        <router-link v-for="(l, i) in secondary" :key="i" :to="l.to">{{ l.label }}</router-link>
      </div>
    </div>
  </header>
</template>

<style scoped>
.hdr { position: sticky; top: 0; z-index: 50; }
.top { background: rgba(14,11,43,.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); }
.top-inner { display: flex; align-items: center; gap: 18px; height: 60px; }
.brand { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.word { font-weight: 900; font-size: 20px; letter-spacing: 2px; background: linear-gradient(135deg,#fff,#d9c7ff); -webkit-background-clip: text; background-clip: text; color: transparent; }
.primary { display: flex; gap: 20px; margin-left: 10px; }
.primary a { color: var(--muted); font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: .03em; }
.primary a:hover, .primary a.router-link-active { color: #fff; }
.actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
.ic { width: 38px; height: 38px; border-radius: 10px; border: 1px solid var(--line); background: var(--panel); color: var(--text); display: grid; place-items: center; }
.ic:hover { background: var(--panel-3); }
.bal { display: flex; flex-direction: column; align-items: center; line-height: 1.15; padding: 5px 14px; border-radius: 10px; background: var(--panel-2); border: 1px solid var(--line); }
.amt { font-weight: 800; font-size: 14px; }
.dep { font-size: 10px; color: var(--brand-2); font-weight: 700; text-transform: uppercase; }
.avatar { width: 38px; height: 38px; border-radius: 999px; display: grid; place-items: center; font-weight: 800; background: linear-gradient(135deg,var(--brand-2),var(--brand)); color: #fff; }
.login { padding: 9px 16px; }
.searchbar { background: var(--panel); border-bottom: 1px solid var(--line); padding: 12px 0; }
.searchbar form { display: flex; gap: 10px; }
.searchbar input { flex: 1; background: var(--bg-2); border: 1px solid var(--line); border-radius: 10px; padding: 11px 16px; color: var(--text); font-size: 15px; outline: none; }
.searchbar input:focus { border-color: var(--brand); }
.sub { background: rgba(11,9,33,.75); border-bottom: 1px solid var(--line); }
.sub-inner { display: flex; gap: 22px; overflow-x: auto; height: 42px; align-items: center; scrollbar-width: none; }
.sub-inner::-webkit-scrollbar { display: none; }
.sub-inner a { color: var(--muted); font-size: 12.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; white-space: nowrap; }
.sub-inner a:hover, .sub-inner a.router-link-active { color: var(--brand-2); }
@media (max-width: 900px) { .primary { display: none; } }
@media (max-width: 560px) { .word { display: none; } .login { display: none; } .dep { display: none; } }
</style>
