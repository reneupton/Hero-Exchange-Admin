# Hero Exchange Admin Console

Operational console for the Hero Exchange platform. This Angular app lets staff monitor auctions, adjust user progress, drive the Python bots, and trigger maintenance jobs against the production gateway (`admin.hero-exchange.live`).

## Why it's interesting
- Real-time view of auctions, users, and bot health, powered by SignalR notifications.
- Admin workflows surfaced over the same microservice gateway used by players, keeping parity with live data.
- Lightweight controls for bot runtime, search reindexing, and wallet adjustments in one panel.

## Live URLs
- Admin: https://admin.hero-exchange.live
- Player app (for context): https://hero-exchange.live

## Tech stack (with reasons)
- Angular 17 + standalone components: fast render, clear separation of pages (dashboard, auctions, bots, users).
- SignalR client: live notifications stream from the gateway.
- RxJS: simple aggregation of parallel admin calls.
- Vercel static hosting: quick deploys for a single-page admin.

## Features
- Dashboard metrics: active auctions, user counts, bot state, and quick error tally.
- Auctions control: finish/cancel listings and kick off search reindex.
- User management: adjust gold balance, reset cooldowns, edit avatars, add/remove heroes.
- Bot operations: start/stop workers, edit config, clear errors, inspect recent activity.
- Search and filters: client-side search over auctions and users.

## Getting started (local)
Prerequisites: Node.js 18+, npm, Angular CLI.

```bash
git clone https://github.com/reneupton/HeroExchange-Admin.git
cd HeroExchange-Admin/admin-console
npm install

# Run with local gateway proxy (http://localhost:6001/admin -> /api)
npm start
```

Update `src/environments/environment.development.ts` to match your local gateway:
- `apiBase`: typically `/api/` with `proxy.conf.json` rewriting to `http://localhost:6001/admin`.
- `adminToken`: the admin bearer token expected by the gateway.
- `notificationsHub`: e.g. `http://localhost:7004/notifications` for SignalR.

Build for production:
```bash
npm run build
```

## Usage examples
**Finish an auction (admin API via gateway)**
```bash
curl -X POST "http://localhost:6001/admin/auctions/{auctionId}/finish" \
  -H "x-admin-token: <admin-token>"
```

**Adjust a user balance**
```bash
curl -X POST "http://localhost:6001/admin/progress/users/alice/balance" \
  -H "x-admin-token: <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"delta": 500}'
```

## Project structure
- `admin-console/src/app/dashboard` - summary metrics and recent activity.
- `admin-console/src/app/auctions` - listing management and search reindex trigger.
- `admin-console/src/app/users` - balances, cooldowns, avatars, hero grants/removals.
- `admin-console/src/app/bots` - runtime control, config, and activity feed.
- `admin-console/src/app/services/admin-api.service.ts` - typed gateway client with admin token injection.
- `admin-console/src/environments/` - per-environment API base, admin token, SignalR hub URL.

## Testing
```bash
cd admin-console
npm test
```
Runs Karma/Jasmine unit tests for components and services.

## Deployment notes
- Build artifacts are static and can be hosted on Vercel; set environment values to point at the live gateway and notifications hub.
- Custom domain: map `admin.hero-exchange.live` to the Vercel project and configure HTTPS.

## Future improvements
1) Add proper admin authentication (OIDC) instead of static token header.
2) Ship end-to-end smoke tests (Playwright) against a staging gateway.
3) Expand dashboards with auction latency/error rates and bot queue depth.

## Licence
Demo project for portfolio use.

## Contact
- Maintainer: Rene Upton (reneupton@pm.me)
- Admin console: https://admin.hero-exchange.live
