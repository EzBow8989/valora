<script setup>
const props = defineProps({
  stake: { type: Number, required: true },
  balance: { type: Number, required: true },
  symbol: { type: String, default: '' },
  mode: { type: String, default: 'demo' },
  disabled: { type: Boolean, default: false },
  min: { type: Number, default: 0.2 },
  max: { type: Number, default: 250 }, // table limit — caps Martingale doubling
})
const emit = defineEmits(['update:stake', 'update:mode'])

function set(v) {
  if (isNaN(v)) v = props.min
  v = Math.min(props.max, Math.max(props.min, Math.round(v * 100) / 100))
  emit('update:stake', v)
}
</script>

<template>
  <div class="bc">
    <div class="mode">
      <button :class="{ on: mode === 'real' }" :disabled="disabled" @click="emit('update:mode', 'real')">Real</button>
      <button :class="{ on: mode === 'demo' }" :disabled="disabled" @click="emit('update:mode', 'demo')">Fun</button>
    </div>
    <div class="bal">
      <span>Balance</span>
      <b>{{ symbol }}{{ balance.toFixed(2) }}</b>
    </div>
    <label class="stake">
      Bet amount
      <div class="row">
        <input :value="stake" type="number" min="0.2" step="0.2" :disabled="disabled"
               @input="set(Number($event.target.value))" />
        <button :disabled="disabled" @click="set(stake / 2)">½</button>
        <button :disabled="disabled" @click="set(stake * 2)">2×</button>
        <button :disabled="disabled" @click="set(balance)">Max</button>
      </div>
    </label>
    <p class="limits">Table limit · {{ symbol }}{{ min.toFixed(2) }} – {{ symbol }}{{ max.toFixed(0) }} per bet</p>
    <slot />
  </div>
</template>

<style scoped>
.bc { background: var(--panel-2); border: 1px solid var(--line); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.mode { display: flex; gap: 4px; background: var(--bg-2); border: 1px solid var(--line); border-radius: 10px; padding: 4px; }
.mode button { flex: 1; border: 0; background: none; color: var(--muted); font-weight: 800; padding: 9px; border-radius: 8px; }
.mode button.on { background: linear-gradient(135deg,var(--brand-2),var(--brand)); color: #fff; }
.bal { display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: var(--muted); }
.bal b { color: var(--text); font-size: 16px; }
.stake { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: var(--muted); font-weight: 700; }
.row { display: flex; gap: 6px; }
.row input { flex: 1; min-width: 0; background: var(--bg-2); border: 1px solid var(--line); border-radius: 9px; padding: 11px 12px; color: var(--text); font-size: 15px; outline: none; }
.row input:focus { border-color: var(--brand); }
.row button { border: 1px solid var(--line); background: var(--panel-3); color: var(--text); border-radius: 9px; padding: 0 12px; font-weight: 800; font-size: 13px; }
.row button:hover:not(:disabled) { background: var(--brand); }
.limits { margin: -4px 0 0; color: var(--muted); font-size: 11px; }
</style>
