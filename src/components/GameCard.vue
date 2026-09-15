<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { thumb } from '../lib/thumb'

const props = defineProps({ game: { type: Object, required: true } })
const router = useRouter()
const store = useUserStore()

const art = computed(() => thumb(props.game.title, props.game.cat))
const fav = computed(() => store.favourites.includes(props.game.id))

function open(mode) {
  router.push({ name: 'game', params: { id: props.game.id }, query: mode ? { mode } : {} })
}
function toggleFav(e) {
  e.stopPropagation()
  store.toggleFav(props.game.id)
}
</script>

<template>
  <div class="gc" @click="open()">
    <div class="art">
      <img :src="art" :alt="game.title" loading="lazy" width="360" height="360" />
      <div class="tags">
        <span v-if="game.new" class="pill pill-new">NEW</span>
        <span v-else-if="game.hot" class="pill pill-hot">HOT</span>
        <span v-if="game.cat === 'jackpot'" class="pill pill-jackpot">JACKPOT</span>
        <span v-if="game.cat === 'live'" class="pill pill-live">LIVE</span>
      </div>
      <button class="fav" :class="{ on: fav }" :aria-label="fav ? 'Remove favourite' : 'Add favourite'" @click="toggleFav">
        <svg viewBox="0 0 24 24" width="16" height="16"><path :fill="fav ? '#ff2d78' : 'none'" stroke="#fff" stroke-width="1.8" d="M12 20s-7-4.35-9.2-8.3C1.3 8.9 2.6 6 5.5 6c1.9 0 3.1 1.1 3.9 2.2C10.1 7.1 11.3 6 13.2 6c2.9 0 4.2 2.9 2.7 5.7C19 15.65 12 20 12 20z"/></svg>
      </button>
      <div class="hover">
        <button class="btn btn-cta play" @click.stop="open('real')">Play</button>
        <button v-if="game.demo" class="btn btn-ghost demo" @click.stop="open('demo')">Demo</button>
      </div>
      <div v-if="game.jackpot" class="jp">{{ store.symbol }}{{ game.jackpot.toLocaleString() }}</div>
    </div>
    <div class="meta">
      <p class="t">{{ game.title }}</p>
      <p class="p">{{ game.provider }}</p>
    </div>
  </div>
</template>

<style scoped>
.gc { cursor: pointer; }
.art {
  position: relative;
  aspect-ratio: 1;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--panel);
}
.art img { width: 100%; height: 100%; object-fit: cover; transition: transform .35s ease; }
.gc:hover .art img { transform: scale(1.07); }
.tags { position: absolute; top: 8px; left: 8px; display: flex; gap: 5px; flex-wrap: wrap; }
.fav {
  position: absolute; top: 6px; right: 6px; width: 30px; height: 30px;
  display: grid; place-items: center; border: 0; border-radius: 999px;
  background: rgba(0,0,0,.35); backdrop-filter: blur(4px);
}
.hover {
  position: absolute; inset: 0; display: flex; flex-direction: column; gap: 8px;
  align-items: center; justify-content: center; opacity: 0;
  background: rgba(9,7,30,.55); transition: opacity .18s ease;
}
.gc:hover .hover { opacity: 1; }
.play { padding: 8px 26px; }
.demo { padding: 7px 22px; }
.jp {
  position: absolute; bottom: 8px; left: 8px; right: 8px; text-align: center;
  font-weight: 800; font-size: 13px; color: #2a1e00;
  background: linear-gradient(135deg, #ffc53d, #ff9f1c); border-radius: 8px; padding: 3px 0;
}
.meta { padding: 8px 2px 0; }
.t { margin: 0; font-weight: 700; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.p { margin: 1px 0 0; color: var(--muted); font-size: 12px; }
</style>
