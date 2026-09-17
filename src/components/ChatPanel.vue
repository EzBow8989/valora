<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useUserStore } from '../store/user'

const emit = defineEmits(['close'])
const store = useUserStore()
const online = ref(26)
const draft = ref('')
const body = ref(null)

// Seeded demo chat; a bot occasionally posts to feel "live". No real users.
const msgs = ref([
  { u: 'admin', admin: true, t: 'Welcome to Valora chat 👋' },
  { u: 'Mira', t: 'gl everyone' },
  { u: 'admin', admin: true, t: 'Weekly cashback drops every Monday.' },
  { u: 'K3vin', t: 'liftoff paying big today 🚀' },
  { u: 'Sana', t: 'just hit 12x on plinko' },
  { u: 'admin', admin: true, t: 'Play responsibly — set your limits in Account.' },
])
const BOT = ['nice win!', 'gl hf', 'wheel is hot 🎡', 'mines cleared 💎', 'anyone on hi-lo?', 'cashed at 3.2x', 'gm all']
const NAMES = ['Leo', 'Ivy', 'Nova', 'Rex', 'Zoe', 'Max', 'Aria']
let iv = 0

function scroll() { nextTick(() => { if (body.value) body.value.scrollTop = body.value.scrollHeight }) }
function send() {
  const t = draft.value.trim()
  if (!t) return
  msgs.value.push({ u: store.isAuthed ? store.user.name : 'You', t, me: true })
  draft.value = ''
  if (msgs.value.length > 60) msgs.value.splice(0, 20)
  scroll()
}
onMounted(() => {
  scroll()
  iv = setInterval(() => {
    msgs.value.push({ u: NAMES[Math.floor(Math.random() * NAMES.length)], t: BOT[Math.floor(Math.random() * BOT.length)] })
    online.value = 20 + Math.floor(Math.random() * 20)
    if (msgs.value.length > 60) msgs.value.splice(0, 20)
    scroll()
  }, 5200)
})
onBeforeUnmount(() => clearInterval(iv))
</script>

<template>
  <aside class="chat">
    <div class="head">
      <span class="dot"></span>
      <b>Live Chat</b>
      <span class="online">{{ online }} online</span>
      <button class="x" aria-label="Close chat" @click="emit('close')">✕</button>
    </div>
    <div ref="body" class="body">
      <div v-for="(m, i) in msgs" :key="i" class="msg" :class="{ me: m.me }">
        <span class="u" :class="{ admin: m.admin, meu: m.me }">{{ m.u }}</span>
        <span class="txt">{{ m.t }}</span>
      </div>
    </div>
    <form class="compose" @submit.prevent="send">
      <input v-model="draft" placeholder="Your Message" maxlength="140" />
      <button type="submit" aria-label="Send">➤</button>
    </form>
  </aside>
</template>

<style scoped>
.chat { width: 288px; flex-shrink: 0; position: sticky; top: 58px; height: calc(100vh - 58px); display: flex; flex-direction: column; border-left: 1px solid var(--line); background: rgba(11,9,33,.4); }
.head { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border-bottom: 1px solid var(--line); }
.dot { width: 8px; height: 8px; border-radius: 999px; background: var(--green); box-shadow: 0 0 8px var(--green); }
.head b { font-size: 14px; } .online { margin-left: auto; color: var(--muted); font-size: 12px; }
.x { border: 0; background: var(--panel-3); color: var(--muted); width: 24px; height: 24px; border-radius: 7px; font-size: 12px; line-height: 1; }
.x:hover { background: var(--line); color: var(--text); }
.body { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; scrollbar-width: thin; }
.msg { display: flex; flex-direction: column; gap: 2px; align-items: flex-start; }
.msg.me { align-items: flex-end; }
.u { font-size: 11px; font-weight: 800; padding: 1px 7px; border-radius: 999px; background: var(--panel-3); color: var(--brand-2); }
.u.admin { background: linear-gradient(135deg,var(--brand),var(--cta)); color: #fff; }
.u.meu { background: var(--green); color: #04140d; }
.txt { font-size: 13px; background: var(--panel-2); border: 1px solid var(--line); border-radius: 10px; padding: 6px 10px; max-width: 90%; }
.msg.me .txt { background: var(--panel-3); }
.compose { display: flex; gap: 8px; padding: 10px; border-top: 1px solid var(--line); }
.compose input { flex: 1; min-width: 0; background: var(--bg-2); border: 1px solid var(--line); border-radius: 999px; padding: 9px 14px; color: var(--text); font-size: 13px; outline: none; }
.compose input:focus { border-color: var(--brand); }
.compose button { width: 38px; border: 0; border-radius: 999px; background: linear-gradient(135deg,var(--cta-2),var(--cta)); color: #fff; font-size: 14px; }
</style>
