<script setup>
import { ref } from 'vue'
import { CATEGORIES } from '../data/instant'

defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close'])
const showGames = ref(true)

const promo = [
  { to: '/promotions', label: 'Bonus Collection', icon: '🎁' },
  { to: '/promotions', label: 'Challenge', icon: '🏆' },
  { to: '/vip', label: 'VIP Club', icon: '👑' },
]
</script>

<template>
  <div class="scrim" :class="{ show: open }" @click="emit('close')"></div>
  <aside class="side" :class="{ open }">
    <nav @click="emit('close')">
      <p class="grp">Promotions</p>
      <router-link v-for="l in promo" :key="l.label" :to="l.to" class="item">
        <span class="ic">{{ l.icon }}</span>{{ l.label }}
      </router-link>

      <div class="hr"></div>
      <router-link to="/games" class="item"><span class="ic">🎮</span>All Games</router-link>
      <router-link v-for="c in CATEGORIES" :key="c.key" :to="`/games/${c.key}`" class="item">
        <span class="ic">{{ c.icon }}</span>{{ c.label }}
      </router-link>

      <div class="hr"></div>
      <router-link to="/lab" class="item"><span class="ic">🧪</span>Strategy Lab</router-link>
      <router-link to="/wallet" class="item"><span class="ic">💳</span>Wallet</router-link>
      <router-link to="/account" class="item"><span class="ic">⚙️</span>Account</router-link>
    </nav>

    <div class="foot">
      <router-link to="/support" class="fl">About</router-link>
      <router-link to="/support" class="fl">Support</router-link>
      <span class="fl lang">🇬🇧 EN ▾</span>
    </div>
  </aside>
</template>

<style scoped>
.side { width: 224px; flex-shrink: 0; align-self: flex-start; position: sticky; top: 58px; height: calc(100vh - 58px); overflow-y: auto; padding: 14px 10px; scrollbar-width: thin; }
.grp { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); font-weight: 800; margin: 6px 10px 8px; }
.item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 10px; color: var(--text); font-weight: 600; font-size: 14px; width: 100%; border: 0; background: none; text-align: left; cursor: pointer; }
.item:hover { background: var(--panel-2); }
.item.router-link-active { background: var(--panel-3); color: #fff; }
.ic { width: 20px; text-align: center; }
.expand .chev { margin-left: auto; color: var(--muted); font-size: 11px; }
.sub { margin: 2px 0 4px 8px; border-left: 1px solid var(--line); padding-left: 6px; }
.subitem { display: flex; align-items: center; gap: 9px; padding: 7px 10px; border-radius: 8px; color: var(--muted); font-size: 13px; font-weight: 600; }
.subitem:hover { background: var(--panel-2); color: var(--text); }
.subitem.router-link-active { color: var(--brand-2); }
.hr { height: 1px; background: var(--line); margin: 10px 12px; }
.foot { display: flex; align-items: center; gap: 12px; padding: 12px; margin-top: 6px; border-top: 1px solid var(--line); }
.fl { color: var(--muted); font-size: 12.5px; font-weight: 700; }
.fl.lang { margin-left: auto; }
.scrim { display: none; }
@media (max-width: 900px) {
  .side { position: fixed; top: 58px; left: 0; z-index: 45; background: var(--bg-2); border-right: 1px solid var(--line); transform: translateX(-100%); transition: transform .22s ease; }
  .side.open { transform: translateX(0); }
  .scrim.show { display: block; position: fixed; inset: 58px 0 0; background: rgba(0,0,0,.5); z-index: 44; }
}
</style>
