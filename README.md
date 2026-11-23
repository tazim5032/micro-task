# Micro Task 2.0

A micro-task and earning platform, rebuilt with a modern stack. The original v1 code is preserved in this repository's earlier commits; the API is also published on its own in [tazim5032/micro-task-api](https://github.com/tazim5032/micro-task-api).

**Live demo:** https://tazim-micro-task.netlify.app (runs fully in your browser; use the demo login buttons, and reset the data from the footer)

**Front end:** React 18, TypeScript, Vite, Tailwind CSS, React Router
**Back end:** Express, TypeScript, Zod validation, JWT auth, bcrypt; JSON-file database (no setup needed)

## Roles and rules

| Role | What they do |
|---|---|
| **Worker** | Starts with 10 coins. Browses open tasks, submits proof of work, earns coins when approved, withdraws from 200 coins (20 coins = $1) to bKash, Nagad or Rocket. |
| **Task creator** | Starts with 50 coins. Posts tasks (cost = workers × pay, reserved up front), reviews submissions (approve pays the worker, reject reopens the slot with feedback), edits or deletes tasks (unused coins refunded), buys coin packages by card. |
| **Admin** | Sees platform stats and a 14-day activity chart, approves or rejects withdrawals (rejection returns coins), changes roles, suspends users, removes tasks (with refund). |

Every action that affects another user sends them an in-app notification (bell in the dashboard).

## Run it

```bash
npm run setup   # first time
npm run dev     # API on http://localhost:5070, web app on http://localhost:5174
```

Open http://localhost:5174. The login page has one-click **Worker**, **Task creator** and **Admin** demo buttons.
Demo credentials are in `server/src/seed.ts` (local demo only).

Other scripts: `npm run typecheck`, `npm run build`, `npm run reset-data` (restore demo data; restart the API afterwards).

## Notes

- Coin purchases use a simulated card checkout (test card 4242 4242 4242 4242) and withdrawals are simulated. No real money moves.
- Data lives in `server/data/db.json`. The data layer is isolated in `server/src/db.ts` so it can be swapped for MongoDB.
