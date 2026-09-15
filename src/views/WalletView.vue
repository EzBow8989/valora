<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../store/user'

const store = useUserStore()
const tab = ref('deposit')

const methods = ['Visa / Mastercard', 'Apple Pay', 'Skrill', 'Crypto (USDT)', 'Bank Transfer']
const quick = [20, 50, 100, 250, 500]

const amount = ref(null)
const method = ref(methods[0])
const wMethod = ref(methods[0])
const processing = ref(false)
const feedback = ref(null) // {ok, msg, ref}

const filter = ref('all')
const txns = computed(() =>
  filter.value === 'all' ? store.transactions : store.transactions.filter((t) => t.kind === filter.value)
)

async function doDeposit() {
  if (processing.value) return // duplicate-click protection
  feedback.value = null
  processing.value = true
  await new Promise((r) => setTimeout(r, 700))
  const res = store.deposit(amount.value, method.value)
  processing.value = false
  feedback.value = res.ok
    ? { ok: true, msg: `Deposit confirmed. Reference ${res.ref}.`, ref: res.ref }
    : { ok: false, msg: res.reason }
  if (res.ok) amount.value = null
}
async function doWithdraw() {
  if (processing.value) return
  feedback.value = null
  processing.value = true
  await new Promise((r) => setTimeout(r, 700))
  const res = store.withdraw(amount.value, wMethod.value)
  processing.value = false
  feedback.value = res.ok
    ? { ok: true, msg: `Withdrawal of ${store.symbol}${Number(amount.value).toFixed(2)} requested (pending review). Ref ${res.ref}.`, ref: res.ref }
    : { ok: false, msg: res.reason }
  if (res.ok) amount.value = null
}

function fmt(ts) { return new Date(ts).toLocaleString() }
function statusClass(s) { return ({ completed: 'ok', settled: 'ok', pending: 'pend', failed: 'bad', rejected: 'bad' }[s] || '') }
</script>

<template>
  <div class="container wrap">
    <h1>Wallet</h1>

    <div class="balances">
      <div class="bal card"><span>Cash balance</span><b>{{ store.symbol }}{{ store.balance.toFixed(2) }}</b></div>
      <div class="bal card"><span>Bonus balance</span><b>{{ store.symbol }}{{ store.bonus.toFixed(2) }}</b></div>
      <div class="bal card total"><span>Total</span><b>{{ store.symbol }}{{ store.total.toFixed(2) }}</b></div>
    </div>

    <div class="tabs">
      <button :class="{ on: tab === 'deposit' }" @click="tab = 'deposit'; feedback = null">Deposit</button>
      <button :class="{ on: tab === 'withdraw' }" @click="tab = 'withdraw'; feedback = null">Withdraw</button>
      <button :class="{ on: tab === 'history' }" @click="tab = 'history'">History</button>
    </div>

    <!-- Deposit -->
    <div v-if="tab === 'deposit'" class="panel card">
      <label class="fld">Payment method
        <select v-model="method"><option v-for="m in methods" :key="m">{{ m }}</option></select>
      </label>
      <div class="quick">
        <button v-for="q in quick" :key="q" :class="{ on: amount === q }" @click="amount = q">{{ store.symbol }}{{ q }}</button>
      </div>
      <label class="fld">Amount ({{ store.currency }})
        <input v-model.number="amount" type="number" min="10" placeholder="Min 10, max 10,000" />
      </label>
      <button class="btn btn-cta full" :disabled="processing" @click="doDeposit">
        {{ processing ? 'Processing…' : `Deposit ${amount ? store.symbol + Number(amount).toFixed(2) : ''}` }}
      </button>
      <p class="hint">Instant, secure and encrypted. Min {{ store.symbol }}10 · Max {{ store.symbol }}10,000 per transaction.</p>
    </div>

    <!-- Withdraw -->
    <div v-else-if="tab === 'withdraw'" class="panel card">
      <p class="avail">Available to withdraw: <b>{{ store.symbol }}{{ store.balance.toFixed(2) }}</b> <span class="note">(bonus funds must be wagered first)</span></p>
      <label class="fld">Withdraw to
        <select v-model="wMethod"><option v-for="m in methods" :key="m">{{ m }}</option></select>
      </label>
      <label class="fld">Amount ({{ store.currency }})
        <input v-model.number="amount" type="number" min="20" placeholder="Min 20" />
      </label>
      <button class="btn btn-brand full" :disabled="processing" @click="doWithdraw">
        {{ processing ? 'Submitting…' : 'Request withdrawal' }}
      </button>
      <p class="hint">Withdrawals are reviewed within 24h. Min {{ store.symbol }}20.</p>
    </div>

    <!-- History -->
    <div v-else class="panel card history">
      <div class="hfilter">
        <button v-for="f in ['all','deposit','withdrawal','bet']" :key="f" :class="{ on: filter === f }" @click="filter = f">{{ f }}</button>
      </div>
      <div v-if="!txns.length" class="empty">No transactions yet.</div>
      <table v-else>
        <thead><tr><th>Reference</th><th>Type</th><th>Method</th><th class="r">Amount</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          <tr v-for="t in txns" :key="t.id">
            <td class="mono">{{ t.id }}</td>
            <td class="cap">{{ t.kind }}</td>
            <td>{{ t.method }}</td>
            <td class="r" :class="t.amount < 0 ? 'neg' : 'pos'">{{ t.amount < 0 ? '−' : '+' }}{{ store.symbol }}{{ Math.abs(t.amount).toFixed(2) }}<span v-if="t.win" class="win">+{{ store.symbol }}{{ t.win.toFixed(2) }}</span></td>
            <td><span class="stat" :class="statusClass(t.status)">{{ t.status }}</span></td>
            <td class="date">{{ fmt(t.ts) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <transition name="fade">
      <div v-if="feedback" class="toast" :class="feedback.ok ? 'ok' : 'bad'">
        {{ feedback.msg }}
        <button v-if="!feedback.ok" class="retry" @click="tab === 'deposit' ? doDeposit() : doWithdraw()">Retry</button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.wrap { padding-top: 18px; max-width: 720px; }
h1 { font-size: 26px; margin: 0 0 16px; }
.balances { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 18px; }
.bal { padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; }
.bal span { color: var(--muted); font-size: 12.5px; }
.bal b { font-size: 20px; }
.bal.total { background: linear-gradient(135deg, var(--panel-3), var(--panel-2)); }
.tabs { display: flex; gap: 6px; background: var(--bg-2); border: 1px solid var(--line); border-radius: 12px; padding: 4px; margin-bottom: 16px; }
.tabs button { flex: 1; padding: 10px; border: 0; border-radius: 9px; background: none; color: var(--muted); font-weight: 800; }
.tabs button.on { background: linear-gradient(135deg,var(--brand-2),var(--brand)); color: #fff; }
.panel { padding: 20px; }
.fld { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: var(--muted); font-weight: 700; margin-bottom: 14px; }
.fld select, .fld input { background: var(--bg-2); border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; color: var(--text); font-size: 15px; outline: none; }
.fld input:focus, .fld select:focus { border-color: var(--brand); }
.quick { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.quick button { border: 1px solid var(--line); background: var(--panel-2); color: var(--text); border-radius: 9px; padding: 9px 16px; font-weight: 700; }
.quick button.on { background: linear-gradient(135deg,var(--cta-2),var(--cta)); border-color: transparent; color: #fff; }
.full { width: 100%; padding: 13px; }
.hint { color: var(--muted); font-size: 12px; margin: 12px 0 0; }
.avail { font-size: 14px; margin: 0 0 16px; } .avail .note { color: var(--muted); font-size: 12px; }
.hfilter { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
.hfilter button { border: 1px solid var(--line); background: var(--panel-2); color: var(--muted); border-radius: 999px; padding: 6px 14px; font-weight: 700; font-size: 12.5px; text-transform: capitalize; }
.hfilter button.on { background: var(--panel-3); color: #fff; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th { text-align: left; color: var(--muted); font-weight: 700; padding: 8px 6px; border-bottom: 1px solid var(--line); font-size: 12px; text-transform: uppercase; }
td { padding: 11px 6px; border-bottom: 1px solid var(--line); }
.r { text-align: right; } .cap { text-transform: capitalize; }
.mono { font-family: ui-monospace, monospace; font-size: 12px; color: var(--muted); }
.pos { color: var(--green); font-weight: 700; } .neg { color: var(--text); font-weight: 700; }
.win { color: var(--green); font-size: 11px; margin-left: 6px; }
.stat { font-size: 11px; font-weight: 800; padding: 3px 9px; border-radius: 999px; text-transform: capitalize; }
.stat.ok { background: rgba(52,211,153,.16); color: var(--green); }
.stat.pend { background: rgba(255,197,61,.16); color: var(--gold); }
.stat.bad { background: rgba(248,113,113,.16); color: var(--red); }
.date { color: var(--muted); font-size: 12px; white-space: nowrap; }
.empty { text-align: center; color: var(--muted); padding: 40px 0; }
.toast { position: fixed; left: 50%; transform: translateX(-50%); bottom: 92px; z-index: 90; padding: 12px 18px; border-radius: 12px; font-weight: 700; font-size: 13.5px; box-shadow: 0 12px 30px rgba(0,0,0,.4); display: flex; align-items: center; gap: 12px; max-width: 92vw; }
.toast.ok { background: #103a2c; color: var(--green); border: 1px solid #1c5b45; }
.toast.bad { background: #3a1414; color: var(--red); border: 1px solid #5b1c1c; }
.retry { background: none; border: 1px solid currentColor; color: inherit; border-radius: 8px; padding: 4px 12px; font-weight: 800; }
@media (max-width: 560px) { .balances { grid-template-columns: 1fr; } .date, thead th:last-child { display: none; } td:last-child { display: none; } }
</style>
