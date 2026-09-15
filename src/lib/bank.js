import { computed, ref } from 'vue'
import { useUserStore } from '../store/user'

// Shared bankroll for the playable Instant Games.
// mode === 'demo' -> free local credits (no wallet touch)
// mode === 'real' -> the user's demo wallet balance in the Pinia store
export function useBank(mode) {
  const store = useUserStore()
  const demo = ref(5000)

  const balance = computed(() => (mode.value === 'demo' ? demo.value : store.balance))
  const symbol = computed(() => (mode.value === 'demo' ? '' : store.symbol))
  const isAuthed = computed(() => store.isAuthed)

  function canBet(stake) {
    return stake > 0 && stake <= balance.value
  }
  function bet(stake) {
    stake = Number(stake)
    if (!(stake > 0)) return false
    if (mode.value === 'demo') {
      if (stake > demo.value) return false
      demo.value -= stake
      return true
    }
    return store.stake(stake)
  }
  function win(amount) {
    amount = Number(amount)
    if (!(amount > 0)) return
    if (mode.value === 'demo') demo.value += amount
    else store.credit(amount)
  }
  function log(stake, w, game) {
    if (mode.value !== 'demo') store.logBet(stake, w, game)
  }
  return { balance, symbol, isAuthed, canBet, bet, win, log, demo }
}
