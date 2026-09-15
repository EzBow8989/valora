<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { queryGames, PROVIDERS } from '../data/games'
import GameCard from '../components/GameCard.vue'

const route = useRoute()

const cat = computed(() => route.meta.cat)
const title = computed(() => route.meta.title || 'Games')

const q = ref(route.query.q || '')
const provider = ref('')
const sort = ref(route.query.sort || 'popular')
const page = ref(1)
const pageSize = 24

const items = ref([])
const total = ref(0)
const hasMore = ref(false)
const loading = ref(false)

// Simulates a paged search API — the browser never renders the whole catalog.
function fetchPage(reset) {
  loading.value = true
  setTimeout(() => {
    const res = queryGames({ cat: cat.value, q: q.value, provider: provider.value, sort: sort.value, page: page.value, pageSize })
    items.value = reset ? res.items : [...items.value, ...res.items]
    total.value = res.total
    hasMore.value = res.hasMore
    loading.value = false
  }, 220) // visible loading state
}
function reload() { page.value = 1; fetchPage(true) }
function loadMore() { if (!loading.value && hasMore.value) { page.value++; fetchPage(false) } }

let t
watch(q, () => { clearTimeout(t); t = setTimeout(reload, 300) }) // debounced search
watch([provider, sort, cat], reload)
watch(() => route.query.q, (v) => { q.value = v || '' })
onMounted(reload)
</script>

<template>
  <div class="container">
    <div class="head">
      <h1>{{ title }} <span class="count">{{ total }}</span></h1>
    </div>

    <div class="filters">
      <div class="search">
        <svg viewBox="0 0 24 24" width="17" height="17"><path fill="currentColor" d="M10 4a6 6 0 104.47 10.03l4.25 4.25 1.41-1.42-4.24-4.24A6 6 0 0010 4m0 2a4 4 0 110 8 4 4 0 010-8"/></svg>
        <input v-model="q" type="search" :placeholder="`Search ${title.toLowerCase()}…`" />
      </div>
      <select v-model="provider" aria-label="Provider">
        <option value="">All providers</option>
        <option v-for="p in PROVIDERS" :key="p" :value="p">{{ p }}</option>
      </select>
      <select v-model="sort" aria-label="Sort">
        <option value="popular">Popular</option>
        <option value="new">New</option>
        <option value="az">A–Z</option>
        <option value="rtp">Highest RTP</option>
      </select>
    </div>

    <div v-if="loading && !items.length" class="grid">
      <div v-for="i in 12" :key="i" class="skeleton sk" />
    </div>

    <div v-else-if="!items.length" class="empty">
      <p>No games match your filters.</p>
      <button class="btn btn-ghost" @click="q = ''; provider = ''; reload()">Clear filters</button>
    </div>

    <template v-else>
      <div class="grid">
        <GameCard v-for="g in items" :key="g.id" :game="g" />
      </div>
      <div class="more">
        <button v-if="hasMore" class="btn btn-brand" :disabled="loading" @click="loadMore">
          {{ loading ? 'Loading…' : `Load more (${total - items.length} left)` }}
        </button>
        <p v-else class="done">Showing all {{ total }} games</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.head { margin: 20px 0 14px; }
h1 { font-size: clamp(22px, 3vw, 30px); margin: 0; }
.count { color: var(--muted); font-size: 15px; font-weight: 600; margin-left: 6px; }
.filters { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
.search { flex: 1; min-width: 200px; display: flex; align-items: center; gap: 8px; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 9px 14px; color: var(--muted); }
.search input { flex: 1; background: none; border: 0; outline: none; color: var(--text); font-size: 14.5px; }
select { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 9px 14px; color: var(--text); font-size: 14px; }
.grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; }
.sk { aspect-ratio: 1; }
.more { text-align: center; margin: 26px 0; }
.done { color: var(--muted); font-size: 13px; }
.empty { text-align: center; padding: 60px 0; color: var(--muted); display: grid; gap: 14px; place-items: center; }
@media (max-width: 1000px) { .grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 640px) { .grid { grid-template-columns: repeat(3, 1fr); gap: 10px; } }
@media (max-width: 420px) { .grid { grid-template-columns: repeat(2, 1fr); } }
</style>
