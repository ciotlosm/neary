# Neary

Real-time transit tracking PWA for Cluj-Napoca.

This repo is a monorepo with two apps side-by-side:

| Path | What | Status |
|---|---|---|
| [`apps/legacy/`](apps/legacy/) | The React 19 + MUI app currently serving production. | Maintained on bug-fix terms only — no new features. |
| [`apps/web/`](apps/web/) | v2 rebuild on Svelte 5 + SvelteKit + Tailwind v4 + SQLite-WASM. | In active development. See [`docs/rebuild-v2/plan.md`](docs/rebuild-v2/plan.md). |

Schedule data lives in a separate repo: [`ciotlosm/neary-gtfs`](https://github.com/ciotlosm/neary-gtfs) (daily GitHub Action; serves JSON for legacy and SQLite blobs for v2 via `raw.githubusercontent.com`).

## Quick start

```bash
npm install              # workspaces install at the root
npm run dev:legacy       # legacy app on http://localhost:5175
npm run dev:web          # v2 app on http://localhost:5173
npm run build            # builds both apps
npm test                 # runs both test suites
```

Node 20+.

## Layout

```
apps/legacy/             # React + MUI v1 app (Vite, Vitest)
apps/web/                # Svelte 5 + SvelteKit v2 app (Tailwind v4, Vitest)
docs/                    # Long-lived specs; current rebuild plan lives here
docs/rebuild-v2/plan.md  # The grand plan
.kiro/                   # Kiro spec workspace
.github/                 # CI workflows
netlify.toml             # Production deploy config (currently points at legacy)
```

## Deployment

- **Web prod**: Netlify auto-deploys `main` from `apps/legacy/`. Cut-over to `apps/web/` happens when v2 is feature-complete (see plan, Phase 9). Config: [`netlify.toml`](netlify.toml).

## v1 docs

[`apps/legacy/`](apps/legacy/) has its own `package.json`, configs, and scripts. The user-facing and developer-facing v1 docs in [`docs/`](docs/) describe the legacy app — they will be replaced as v2 ships.

