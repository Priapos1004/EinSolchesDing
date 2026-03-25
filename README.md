# EinSolchesDing

A multiplayer card game web app. Players take turns playing keyword cards, and opponents must name "ein solches Ding" (such a thing) matching the keyword. Supports German and English.

## Prerequisites

- [Bun](https://bun.sh/) (runtime & package manager)
- [Docker](https://www.docker.com/) (for containerized setup) **or** a local Redis instance

## Quick Start (Docker)

The easiest way to run the full stack:

1. **Clone the repository**

   ```shell
   git clone https://github.com/yourusername/EinSolchesDing.git
   cd EinSolchesDing
   ```

2. **Configure environment variables**

   ```shell
   cp .env.example .env
   ```

   Edit `.env` and set secure values:

   ```
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=changeme
   JWT_SECRET=your-secret-key-change-this
   ```

3. **Start all services**

   ```shell
   docker compose up --build
   ```

4. **Open the app** at [http://localhost](http://localhost)

This starts three containers: Redis, the backend API (port 8000), and the frontend served via nginx (port 80).

## Local Development (without Docker)

1. **Install dependencies**

   ```shell
   bun install
   ```

2. **Start Redis** (e.g. via Docker or a local installation)

   ```shell
   docker run -d --name redis -p 6379:6379 redis:7-alpine
   ```

3. **Configure environment variables**

   ```shell
   cp .env.example .env
   ```

4. **Run the backend**

   ```shell
   bun run packages/backend/src/index.ts
   ```

5. **Run the frontend dev server** (in a second terminal)

   ```shell
   cd packages/frontend && bun run dev
   ```

   The frontend dev server proxies `/api` requests to the backend at `localhost:8000`.

6. **Open the app** at [http://localhost:5173](http://localhost:5173)

## How to Play

1. Log in as **admin** (credentials from `.env`) and create a new game.
2. Share the **invite link** with players.
3. Players join via the link, enter a display name, and play in real time.

## Running Tests

```shell
bun test packages/backend/tests/game-logic.test.ts
```

## Deployment (Coolify)

A `docker-compose.coolify.yml` is included for deploying with [Coolify](https://coolify.io/). Set the environment variables (`ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET`) in the Coolify dashboard.

## Customizing Cards

Game cards are defined in `packages/backend/src/data/EinSolchesDing_de_en.csv` with columns: `keyword_de`, `info_de`, `keyword_en`, `info_en`.

## Project Structure

```
packages/
  shared/    — TypeScript interfaces shared between backend and frontend
  backend/   — Bun HTTP server with REST + SSE endpoints
  frontend/  — React SPA (Vite + Tailwind CSS + Zustand)
```

## Tech Stack

Bun, TypeScript, React, Vite, Tailwind CSS, Zustand, Redis, Docker, SSE (Server-Sent Events)
