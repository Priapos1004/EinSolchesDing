---
tags: [coolify, docker, gitignore, vite, deployment, tailwind]
category: bugfix
---

# Coolify Docker Build: Cryptic Vite "undefined" Error

**Date:** 2026-03-24 | **Commits:** 99d1eff..7314a63

## Summary
Frontend Docker build on Coolify failed with `error during build: undefined` — a completely opaque Vite error. Root cause was `.gitignore` excluding `packages/frontend/src/lib/` (containing `utils.ts` and `confetti.ts`) because a Python-template `lib/` rule matched all nested `lib/` directories. A secondary change switched from `@tailwindcss/postcss` to `@tailwindcss/vite`.

## Failed Approaches
- **Assuming it was a Tailwind/native binary issue**: Switched `@tailwindcss/postcss` → `@tailwindcss/vite`. This was a reasonable guess but not the root cause. The change is still beneficial (recommended approach for Vite + Tailwind v4) but didn't fix the deploy.
- **Checking Bun version**: `oven/bun:1` was already pulling latest (1.3.11). Never do: chase version bumps when the error is `undefined` — get the real error first.
- **Building locally in Docker to reproduce**: Built fine locally because the untracked files existed on disk. Never do: assume local Docker build = CI/CD Docker build when files might differ from git.

## Key Decisions
- **Added `node -e "import('vite')..."` debug build step** to get the real error from Vite (rejected: `--debug` flag, which doesn't surface plugin errors). This revealed the actual `ENOENT` for `src/lib/utils`.
- **Fixed `.gitignore` with `/lib/` instead of `lib/`**: Prefix `/` anchors the pattern to root only (rejected: removing `lib/` entirely, which could expose legacy Python dirs).

## Gotchas & Learnings
- Vite swallows plugin errors as `undefined` when the error object lacks a `message` property. Wrapping `vite.build()` in a `.catch(e => console.error(e))` reveals the full object including `path`, `syscall`, and `pluginCode`.
- Python `.gitignore` templates include `lib/` which is a **recursive** match. Any `src/lib/` directory in a JS/TS project will be silently ignored. Always audit `.gitignore` after scaffolding from templates.
- Local builds can mask git-tracking issues: files exist on disk but aren't committed, so Docker (which clones from git) fails while local builds succeed.
- Module count difference in build logs (1762 vs 1827) was a clue that something was missing, but easy to overlook.

## Future Work
- Consider committing `bun.lock` to ensure deterministic dependency resolution in CI/CD (currently gitignored by team preference).
