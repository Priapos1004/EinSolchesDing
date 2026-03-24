# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EinSolchesDing is a multiplayer card game web app. Players take turns playing keyword cards, and opponents must name "ein solches Ding" (such a thing) matching the keyword. An admin creates a game and shares an invite link; players join via the link and play in real time. German and English language support.

## Tech Stack

- **Runtime & Package Manager:** Bun (monorepo with workspaces)
- **Backend:** Bun.serve() HTTP server, TypeScript, SSE for real-time, Bun's built-in Redis client
- **Frontend:** React + TypeScript + Vite, Zustand state management, Tailwind CSS
- **Database:** Redis (ephemeral game state, 24h TTL)
- **Deploy:** Docker Compose (backend, frontend/nginx, redis)

## Commands

```shell
# Install all dependencies
bun install

# Run backend (requires Redis running)
bun run packages/backend/src/index.ts

# Run frontend dev server (proxies /api to localhost:8000)
cd packages/frontend && bun run dev

# Run game logic tests
bun test packages/backend/tests/game-logic.test.ts

# Build frontend
bun run build

# Docker (full stack)
docker compose up --build
```

## Architecture

### Monorepo Structure (`packages/`)

- **`shared/`** — TypeScript interfaces shared between backend and frontend (`@esd/shared`)
- **`backend/`** — Bun HTTP server with REST + SSE endpoints
- **`frontend/`** — React SPA served by nginx in production

### Backend (`packages/backend/src/`)

- `index.ts` — Bun.serve() entry point, request routing, CORS
- `game-logic.ts` — Pure game logic functions (no side effects, fully testable): `createGameState()`, `playCard()`, `drawTwoCards()`, `checkCardPlayable()`
- `game-manager.ts` — Redis CRUD layer using Bun's built-in `redis` client. All keys prefixed `esd:{game_id}:` with 24h TTL
- `auth.ts` — JWT (jose library) for admin and session tokens, invite token generation
- `card-loader.ts` — Parses CSV at startup with stdlib (no pandas)
- `sse.ts` — SSE connection manager, per-player broadcast with tailored game state
- `config.ts` — Reads `.env` (ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET, REDIS_URL)
- `routes/admin.ts` — POST `/api/admin/login`, POST `/api/admin/games`
- `routes/game.ts` — Join game, play card, vote start/cast
- `routes/events.ts` — GET `/api/games/:id/events` (SSE stream)

### Frontend (`packages/frontend/src/`)

- `api/http.ts` — Fetch wrappers for all REST endpoints
- `api/sse.ts` — EventSource manager with auto-reconnect
- `store/gameStore.ts` — Zustand store, handles all SSE event types
- `pages/` — AdminLogin, CreateGame, JoinGame, Game
- `components/` — PlayerTabs, CardList, Card, CardInfoModal, ActionBar, VoteModal, WinnerModal

### Communication Pattern

- **Server → Client:** SSE (Server-Sent Events) for real-time game state updates
- **Client → Server:** REST POST calls for actions (play card, vote, join)
- Each player only sees their own hand; opponent card counts are visible but not keywords

### Auth Model

- **Admin:** Credentials in `.env`, JWT on login. Used to create games.
- **Players:** No account needed. Join via invite link with token, enter display name, get session JWT.

### Game Data

94 bilingual cards in `packages/backend/src/data/EinSolchesDing_de_en.csv`. Columns: `keyword_de`, `info_de`, `keyword_en`, `info_en`. Loaded once at startup.

## Legacy Code

The original Pygame version is still in `backend/` and `frontend/` (root level). The web rewrite lives in `packages/`.
