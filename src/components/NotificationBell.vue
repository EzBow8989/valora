<script setup>
import { ref } from 'vue'
import { useUserStore } from '../store/user'

const store = useUserStore()
const open = ref(false)

const ICON = { promo: '🎁', system: '🛠️', wallet: '💳', security: '🔒' }
function ago(ts) {
  const m = Math.round((Date.now() - ts) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return m + 'm ago'
  const h = Math.round(m / 60)
  return h < 24 ? h + 'h ago' : Math.round(h / 24) + 'd ago'
}
</script>

<template>
  <div class="wrap">
    <button class="ic" aria-label="Notifications" @click="open = !open">
      <svg viewBox="0 0 24 24" width="19" height="19"><path fill="currentColor" d="M12 22a2.5 2.5 0 002.45-2h-4.9A2.5 2.5 0 0012 22m6-6v-5a6 6 0 00-5-5.91V4a1 1 0 10-2 0v1.09A6 6 0 006 11v5l-2 2v1h16v-1z"/></svg>
      <span v-if="store.unread" class="badge-count dot">{{ store.unread }}</span>
    </button>

    <transition name="fade">
      <div v-if="open" class="pop" @click.self="open = false">
        <div class="panel card">
          <div class="head">
            <strong>Notifications</strong>
            <button v-if="store.unread" class="link" @click="store.markAllRead()">Mark all read</button>
          </div>
          <div v-if="!store.notifications.length" class="empty">You're all caught up.</div>
          <ul v-else>
            <li v-for="n in store.notifications" :key="n.id" :class="{ unread: !n.read }" @click="store.markRead(n.id)">
              <span class="emoji">{{ ICON[n.type] || '🔔' }}</span>
              <div>
                <p class="t">{{ n.title }}</p>
                <p class="b">{{ n.body }}</p>
                <p class="ts">{{ ago(n.ts) }}</p>
              </div>
              <span v-if="!n.read" class="udot"></span>
            </li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.wrap { position: relative; }
.ic { position: relative; width: 38px; height: 38px; border-radius: 10px; border: 1px solid var(--line); background: var(--panel); color: var(--text); display: grid; place-items: center; }
.ic:hover { background: var(--panel-3); }
.dot { position: absolute; top: -5px; right: -5px; }
.pop { position: fixed; inset: 0; z-index: 60; }
.panel { position: absolute; top: 108px; right: 12px; width: min(360px, calc(100vw - 24px)); max-height: 70vh; overflow: auto; padding: 4px; box-shadow: 0 24px 60px rgba(0,0,0,.5); }
.head { display: flex; align-items: center; justify-content: space-between; padding: 12px 12px 8px; }
.link { background: none; border: 0; color: var(--brand-2); font-weight: 700; font-size: 12.5px; }
.empty { padding: 24px; text-align: center; color: var(--muted); }
ul { list-style: none; margin: 0; padding: 0; }
li { display: flex; gap: 10px; padding: 11px 12px; border-top: 1px solid var(--line); cursor: pointer; position: relative; }
li:hover { background: var(--panel-2); }
li.unread { background: rgba(124,77,255,.08); }
.emoji { font-size: 18px; }
.t { margin: 0; font-weight: 700; font-size: 13.5px; }
.b { margin: 2px 0 0; color: var(--muted); font-size: 12.5px; }
.ts { margin: 3px 0 0; color: var(--muted); font-size: 11px; opacity: .8; }
.udot { position: absolute; top: 14px; right: 10px; width: 8px; height: 8px; border-radius: 999px; background: var(--cta); }
</style>
