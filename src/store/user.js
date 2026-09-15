import { defineStore } from 'pinia'

// Demo store — all state is local/mock. No real accounts, money or payments.
const LS = 'valora_state'

function load() {
  try {
    return JSON.parse(localStorage.getItem(LS) || '{}')
  } catch {
    return {}
  }
}
function save(state) {
  try {
    localStorage.setItem(
      LS,
      JSON.stringify({
        user: state.user,
        balance: state.balance,
        bonus: state.bonus,
        currency: state.currency,
        transactions: state.transactions,
        notifications: state.notifications,
        favourites: state.favourites,
        recent: state.recent,
      })
    )
  } catch {}
}

function ref(prefix) {
  return prefix + '-' + Math.random().toString(36).slice(2, 10).toUpperCase()
}

export const useUserStore = defineStore('user', {
  state: () => {
    const s = load()
    return {
      user: s.user || null, // { name, email }
      balance: s.balance ?? 0,
      bonus: s.bonus ?? 0,
      currency: s.currency || 'EUR',
      transactions: s.transactions || [],
      notifications:
        s.notifications ||
        [
          { id: 1, type: 'promo', title: 'Welcome offer waiting', body: 'Claim your 100% welcome bonus on your first deposit.', read: false, ts: Date.now() - 3600e3 },
          { id: 2, type: 'system', title: 'Scheduled maintenance', body: 'Live Casino provider Evolight is under maintenance 03:00–04:00 UTC.', read: false, ts: Date.now() - 7200e3 },
        ],
      favourites: s.favourites || [],
      recent: s.recent || [],
      // responsible gaming (demo)
      limits: { deposit: null, loss: null, session: null },
    }
  },
  getters: {
    isAuthed: (s) => !!s.user,
    total: (s) => s.balance + s.bonus,
    symbol: (s) => ({ EUR: '€', USD: '$', GBP: '£' }[s.currency] || '€'),
    unread: (s) => s.notifications.filter((n) => !n.read).length,
  },
  actions: {
    persist() {
      save(this.$state)
    },
    login(email) {
      const name = (email || 'player').split('@')[0]
      this.user = { name: name.charAt(0).toUpperCase() + name.slice(1), email: email || 'player@valora.demo' }
      if (this.balance === 0 && this.transactions.length === 0) {
        this.balance = 250
        this.bonus = 50
      }
      this.persist()
    },
    register(email) {
      this.login(email)
      this.notify('promo', 'Account created', 'Welcome to Valora! Your demo balance is ready.')
    },
    logout() {
      this.user = null
      this.persist()
    },
    notify(type, title, body) {
      this.notifications.unshift({ id: Date.now(), type, title, body, read: false, ts: Date.now() })
      this.persist()
    },
    markRead(id) {
      const n = this.notifications.find((x) => x.id === id)
      if (n) n.read = true
      this.persist()
    },
    markAllRead() {
      this.notifications.forEach((n) => (n.read = true))
      this.persist()
    },
    toggleFav(id) {
      const i = this.favourites.indexOf(id)
      if (i >= 0) this.favourites.splice(i, 1)
      else this.favourites.unshift(id)
      this.persist()
    },
    pushRecent(id) {
      this.recent = [id, ...this.recent.filter((x) => x !== id)].slice(0, 12)
      this.persist()
    },
    // Wallet (mock). Returns {ok, ref, reason}
    deposit(amount, method) {
      amount = Number(amount)
      if (!(amount > 0)) return { ok: false, reason: 'Enter an amount greater than zero.' }
      if (amount < 10) return { ok: false, reason: 'Minimum deposit is 10.' }
      if (amount > 10000) return { ok: false, reason: 'Maximum single deposit is 10,000.' }
      const r = ref('DEP')
      this.balance += amount
      this.transactions.unshift({
        id: r, kind: 'deposit', method, amount, currency: this.currency, status: 'completed', ts: Date.now(),
      })
      this.notify('wallet', 'Deposit successful', `${this.symbol}${amount.toFixed(2)} added via ${method}.`)
      this.persist()
      return { ok: true, ref: r }
    },
    withdraw(amount, method) {
      amount = Number(amount)
      if (!(amount > 0)) return { ok: false, reason: 'Enter an amount greater than zero.' }
      if (amount < 20) return { ok: false, reason: 'Minimum withdrawal is 20.' }
      if (amount > this.balance) return { ok: false, reason: 'Amount exceeds your withdrawable balance.' }
      const r = ref('WD')
      this.balance -= amount
      this.transactions.unshift({
        id: r, kind: 'withdrawal', method, amount, currency: this.currency, status: 'pending', ts: Date.now(),
      })
      this.notify('wallet', 'Withdrawal requested', `${this.symbol}${amount.toFixed(2)} to ${method} is pending review.`)
      this.persist()
      return { ok: true, ref: r }
    },
    // Real-money game round (mock): stake from balance, random settle.
    settleRound(stake) {
      stake = Number(stake)
      if (stake > this.balance) return { ok: false, reason: 'Insufficient balance.' }
      const win = Math.random() < 0.42 ? stake * (1 + Math.random() * 3) : 0
      this.balance += win - stake
      this.transactions.unshift({
        id: ref('BET'), kind: 'bet', method: 'Game round', amount: -stake, win, currency: this.currency,
        status: 'settled', ts: Date.now(),
      })
      this.persist()
      return { ok: true, win }
    },
    // Low-level bankroll ops used by the playable Instant Games (real mode).
    // Bonus funds are wagerable and spent first, then cash.
    stake(amount) {
      amount = Number(amount)
      if (!(amount > 0) || amount > this.balance + this.bonus) return false
      const fromBonus = Math.min(this.bonus, amount)
      this.bonus -= fromBonus
      this.balance -= amount - fromBonus
      this.persist()
      return true
    },
    credit(amount) {
      amount = Number(amount)
      if (amount > 0) this.balance += amount
      this.persist()
    },
    logBet(stakeAmt, win, game) {
      this.transactions.unshift({
        id: ref('BET'), kind: 'bet', method: game, amount: -Number(stakeAmt), win: Number(win) || 0,
        currency: this.currency, status: 'settled', ts: Date.now(),
      })
      // keep history bounded
      if (this.transactions.length > 200) this.transactions.length = 200
      this.persist()
    },
    setCurrency(c) {
      this.currency = c
      this.persist()
    },
  },
})
