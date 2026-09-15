# Valora — iGaming Platform Frontend (Demo)

A multi-page casino & sports **frontend demo** built with Vue 3 + Vite. Original
brand, original artwork, mock data — **no real gambling, accounts, money or
payments**. 18+ / responsible-gaming UI included.

## Pages / routes

| Route | Page |
|-------|------|
| `/` | Home lobby — hero carousel, category tiles, payout ticker, game rails |
| `/slots` `/live-casino` `/table-games` `/jackpots` | Category grids with search, provider filter, sort, load-more pagination |
| `/game/:id` | Game launch — demo/real modes, loading/error/maintenance/insufficient-balance states, fullscreen |
| `/sports` | Sportsbook — live + upcoming fixtures with odds |
| `/promotions`, `/promotions/:id` | Promotion listing + detail (what/how/wagering/expiry, T&Cs) |
| `/vip` | VIP tiers |
| `/wallet` | Balance, deposit, withdraw, transaction history (mock) |
| `/account` | Profile, security/2FA/sessions, responsible gaming, preferences |
| `/support` | Help center, FAQ, contact/ticket |

## Notable frontend behaviours

- **Large-catalog safe:** category views call a simulated paged search API
  (`queryGames`) and never render the whole catalog at once — debounced search,
  filter, sort, load-more, image lazy-loading.
- **DEMO vs REAL** is enforced on the frontend: demo uses free credits and never
  touches the wallet; real deducts/settles against balance and blocks on
  insufficient funds; live tables are real-only.
- **State** (auth, wallet, favourites, recently played, notifications) persists
  to `localStorage` via Pinia.
- **Every asset is generated** at runtime as inline SVG — zero external images,
  fonts, or trackers.

## Develop / build

```bash
npm install
npm run dev      # local dev server
npm run build    # -> dist/
npm run preview
```

Zero-config deploy on Vercel (Vite preset). SPA routing via `vercel.json` rewrites.
Connected to Vercel Git — every push to `master` triggers a production deploy.

## Structure

- `src/data/` — games (generated catalog + paged query API), promotions, vip, sports
- `src/lib/thumb.js` — runtime SVG game art
- `src/store/user.js` — Pinia store: auth, wallet, transactions, notifications
- `src/components/` — header, mobile nav, hero, rails, game card, auth modal, notifications, footer
- `src/views/` — one file per page above
