# SimC Rotation Helper

> **Live App:** [https://simc-rotation-helper.vercel.app/](https://simc-rotation-helper.vercel.app/)

AI-powered World of Warcraft rotation guides generated directly from [SimulationCraft](https://github.com/simulationcraft/simc) Action Priority Lists (APLs). Each guide is built by feeding the raw `.simc` APL file into Claude, producing a structured, human-readable rotation guide that stays automatically synchronized with the SimC `midnight` branch.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Monorepo Structure](#monorepo-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Local Development](#local-development)
  - [Docker](#docker)
- [Backend](#backend)
  - [API Endpoints](#api-endpoints)
  - [Database Schema](#database-schema)
  - [Services](#services)
  - [Guide Generation Pipeline](#guide-generation-pipeline)
  - [Admin Operations](#admin-operations)
  - [Cron Job](#cron-job)
  - [Scripts](#scripts)
- [Frontend](#frontend)
  - [Pages](#pages)
  - [Components](#components)
  - [Data Fetching](#data-fetching)
- [Deployment](#deployment)
  - [Backend - Railway](#backend--railway)
  - [Frontend - Vercel](#frontend--vercel)
- [Adding / Modifying Specs](#adding--modifying-specs)
- [Prompt Engineering](#prompt-engineering)

---

## Overview

SimC Rotation Helper solves a common problem for WoW players: SimulationCraft APLs are the authoritative source for optimal rotation logic, but they are written in a domain-specific scripting language that is difficult to read and understand. This app translates those APLs into clear, prioritized rotation guides using Claude.

Every spec across all 13 classes is tracked. When SimC's APL changes (detected via commit SHA), the guide is automatically regenerated. Historical versions are preserved so you can see how a rotation evolved over patches.

---

## Features

- **44 WoW specs** across all 13 classes (Death Knight, Demon Hunter, Druid, Evoker, Hunter, Mage, Monk, Paladin, Priest, Rogue, Shaman, Warlock, Warrior)
- **AI-generated guides** from live SimC APLs using `claude-sonnet-4-6`
- **Auto-sync** - daily cron job detects APL changes via GitHub commit SHA and regenerates only what changed
- **Guide history** - every generated version is archived with its APL commit SHA, generation date, and model used
- **Complexity rankings** - specs ranked by APL action count for single-target and AoE
- **Responsive UI** with class-colored sidebar, role badges, and priority list rendering

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Frontend (Vercel)                    │
│  React 19 + Vite + TailwindCSS + TanStack Query           │
└───────────────────────────┬──────────────────────────────┘
                            │ HTTPS / REST
┌───────────────────────────▼──────────────────────────────┐
│                    Backend (Railway)                      │
│  Express + better-sqlite3 + node-cron                     │
│                                                           │
│  ┌─────────────┐   ┌──────────────┐   ┌───────────────┐  │
│  │ GitHub API  │→  │  LLM Service │→  │   SQLite DB   │  │
│  │ (SimC APL)  │   │  (Anthropic) │   │  guides table │  │
│  └─────────────┘   └──────────────┘   └───────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## Monorepo Structure

```
simc-rotation-helper/
├── packages/
│   ├── shared/
│   │   └── src/types.ts              # Shared TypeScript interfaces
│   ├── backend/
│   │   ├── src/
│   │   │   ├── index.ts              # Express entry point
│   │   │   ├── config.ts             # Environment variable config
│   │   │   ├── data/
│   │   │   │   └── specs.ts          # All 44 WoW specs + class metadata
│   │   │   ├── db/
│   │   │   │   └── client.ts         # better-sqlite3 singleton + typed helpers
│   │   │   ├── services/
│   │   │   │   ├── githubService.ts  # Fetch APL from SimC GitHub repo
│   │   │   │   ├── llmService.ts     # Generate guide via Anthropic API
│   │   │   │   ├── guideService.ts   # Orchestration: SHA check → fetch → generate → store
│   │   │   │   └── cronService.ts    # Daily cron scheduling
│   │   │   ├── prompts/
│   │   │   │   └── guidePrompt.ts    # System + user prompt templates
│   │   │   ├── routes/
│   │   │   │   ├── specs.ts          # GET /api/specs
│   │   │   │   ├── guides.ts         # GET /api/guides/:specName (+ history)
│   │   │   │   ├── admin.ts          # POST /api/admin/refresh (auth required)
│   │   │   │   └── rankings.ts       # GET /api/rankings
│   │   │   └── scripts/
│   │   │       └── seed.ts           # One-time full DB population
│   │   └── data/
│   │       └── db.sqlite             # SQLite database (gitignored)
│   └── frontend/
│       ├── src/
│       │   ├── App.tsx               # React Router + QueryClient root
│       │   ├── api/
│       │   │   └── client.ts         # Axios API wrapper
│       │   ├── hooks/
│       │   │   ├── useGuide.ts
│       │   │   ├── useSpecs.ts
│       │   │   ├── useRankings.ts
│       │   │   └── useAllGuides.ts
│       │   ├── pages/
│       │   │   ├── HomePage.tsx
│       │   │   ├── SpecPage.tsx
│       │   │   ├── RankingsPage.tsx
│       │   │   ├── HistoryPage.tsx
│       │   │   └── NotFoundPage.tsx
│       │   └── components/
│       │       ├── layout/           # Header, Sidebar, Layout
│       │       └── guide/            # GuideSection, PriorityList, GuideMeta, GuideSkeleton
│       └── public/
├── docker-compose.yml
├── .env.example
└── package.json                      # Monorepo root (npm workspaces)
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **npm** 10+ (workspaces support required)
- **Anthropic API key** - [console.anthropic.com](https://console.anthropic.com)
- *(Optional)* GitHub personal access token for higher API rate limits

### Environment Variables

Copy `.env.example` to `.env` in the project root and fill in the required values:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | - | Anthropic API key for Claude |
| `ADMIN_SECRET` | Yes | - | Bearer token for admin endpoints |
| `PORT` | No | `3001` | Backend HTTP port |
| `DB_PATH` | No | `./data/db.sqlite` | Path to SQLite database file |
| `ANTHROPIC_MODEL` | No | `claude-sonnet-4-6` | Claude model to use |
| `PROMPT_VERSION` | No | `1.0.0` | Logged alongside generated guides |
| `GITHUB_TOKEN` | No | - | GitHub PAT (avoids 60 req/hr rate limit) |
| `CRON_SCHEDULE` | No | `0 3 * * *` | node-cron schedule (default: 3 AM UTC daily) |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origins (set to your frontend URL in production) |
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

> **Seeding cost:** Generating guides for all 44 specs makes one LLM call per spec. Estimated cost is $1–5 depending on APL length and model pricing. You can also generate guides for individual specs via the admin API instead of seeding all at once.

### Docker

A `docker-compose.yml` is provided to run the full stack locally:

```bash
docker-compose up
```

- Backend available at `http://localhost:3001`
- Frontend available at `http://localhost:5173`
- Database persisted in a Docker volume at `/app/data`

---

## Backend

The backend is a Node.js/Express application using ESM (`"type": "module"`), developed with `tsx` and built with `tsc`.

### API Endpoints

#### Public

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/specs` | All classes and specs with `hasGuide` flag |
| `GET` | `/api/guides` | All guides (metadata only, no full content) |
| `GET` | `/api/guides/:specName` | Current guide for a spec (full content) |
| `GET` | `/api/guides/:specName/history` | List of all historical guides for a spec |
| `GET` | `/api/guides/:specName/history/:id` | A specific historical guide by ID |
| `GET` | `/api/rankings` | Specs ranked by APL action count |

#### Admin (Bearer token required)

Set the `Authorization: Bearer <ADMIN_SECRET>` header on all admin requests.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/admin/refresh` | Trigger guide generation |
| `DELETE` | `/api/admin/guides/history` | Delete old (non-current) guide versions |

**`POST /api/admin/refresh` - Request body:**

```jsonc
// Refresh a single spec
{ "spec": "warrior_arms" }

// Refresh all specs in a class
{ "class": "warrior" }

// Refresh multiple specific specs
{ "spec": ["warrior_arms", "warrior_fury"] }

// Refresh all 44 specs
{ "spec": "all" }

// Force regeneration even if APL SHA hasn't changed
{ "spec": "warrior_arms", "force": true }
```

**`DELETE /api/admin/guides/history` - Request body:**

```jsonc
// Delete all non-current guides across all specs
{}

// Delete non-current guides for one spec only
{ "spec": "warrior_arms" }
```

Rate limiting: 120 requests/min (general), 10 requests/min (admin endpoints).

---

### Database Schema

SQLite database managed by `better-sqlite3` (synchronous API - no `await` needed on DB calls).

#### `guides` table

| Column | Type | Description |
|---|---|---|
| `id` | TEXT (UUID) | Primary key |
| `spec_name` | TEXT | e.g. `warrior_arms` |
| `class_name` | TEXT | e.g. `warrior` |
| `apl_content` | TEXT | Raw `.simc` file content used for generation |
| `guide_content` | TEXT | JSON-serialized `GuideContent` object |
| `apl_commit_sha` | TEXT | GitHub commit SHA of the APL at generation time |
| `apl_commit_date` | TEXT | ISO timestamp of that commit |
| `generated_at` | TEXT | ISO timestamp of guide generation |
| `is_current` | INTEGER | `1` = current guide, `0` = historical |
| `model_used` | TEXT | e.g. `claude-sonnet-4-6` |
| `prompt_version` | TEXT | Prompt version string for traceability |

#### `apl_snapshots` table

Stores raw APL content snapshots keyed by spec + commit SHA for reference without regenerating.

---

### Services

#### `githubService.ts`

Fetches APL data from the `simulationcraft/simc` GitHub repository.

- **Branch:** `midnight`
- **Path:** `ActionPriorityLists/default/<class>_<spec>.simc`
- `getLatestCommitInfo(specName)` - Returns `{ sha, date }` for the latest commit touching a spec's APL file
- `fetchAplContent(specName)` - Returns raw `.simc` file content
- `listAplFiles()` - Lists all `.simc` files available in the directory

APL filenames follow the `class_spec` convention (e.g., `warrior_arms.simc`). Some specs define a custom `aplName` in `specs.ts` to handle exceptions.

#### `llmService.ts`

Calls the Anthropic Claude API to convert raw APL content into a structured guide.

- Uses `claude-sonnet-4-6` by default (configurable via `ANTHROPIC_MODEL`)
- `max_tokens: 16000` to handle large, complex APLs
- Strips markdown code fences from output if Claude wraps the JSON
- Validates the returned JSON has a `sections` array before storing
- Logs model, token usage, and elapsed generation time

#### `guideService.ts`

Orchestration layer that ties GitHub, LLM, and database together.

- `checkAndUpdateSpec(specName, force?)` - Checks if the APL SHA has changed since the last stored guide. If changed (or `force: true`), fetches the new APL, generates a guide, marks the old guide as non-current, and stores the new one. Returns `'updated'`, `'skipped'`, or `'error'`.
- `checkAndUpdateClass(className, force?)` - Runs `checkAndUpdateSpec` in parallel for all specs in a class
- `checkAndUpdateMany(specNames[], force?)` - Parallel update for an explicit list of specs
- `checkAndUpdateAll(delayMs, force?)` - Sequential update for all 44 specs with an optional delay between calls (used by cron to avoid hitting rate limits)

#### `cronService.ts`

Wraps `checkAndUpdateAll()` in a `node-cron` schedule. Default: `0 3 * * *` (3 AM UTC daily). The schedule is configurable via the `CRON_SCHEDULE` environment variable.

---

### Guide Generation Pipeline

```
checkAndUpdateSpec("warrior_arms")
  │
  ├─ githubService.getLatestCommitInfo("warrior_arms")
  │    └─ GET /repos/simulationcraft/simc/commits?path=ActionPriorityLists/default/warrior_arms.simc
  │
  ├─ Compare SHA to db.getCurrentGuide("warrior_arms").apl_commit_sha
  │    └─ If identical (and not forced) → return 'skipped'
  │
  ├─ githubService.fetchAplContent("warrior_arms")
  │    └─ GET raw warrior_arms.simc content
  │
  ├─ llmService.generateGuide("Arms Warrior", "warrior", aplContent)
  │    └─ Anthropic API → JSON GuideContent
  │
  ├─ db.insertGuide({ spec_name, apl_content, guide_content, apl_commit_sha, ... })
  │    └─ New row with is_current = 1
  │
  └─ db.markOldGuidesNotCurrent("warrior_arms")
       └─ Previous rows set is_current = 0
```

---

### Admin Operations

**Trigger a refresh via curl:**

```bash
# Refresh a single spec
curl -X POST http://localhost:3001/api/admin/refresh \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"spec": "warrior_arms"}'

# Force-refresh all warrior specs
curl -X POST http://localhost:3001/api/admin/refresh \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"class": "warrior", "force": true}'

# Delete old guide history for all specs
curl -X DELETE http://localhost:3001/api/admin/guides/history \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

---

### Cron Job

The backend starts the cron job automatically on launch. It runs `checkAndUpdateAll()` on schedule, iterating through all 44 specs sequentially with a small delay between each to stay within GitHub and Anthropic API rate limits. Only specs whose APL has changed since the last stored guide will be regenerated.

---

### Scripts

**Seed the database (first-time setup):**

```bash
npm run seed --workspace packages/backend
```

This interactively asks whether to force-regenerate all guides and then runs `checkAndUpdateAll()` for all 44 specs with a 2-second delay between each call.

**Generate a single spec (ad-hoc):**

```bash
# Via the admin API (recommended)
curl -X POST http://localhost:3001/api/admin/refresh \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"spec": "warrior_arms", "force": true}'
```

---

## Frontend

The frontend is a React 19 + Vite application using TailwindCSS 3, React Router 7, and TanStack Query v5.

### Pages

#### Home (`/`)

Displays a hero section with live stats (total classes, specs, and guides ready), a class selector grid, and a spec list that expands on class click. Each spec shows its role badge (DPS/Tank/Healer) and links to its guide page if a guide exists.

#### Spec Guide (`/guide/:specName`)

The main guide page. Displays:
- **GuideMeta** - APL commit SHA (linked to GitHub), commit date, generation date, model used
- **GuideSection** per section - Overview, Talent Notes, Pre-Combat, Single Target, AoE, Items & Racials
- **Guide history panel** - Toggle to view all historical versions for this spec, each with a short SHA, date, and "Current" badge

#### Rankings (`/rankings`)

Two-column table ranking all specs by APL complexity (action count) for single-target and AoE separately. Rows are class-colored and link to the spec's guide page.

#### History (`/history`)

A full table of all generated guides (current and historical) with:
- Search by spec name, class name, or commit SHA
- Filter by class (chip buttons)
- Toggle to show only current guides
- Sortable columns: class, spec, generated date, APL commit date
- Status badges: **Current** / **Historical**

#### Not Found (`*`)

404 page.

---

### Components

#### Layout

- **`Layout.tsx`** - Wraps all pages with `Header` + `Sidebar` + scrollable main area. Manages sidebar open/close state and mobile overlay backdrop.
- **`Header.tsx`** - Sticky header with hamburger menu (mobile), app logo, subtitle, and "Powered by SimulationCraft + Claude AI" badge with a live indicator.
- **`Sidebar.tsx`** - Collapsible class groups with spec links. Top-level links to Rankings and History. Each class uses its official Blizzard color. Specs without guides are shown as disabled. Role icons: ⚔ DPS, 🛡 Tank, ✚ Healer.

#### Guide

- **`GuideSection.tsx`** - Renders one section of a guide. Color-coded left border by section type (blue=overview, purple=talent, green=precombat, orange=single-target, red=AoE). Renders prose content, ordered steps, and a `PriorityList`.
- **`PriorityList.tsx`** - Renders a prioritized list of abilities. Each item shows a circular order badge, bold ability name, italic condition, and optional note text.
- **`GuideMeta.tsx`** - Shows guide metadata: short APL commit SHA (linked to the exact file at that commit on GitHub), commit date, generation timestamp, and model name.
- **`GuideSkeleton.tsx`** - Animated loading skeleton with placeholder shapes matching the guide layout.
- **`InlineMarkdown.tsx`** - Lightweight inline markdown renderer for ability names and condition text within guide content.

---

### Data Fetching

All API calls go through `packages/frontend/src/api/client.ts` (Axios). The base URL defaults to `/api` for same-origin requests and is overridden by `VITE_API_BASE_URL` in production.

React Query hooks in `src/hooks/`:

| Hook | Endpoint | Stale Time |
|---|---|---|
| `useSpecs()` | `GET /api/specs` | 5 min |
| `useGuide(specName)` | `GET /api/guides/:specName` | 10 min |
| `useGuideHistory(specName)` | `GET /api/guides/:specName/history` | 10 min |
| `useAllGuides()` | `GET /api/guides` | 5 min |
| `useRankings()` | `GET /api/rankings` | 10 min |

---

## Deployment

### Backend - Railway

1. Create a new Railway project and connect the GitHub repo
2. Set the root directory to `packages/backend`
3. Set the build command: `npm run build`
4. Set the start command: `node dist/index.js`
5. Add a persistent volume mounted at `/app/data` (stores `db.sqlite`)
6. Set environment variables: `ANTHROPIC_API_KEY`, `ADMIN_SECRET`, `DB_PATH=/app/data/db.sqlite`, `CORS_ORIGIN=https://your-frontend.vercel.app`

### Frontend - Vercel

1. Connect the GitHub repo to Vercel
2. Set the root directory to `packages/frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set environment variable: `VITE_API_BASE_URL=https://your-backend.railway.app`

After deploying both services, seed the database using the admin API:

```bash
curl -X POST https://your-backend.railway.app/api/admin/refresh \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"spec": "all"}'
```

---

## Adding / Modifying Specs

All spec definitions live in [packages/backend/src/data/specs.ts](packages/backend/src/data/specs.ts). Each entry in the `CLASSES` array defines:

```ts
{
  name: 'warrior',
  label: 'Warrior',
  color: '#C69B3A',       // Official Blizzard class color (hex)
  specs: [
    {
      name: 'warrior_arms',
      label: 'Arms',
      role: 'dps',
      // aplName: 'arms_warrior',  // Optional: override SimC filename if non-standard
    },
    // ...
  ]
}
```

The `aplName` field is only needed if the SimC `.simc` filename does not follow the default `<class>_<spec>.simc` pattern.

After adding a new spec, trigger its first guide generation:

```bash
curl -X POST http://localhost:3001/api/admin/refresh \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"spec": "new_spec_name"}'
```

---

## Prompt Engineering

The LLM prompt lives in [packages/backend/src/prompts/guidePrompt.ts](packages/backend/src/prompts/guidePrompt.ts) and consists of two parts:

**System prompt** - Establishes Claude as a WoW theorycrafting and SimC expert. Provides:
- Rules for translating SimC `snake_case` action names to `Title Case` ability names
- Condition translation reference (e.g., `buff.X.up` → "when X buff is active", `cooldown.X.ready` → "when X is off cooldown")
- Instruction to follow the actual APL priority order faithfully
- Requirement to output only valid JSON, no markdown

**User prompt** - Built by `buildUserPrompt(specLabel, className, aplContent)`. Includes:
- The spec and class name
- A condensed SimC APL syntax reference
- The full APL content to translate
- Required output JSON schema

**Required output sections:**

| Section ID | Description |
|---|---|
| `overview` | Short prose overview of the spec's playstyle |
| `talent_notes` | Notes on talent choices that affect the rotation |
| `precombat` | Pre-pull steps as an ordered list |
| `single_target` | ST priority list following APL order |
| `aoe` | AoE priority list following APL order |
| `items_and_racials` | On-use items, trinkets, and racial abilities |

The `PROMPT_VERSION` environment variable is stored alongside each generated guide for traceability when the prompt is updated.
