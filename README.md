# SimC Rotation Helper

> **Live App:** [https://simc-rotation-helper.vercel.app/](https://simc-rotation-helper.vercel.app/)

AI-powered World of Warcraft rotation guides generated directly from [SimulationCraft](https://github.com/simulationcraft/simc) Action Priority Lists (APLs). Each guide is built by feeding the raw `.simc` APL file into Claude, producing a structured, human-readable rotation guide that stays automatically synchronized with the SimC `midnight` branch.

## Overview

SimC APLs are the authoritative source for optimal rotation logic, but they are written in a domain-specific scripting language that is difficult to read. This app translates those APLs into clear, prioritized rotation guides using Claude.

Every spec across all 13 classes is tracked. When SimC's APL changes (detected via commit SHA), the guide is automatically regenerated. Historical versions are preserved so you can see how a rotation evolved over patches.

## Features

- **44 WoW specs** across all 13 classes
- **AI-generated guides** from live SimC APLs using `claude-sonnet-4-6`
- **Auto-sync** - daily cron detects APL changes via GitHub commit SHA and regenerates only what changed
- **Guide history** - every generated version is archived with its APL commit SHA, generation date, and model used
- **Complexity rankings** -specs ranked by APL action count for single-target and AoE
- **Responsive UI** with class-colored sidebar, role badges, and priority list rendering

## Architecture

![Architecture](docs/architecture.svg)

## Getting Started

### Prerequisites

- **Node.js** 20+
- **npm** 10+
- **Anthropic API key** - [console.anthropic.com](https://console.anthropic.com)
- *(Optional)* GitHub personal access token for higher API rate limits

### Environment Variables

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | -| Anthropic API key for Claude |
| `ADMIN_SECRET` | Yes | -| Bearer token for admin endpoints |
| `PORT` | No | `3001` | Backend HTTP port |
| `DB_PATH` | No | `./data/db.sqlite` | Path to SQLite database file |
| `ANTHROPIC_MODEL` | No | `claude-sonnet-4-6` | Claude model to use |
| `PROMPT_VERSION` | No | `1.0.0` | Logged alongside generated guides |
| `GITHUB_TOKEN` | No | -| GitHub PAT (avoids 60 req/hr rate limit) |
| `CRON_SCHEDULE` | No | `0 3 * * *` | Cron schedule (default: 3 AM UTC daily) |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origins |
| `VITE_API_BASE_URL` | Frontend | `/api` | Full backend URL for Vercel deployment |

### Local Development

```bash
# 1. Install all workspace dependencies
npm install

# 2. Start the backend (http://localhost:3001)
npm run dev:backend

# 3. Start the frontend (http://localhost:5173)
npm run dev:frontend

# 4. (First run) Seed the database with all 44 specs
npm run seed --workspace packages/backend
```

> **Seeding cost:** Generating guides for all 44 specs makes one LLM call per spec. Estimated cost is $1–5 depending on APL length and model pricing.

### Docker Deployment

```bash
docker-compose up
```

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`
- Database persisted in a Docker volume at `/app/data`

## API Endpoints

### Public

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/specs` | All classes and specs with `hasGuide` flag |
| `GET` | `/api/guides` | All guides (metadata only) |
| `GET` | `/api/guides/:specName` | Current guide for a spec |
| `GET` | `/api/guides/:specName/history` | Historical guide list |
| `GET` | `/api/guides/:specName/history/:id` | A specific historical guide |
| `GET` | `/api/rankings` | Specs ranked by APL action count |

### Admin (Bearer token required)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/admin/refresh` | Trigger guide generation |
| `DELETE` | `/api/admin/guides/history` | Delete old (non-current) guide versions |

**`POST /api/admin/refresh` body:**

```jsonc
{ "spec": "warrior_arms" }           // Single spec
{ "class": "warrior" }               // All specs in a class
{ "spec": ["warrior_arms", "warrior_fury"] } // Multiple specs
{ "spec": "all" }                     // All 44 specs
{ "spec": "warrior_arms", "force": true }    // Skip SHA check
```

**`DELETE /api/admin/guides/history` body:**

```jsonc
{}                          // All specs
{ "spec": "warrior_arms" }  // One spec only
```

Rate limiting: 120 req/min (general), 10 req/min (admin).

## Adding / Modifying Specs

All spec definitions live in [packages/backend/src/data/specs.ts](packages/backend/src/data/specs.ts). Each entry defines a class with its specs, role, and Blizzard class color. An optional `aplName` field overrides the default `<class>_<spec>.simc` filename if the SimC file doesn't follow that convention.

After adding a new spec, trigger its first guide generation via the admin API.

## Prompt Engineering

The LLM prompt lives in [packages/backend/src/prompts/guidePrompt.ts](packages/backend/src/prompts/guidePrompt.ts). It instructs Claude to act as a WoW theorycrafting expert, translate SimC condition syntax into plain English, follow APL priority order faithfully, and output structured JSON with these sections: `overview`, `talent_notes`, `precombat`, `single_target`, `aoe`, `items_and_racials`.

The `PROMPT_VERSION` env var is stored alongside each guide for traceability when the prompt is updated.
