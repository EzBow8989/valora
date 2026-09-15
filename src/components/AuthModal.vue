<script setup>
import { ref, watch } from 'vue'
import { useUserStore } from '../store/user'

const props = defineProps({ open: { type: Boolean, default: false }, mode: { type: String, default: 'login' } })
const emit = defineEmits(['close'])
const store = useUserStore()

const tab = ref('login')
const email = ref('')
const pass = ref('')
const age = ref(false)
const error = ref('')
const loading = ref(false)

watch(() => props.open, (v) => { if (v) { tab.value = props.mode; error.value = ''; email.value = ''; pass.value = ''; age.value = false } })

function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }

async function submit() {
  error.value = ''
  if (!validEmail(email.value)) return (error.value = 'Enter a valid email address.')
  if (pass.value.length < 6) return (error.value = 'Password must be at least 6 characters.')
  if (tab.value === 'register' && !age.value) return (error.value = 'You must confirm you are 18 or older.')
  loading.value = true
  await new Promise((r) => setTimeout(r, 550)) // simulate request
  if (tab.value === 'register') store.register(email.value)
  else store.login(email.value)
  loading.value = false
  emit('close')
}
</script>

<template>
  <transition name="fade">
    <div v-if="open" class="overlay" @click.self="emit('close')">
      <div class="modal card" role="dialog" aria-modal="true">
        <button class="x" aria-label="Close" @click="emit('close')">✕</button>
        <div class="tabs">
          <button :class="{ on: tab === 'login' }" @click="tab = 'login'">Login</button>
          <button :class="{ on: tab === 'register' }" @click="tab = 'register'">Join Now</button>
        </div>
        <form @submit.prevent="submit">
          <label>Email
            <input v-model="email" type="email" placeholder="you@email.com" autocomplete="email" />
          </label>
          <label>Password
            <input v-model="pass" type="password" placeholder="••••••••" :autocomplete="tab === 'login' ? 'current-password' : 'new-password'" />
          </label>
          <a v-if="tab === 'login'" class="forgot" href="#" @click.prevent="error = 'Password reset link sent (demo).'">Forgot password?</a>
          <label v-if="tab === 'register'" class="check">
            <input v-model="age" type="checkbox" /> I am 18+ and accept the Terms & Responsible Gaming policy.
          </label>
          <p v-if="error" class="err">{{ error }}</p>
          <button class="btn btn-cta full" type="submit" :disabled="loading">
            {{ loading ? 'Please wait…' : tab === 'login' ? 'Login' : 'Create account' }}
          </button>
        </form>
        <p class="demo">Demo only — no real account, money, or verification. Any email works.</p>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; z-index: 80; background: rgba(4,3,15,.7); backdrop-filter: blur(6px); display: grid; place-items: center; padding: 18px; }
.modal { position: relative; width: 100%; max-width: 380px; padding: 26px 24px 20px; }
.x { position: absolute; top: 12px; right: 14px; background: none; border: 0; color: var(--muted); font-size: 15px; }
.tabs { display: flex; gap: 6px; background: var(--bg-2); border: 1px solid var(--line); border-radius: 12px; padding: 4px; margin-bottom: 18px; }
.tabs button { flex: 1; padding: 9px; border: 0; border-radius: 9px; background: transparent; color: var(--muted); font-weight: 800; }
.tabs button.on { background: linear-gradient(135deg,var(--brand-2),var(--brand)); color: #fff; }
form { display: flex; flex-direction: column; gap: 12px; }
label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: var(--muted); font-weight: 700; }
input[type=email], input[type=password] { background: var(--bg-2); border: 1px solid var(--line); border-radius: 10px; padding: 11px 13px; color: var(--text); font-size: 15px; outline: none; }
input:focus { border-color: var(--brand); }
.forgot { color: var(--brand-2); font-size: 12.5px; font-weight: 700; margin-top: -4px; }
.check { flex-direction: row; align-items: flex-start; gap: 8px; color: var(--muted); font-weight: 600; font-size: 12px; }
.err { color: var(--red); font-size: 13px; margin: 0; font-weight: 600; }
.full { width: 100%; padding: 12px; margin-top: 4px; }
.demo { color: var(--muted); font-size: 11px; text-align: center; margin: 14px 0 0; }
</style>
