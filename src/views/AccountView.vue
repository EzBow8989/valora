<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

const store = useUserStore()
const router = useRouter()
const tab = ref('profile')

const tabs = [
  { k: 'profile', label: 'Profile' },
  { k: 'security', label: 'Security' },
  { k: 'responsible', label: 'Responsible Gaming' },
  { k: 'prefs', label: 'Preferences' },
]

// demo local state
const twoFA = ref(false)
const emailVerified = ref(true)
const phoneVerified = ref(false)
const depLimit = ref(store.limits.deposit || '')
const lossLimit = ref(store.limits.loss || '')
const sessionLimit = ref(store.limits.session || '')
const realityCheck = ref(60)
const notif = ref({ promos: true, security: true, product: false })
const savedMsg = ref('')

const sessions = [
  { device: 'Windows · Chrome', where: 'This device', current: true, ts: 'Now' },
  { device: 'iPhone · Safari', where: 'Oslo, NO', current: false, ts: '2 days ago' },
]

function save(msg) { savedMsg.value = msg; setTimeout(() => (savedMsg.value = ''), 2500) }
function saveLimits() {
  store.limits = { deposit: Number(depLimit.value) || null, loss: Number(lossLimit.value) || null, session: Number(sessionLimit.value) || null }
  save('Responsible-gaming limits updated.')
}
function selfExclude() {
  if (confirm('Self-exclusion will lock your account. In a real platform this cannot be undone before the chosen period ends. Continue (demo)?')) {
    store.logout(); router.push('/')
  }
}
function logout() { store.logout(); router.push('/') }

const initial = computed(() => store.user?.name?.charAt(0) || 'P')
</script>

<template>
  <div v-if="store.isAuthed" class="container wrap">
    <div class="phead">
      <div class="avatar">{{ initial }}</div>
      <div>
        <h1>{{ store.user.name }}</h1>
        <p>{{ store.user.email }}
          <span class="v" :class="{ ok: emailVerified }">{{ emailVerified ? '✓ verified' : 'unverified' }}</span>
        </p>
      </div>
      <button class="btn btn-ghost lo" @click="logout">Logout</button>
    </div>

    <div class="tabs">
      <button v-for="t in tabs" :key="t.k" :class="{ on: tab === t.k }" @click="tab = t.k">{{ t.label }}</button>
    </div>

    <!-- Profile -->
    <div v-if="tab === 'profile'" class="card panel">
      <div class="row2">
        <label>Display name<input :value="store.user.name" /></label>
        <label>Email<input :value="store.user.email" /></label>
      </div>
      <div class="row2">
        <label>Phone
          <div class="verify"><input placeholder="+00 000 000 000" /><span class="badge" :class="{ ok: phoneVerified }">{{ phoneVerified ? 'Verified' : 'Verify' }}</span></div>
        </label>
        <label>Country<select><option>Norway</option><option>Sweden</option><option>Germany</option><option>Other</option></select></label>
      </div>
      <button class="btn btn-brand" @click="save('Profile saved.')">Save changes</button>
    </div>

    <!-- Security -->
    <div v-else-if="tab === 'security'" class="card panel">
      <div class="setting">
        <div><b>Change password</b><span>Use a strong, unique password.</span></div>
        <button class="btn btn-ghost" @click="save('Password reset email sent (demo).')">Change</button>
      </div>
      <div class="setting">
        <div><b>Two-factor authentication (2FA)</b><span>Add an authenticator-app code at login.</span></div>
        <button class="toggle" :class="{ on: twoFA }" @click="twoFA = !twoFA; save(twoFA ? '2FA enabled.' : '2FA disabled.')"><i></i></button>
      </div>
      <div class="subhead">Active sessions & devices</div>
      <div v-for="s in sessions" :key="s.device" class="session">
        <div><b>{{ s.device }}</b><span>{{ s.where }} · {{ s.ts }}</span></div>
        <span v-if="s.current" class="cur">Current</span>
        <button v-else class="btn btn-ghost sm" @click="save('Session revoked.')">Revoke</button>
      </div>
    </div>

    <!-- Responsible gaming -->
    <div v-else-if="tab === 'responsible'" class="card panel">
      <p class="rg-intro">Set your own limits. These tools help you stay in control. Support is available 24/7.</p>
      <div class="row2">
        <label>Daily deposit limit ({{ store.currency }})<input v-model="depLimit" type="number" placeholder="No limit" /></label>
        <label>Daily loss limit ({{ store.currency }})<input v-model="lossLimit" type="number" placeholder="No limit" /></label>
      </div>
      <div class="row2">
        <label>Session time limit (minutes)<input v-model="sessionLimit" type="number" placeholder="No limit" /></label>
        <label>Reality check every
          <select v-model="realityCheck"><option :value="30">30 min</option><option :value="60">60 min</option><option :value="120">120 min</option></select>
        </label>
      </div>
      <button class="btn btn-brand" @click="saveLimits">Save limits</button>

      <div class="subhead">Take a break</div>
      <div class="setting">
        <div><b>Cooling-off</b><span>Lock your account for 24 hours to 6 weeks.</span></div>
        <button class="btn btn-ghost" @click="save('Cooling-off scheduled (demo).')">Start</button>
      </div>
      <div class="setting danger">
        <div><b>Self-exclusion</b><span>Exclude yourself for 6 months or more.</span></div>
        <button class="btn danger-btn" @click="selfExclude">Self-exclude</button>
      </div>
      <a class="helpline" href="/support">Need help? Contact support & responsible-gaming resources →</a>
    </div>

    <!-- Preferences -->
    <div v-else class="card panel">
      <div class="row2">
        <label>Language<select><option>English</option><option>Norsk</option><option>Svenska</option><option>Deutsch</option></select></label>
        <label>Currency
          <select :value="store.currency" @change="store.setCurrency($event.target.value)">
            <option value="EUR">EUR €</option><option value="USD">USD $</option><option value="GBP">GBP £</option>
          </select>
        </label>
      </div>
      <div class="subhead">Notifications</div>
      <div class="setting"><div><b>Promotions & bonuses</b></div><button class="toggle" :class="{ on: notif.promos }" @click="notif.promos = !notif.promos"><i></i></button></div>
      <div class="setting"><div><b>Security alerts</b><span>Always on for your safety.</span></div><button class="toggle on locked"><i></i></button></div>
      <div class="setting"><div><b>Product updates</b></div><button class="toggle" :class="{ on: notif.product }" @click="notif.product = !notif.product"><i></i></button></div>
      <button class="btn btn-brand" @click="save('Preferences saved.')">Save</button>
    </div>

    <transition name="fade"><div v-if="savedMsg" class="toast">{{ savedMsg }}</div></transition>
  </div>

  <div v-else class="container missing">
    <p>Please log in to view your account.</p>
    <button class="btn btn-cta" @click="$emit('auth', 'login')">Login</button>
  </div>
</template>

<style scoped>
.wrap { padding-top: 18px; max-width: 760px; }
.phead { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.avatar { width: 54px; height: 54px; border-radius: 999px; display: grid; place-items: center; font-weight: 900; font-size: 22px; background: linear-gradient(135deg,var(--brand-2),var(--brand)); }
.phead h1 { font-size: 22px; margin: 0; }
.phead p { margin: 2px 0 0; color: var(--muted); font-size: 13.5px; }
.v { font-size: 11px; font-weight: 800; margin-left: 6px; color: var(--muted); }
.v.ok { color: var(--green); }
.lo { margin-left: auto; }
.tabs { display: flex; gap: 6px; overflow-x: auto; background: var(--bg-2); border: 1px solid var(--line); border-radius: 12px; padding: 4px; margin-bottom: 16px; scrollbar-width: none; }
.tabs::-webkit-scrollbar { display: none; }
.tabs button { flex: 1; white-space: nowrap; padding: 10px 12px; border: 0; border-radius: 9px; background: none; color: var(--muted); font-weight: 800; font-size: 13px; }
.tabs button.on { background: linear-gradient(135deg,var(--brand-2),var(--brand)); color: #fff; }
.panel { padding: 20px; }
.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: var(--muted); font-weight: 700; }
input, select { background: var(--bg-2); border: 1px solid var(--line); border-radius: 10px; padding: 11px 13px; color: var(--text); font-size: 14.5px; outline: none; }
input:focus, select:focus { border-color: var(--brand); }
.verify { display: flex; gap: 8px; } .verify input { flex: 1; }
.badge { align-self: center; font-size: 11px; font-weight: 800; padding: 6px 12px; border-radius: 8px; background: var(--panel-3); color: var(--muted); cursor: pointer; }
.badge.ok { background: rgba(52,211,153,.16); color: var(--green); }
.setting { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 0; border-top: 1px solid var(--line); }
.setting:first-of-type { border-top: 0; }
.setting b { font-size: 14.5px; } .setting span { display: block; color: var(--muted); font-size: 12.5px; margin-top: 2px; }
.subhead { font-size: 12px; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); margin: 20px 0 4px; font-weight: 800; }
.session { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-top: 1px solid var(--line); }
.session b { font-size: 14px; } .session span { color: var(--muted); font-size: 12.5px; }
.cur { color: var(--green); font-weight: 800; font-size: 12px; }
.sm { padding: 6px 12px; font-size: 12.5px; }
.toggle { width: 46px; height: 26px; border-radius: 999px; border: 0; background: var(--panel-3); position: relative; transition: background .15s; flex-shrink: 0; }
.toggle i { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 999px; background: #fff; transition: transform .15s; }
.toggle.on { background: linear-gradient(135deg,var(--brand-2),var(--brand)); }
.toggle.on i { transform: translateX(20px); }
.toggle.locked { opacity: .7; cursor: not-allowed; }
.rg-intro { color: var(--muted); font-size: 13.5px; margin: 0 0 16px; }
.danger { border-color: rgba(248,113,113,.3); }
.danger-btn { background: rgba(248,113,113,.15); color: var(--red); border: 1px solid rgba(248,113,113,.4); }
.helpline { display: block; margin-top: 18px; color: var(--brand-2); font-weight: 700; font-size: 13.5px; }
.missing { padding: 80px 0; text-align: center; display: grid; gap: 14px; place-items: center; }
.toast { position: fixed; left: 50%; bottom: 92px; transform: translateX(-50%); background: #103a2c; color: var(--green); border: 1px solid #1c5b45; padding: 11px 18px; border-radius: 12px; font-weight: 700; font-size: 13.5px; z-index: 90; }
@media (max-width: 560px) { .row2 { grid-template-columns: 1fr; } }
</style>
