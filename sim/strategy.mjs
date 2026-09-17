// Betting-strategy exploit audit: runs Martingale / Fibonacci / D'Alembert /
// Paroli / Flat against each game's ACTUAL payout math and checks whether any
// produces guaranteed profit. RNG is memoryless + stake-independent (as in the
// app) — strategies only change the WAGER, never the odds.
// Run: node sim/strategy.mjs
const rnd = Math.random
const SESSIONS = 20000
const ROUNDS = 400
const BALANCE = 1000
const BASE = 5
const MAXBET = 250 // matches BetControls cap

// --- per-round payout multiplier samplers (× the stake), current game math ---
const R_RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36])
const SLOT_W = [30,22,16,12,8,5,3], SLOT_PAY = [8,12,22,38,80,160,500]
const SLOT_POOL = SLOT_W.flatMap((w,i)=>Array(w).fill(i))
function slot() {
  const a=SLOT_POOL[rnd()*SLOT_POOL.length|0],b=SLOT_POOL[rnd()*SLOT_POOL.length|0],c=SLOT_POOL[rnd()*SLOT_POOL.length|0]
  if (a===b&&b===c) return SLOT_PAY[a]
  if (a===b||b===c||a===c) return 0.55
  return 0
}
const WHEEL=['red','blue','red','green','red','blue','red','gold','red','blue','red','green','red','blue','red','gold','red','blue','red','green','house','blue','house','house']
const SAMPLERS = {
  'Coin Flip':      () => (rnd()<0.5 ? 1.9 : 0),
  'Roulette (red)': () => (R_RED.has(rnd()*37|0) ? 2 : 0),
  'Dice (over 50)': () => { const r=rnd()*100; return r>50 ? 1.8 : 0 },
  'Wheel (red)':    () => (WHEEL[rnd()*24|0]==='red' ? 2.16 : 0),
  'Slots':          () => slot(),
}

// --- strategies: given (base, lastRet, lastBet, state) -> next bet ---
const STRATS = {
  Flat: () => ({ next: (s)=>{ s.bet=BASE } }),
  Martingale: () => ({ next: (s)=>{ s.bet = s.win ? BASE : s.bet*2 } }),
  Paroli: () => ({ next: (s)=>{ s.bet = s.win ? s.bet*2 : BASE } }), // reverse martingale
  Fibonacci: () => ({ next: (s)=>{ if(s.win){ s.fi=Math.max(0,s.fi-2) } else { s.fi++ } s.bet = BASE*fib(s.fi) } }),
  DAlembert: () => ({ next: (s)=>{ s.bet = s.win ? Math.max(BASE,s.bet-BASE) : s.bet+BASE } }),
}
const FIB=[1,1,2,3,5,8,13,21,34,55,89,144,233,377,610]
const fib=(i)=>FIB[Math.min(i,FIB.length-1)]

function runSession(sampler, strat) {
  let bal=BALANCE, wagered=0, paid=0, streak=0, maxStreak=0, capHits=0, exhausted=false
  const s={ bet:BASE, win:false, fi:0 }
  for (let i=0;i<ROUNDS;i++){
    s.bet = Math.min(MAXBET, Math.max(BASE, Math.round(s.bet*100)/100))
    if (s.bet > MAXBET-0.001) capHits++
    if (s.bet > bal) { exhausted=true; break } // can't cover the next progression bet
    bal -= s.bet; wagered += s.bet
    const ret = s.bet * sampler()
    bal += ret; paid += ret
    s.win = ret >= s.bet
    if (!s.win) { streak++; maxStreak=Math.max(maxStreak,streak) } else streak=0
    strat.next(s)
  }
  return { profit: bal-BALANCE, wagered, paid, maxStreak, capHits, exhausted }
}

console.log(`Sessions ${SESSIONS} × ${ROUNDS} rounds | start ${BALANCE}, base ${BASE}, maxBet ${MAXBET}\n`)
for (const [gname, sampler] of Object.entries(SAMPLERS)) {
  console.log(`── ${gname} ──`)
  for (const [sname, mk] of Object.entries(STRATS)) {
    let pos=0, sumProfit=0, wag=0, pay=0, worstStreak=0, exh=0, caps=0, worst=Infinity
    for (let i=0;i<SESSIONS;i++){
      const r=runSession(sampler, mk())
      if (r.profit>0) pos++
      sumProfit+=r.profit; wag+=r.wagered; pay+=r.paid
      worstStreak=Math.max(worstStreak,r.maxStreak); if(r.exhausted)exh++; caps+=r.capHits; worst=Math.min(worst,r.profit)
    }
    const rtp=(pay/wag*100)
    console.log(
      `  ${sname.padEnd(11)} ends+ ${(pos/SESSIONS*100).toFixed(1).padStart(5)}% | ` +
      `avg P/L ${(sumProfit/SESSIONS).toFixed(1).padStart(8)} | worst ${worst.toFixed(0).padStart(7)} | ` +
      `RTP ${rtp.toFixed(2)}% | maxLossStreak ${worstStreak} | bust ${(exh/SESSIONS*100).toFixed(1)}%`
    )
  }
  console.log()
}
