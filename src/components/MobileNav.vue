<script setup>
import { useUserStore } from '../store/user'
const emit = defineEmits(['auth'])
const store = useUserStore()

const items = [
  { to: '/', label: 'Home', icon: 'M4 11l8-7 8 7v9a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1z' },
  { to: '/slots', label: 'Casino', icon: 'M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1m3 4a2 2 0 100 4 2 2 0 000-4m8 6a2 2 0 100 4 2 2 0 000-4' },
  { to: '/sports', label: 'Sports', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20m0 3l2.4 1.8-.9 2.9h-3l-.9-2.9z' },
  { to: '/promotions', label: 'Promos', icon: 'M20 12v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8M2 7h20v4H2zM12 22V7M12 7S9 2 6.5 4.5 12 7 12 7m0 0s3-5 5.5-2.5S12 7 12 7' },
]
</script>

<template>
  <nav class="mnav">
    <router-link v-for="it in items" :key="it.label" :to="it.to" class="tab">
      <svg viewBox="0 0 24 24" width="21" height="21"><path fill="currentColor" :d="it.icon" /></svg>
      <span>{{ it.label }}</span>
    </router-link>
    <router-link v-if="store.isAuthed" to="/wallet" class="tab wallet">
      <svg viewBox="0 0 24 24" width="21" height="21"><path fill="currentColor" d="M3 6a2 2 0 012-2h12v4h2a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2zm14 6a1.5 1.5 0 100 3 1.5 1.5 0 000-3" /></svg>
      <span>Wallet</span>
    </router-link>
    <button v-else class="tab" @click="emit('auth', 'register')">
      <svg viewBox="0 0 24 24" width="21" height="21"><path fill="currentColor" d="M12 12a5 5 0 100-10 5 5 0 000 10m0 2c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6" /></svg>
      <span>Join</span>
    </button>
  </nav>
</template>

<style scoped>
.mnav { display: none; }
@media (max-width: 820px) {
  .mnav {
    display: grid; grid-auto-flow: column; grid-auto-columns: 1fr;
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 70;
    background: rgba(14,11,43,.96); backdrop-filter: blur(12px); border-top: 1px solid var(--line);
    padding-bottom: env(safe-area-inset-bottom);
  }
  .tab { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 9px 0; color: var(--muted); font-size: 10.5px; font-weight: 700; border: 0; background: none; }
  .tab.router-link-active { color: var(--brand-2); }
  .tab.wallet.router-link-active { color: var(--cta); }
}
</style>
