<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useUserStore } from '../store/user'

const store = useUserStore()
const jackpot = ref(7210000 + Math.random() * 90000)
const feed = ref([])
let iv = 0

const jackpotStr = computed(() =>
  jackpot.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
)
const GAMES = ['Liftoff', 'Gem Hunt', 'Plinko Drop', 'Spin Fortune', 'Rune Reels']
function tick() {
  jackpot.value += Math.random() * 40
  feed.value.unshift({
    game: GAMES[Math.floor(Math.random() * GAMES.length)],
    amt: (Math.random() * 120 + 8).toFixed(2),
  })
  feed.value = feed.value.slice(0, 6)
}
onMounted(() => { for (let i = 0; i < 6; i++) tick(); iv = setInterval(tick, 2600) })
onBeforeUnmount(() => clearInterval(iv))
</script>

<template>
  <section class="container act">
    <h2 class="rail-head-title">Activity screen</h2>
    <div class="cards">
      <div class="pcard win">
        <span class="cap">Last Win</span>
        <b class="big">{{ store.symbol }}{{ feed[0] ? feed[0].amt : '0.00' }}</b>
        <span class="sub">in {{ feed[0] ? feed[0].game : 'Liftoff' }}</span>
      </div>
      <div class="pcard jp">
        <span class="cap">Total Jackpot</span>
        <b class="big gold">{{ store.symbol }}{{ jackpotStr }}</b>
        <router-link to="/instant" class="btn btn-cta play">Play</router-link>
      </div>
      <div class="pcard month">
        <span class="cap">Win of the Month</span>
        <b class="big">{{ store.symbol }}193,800.00</b>
        <span class="sub">in Plinko Drop</span>
      </div>
    </div>
    <div class="feed">
      <div v-for="(f, i) in feed" :key="i" class="row">
        <span class="tag">WIN</span>
        <span class="g">{{ f.game }}</span>
        <span class="a">+{{ store.symbol }}{{ f.amt }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.act { margin-top: 22px; }
.rail-head-title { font-size: clamp(18px, 2.4vw, 24px); font-weight: 800; margin: 0 0 14px; }
.cards { display: grid; grid-template-columns: 1fr 1.3fr 1fr; gap: 14px; }
.pcard { border: 1px solid var(--line); border-radius: 16px; padding: 22px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; min-height: 190px; justify-content: center; }
.win { background: radial-gradient(120% 120% at 30% 20%, #12325a, #0e0b2b); }
.jp { background: radial-gradient(120% 120% at 50% 10%, #4a2a10, #2a1550); }
.month { background: radial-gradient(120% 120% at 70% 20%, #3a1420, #0e0b2b); }
.cap { color: var(--muted); font-size: 12.5px; text-transform: uppercase; letter-spacing: .05em; font-weight: 700; }
.big { font-size: clamp(22px, 3.4vw, 34px); font-weight: 900; letter-spacing: -.02em; }
.big.gold { background: linear-gradient(135deg,#ffe37a,#ff9f1c); -webkit-background-clip: text; background-clip: text; color: transparent; }
.sub { color: var(--muted); font-size: 13px; }
.play { margin-top: 4px; padding: 9px 30px; }
.feed { display: flex; gap: 10px; overflow-x: auto; margin-top: 14px; padding-bottom: 4px; scrollbar-width: none; }
.feed::-webkit-scrollbar { display: none; }
.row { flex-shrink: 0; display: flex; align-items: center; gap: 8px; background: var(--panel-2); border: 1px solid var(--line); border-radius: 999px; padding: 7px 14px; font-size: 12.5px; }
.tag { background: var(--green); color: #04140d; font-weight: 800; font-size: 10px; padding: 1px 7px; border-radius: 999px; }
.g { color: var(--muted); } .a { color: var(--green); font-weight: 800; }
@media (max-width: 780px) { .cards { grid-template-columns: 1fr; } }
</style>
