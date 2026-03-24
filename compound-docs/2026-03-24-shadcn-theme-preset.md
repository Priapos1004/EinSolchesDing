---
tags: [shadcn, theming, tailwind-v4, css-variables]
category: feature
---

# Applying shadcn/ui Theme Presets

**Date:** 2026-03-24

## Summary
Applied a shadcn/ui color theme preset (`b7BFcDklE`) using `bunx --bun shadcn@latest init --preset <id>`. This introduced a dual-layer CSS variable system (`:root`/`.dark` + `@theme inline`) replacing the previous hardcoded oklch values.

## Failed Approaches
- **Fetching preset via API**: Tried `themes.shadcn.com/api/themes/<id>` and `ui.shadcn.com/api/themes/<id>` — both 404. shadcn theme presets are not available via public REST API. **Never do**: try to reverse-engineer shadcn's theme URLs; use the CLI instead.
- **WebFetch on themes page**: The page is JS-rendered; WebFetch only gets the shell HTML, not the computed theme CSS.

## Key Decisions
- **Used `shadcn init --preset` CLI**: The only reliable way to apply a preset (rejected: manual CSS copy, API fetch).
- **Kept custom `--color-success` variable**: shadcn presets don't include a success color. Manually added `--success` to both `:root` and `.dark` and mapped it via `@theme`. Game UI depends on this color.
- **Removed stale `@theme` color block**: The init command didn't clean up pre-existing hardcoded color values in the first `@theme` block, causing conflicts with the new `@theme inline` block that references CSS vars. Manual cleanup was required.

## Gotchas & Learnings
- `shadcn init --preset` merges into `index.css` but does NOT remove pre-existing color definitions — you get duplicate/conflicting values
- The new shadcn Tailwind v4 setup uses two theme blocks: `@theme` for custom additions and `@theme inline` for the variable-reference layer
- Custom color tokens (like `success`) must be added in three places: `:root`, `.dark`, and `@theme` (or `@theme inline`)
- The preset also added `tw-animate-css`, `@fontsource-variable/inter`, and `shadcn/tailwind.css` imports

## Future Work
- Verify all components render correctly with new theme (primary color changed from amber to purple)
- Custom keyframe animations reference old hardcoded oklch values for `pulse-border` and `glow` — should be updated to use `var(--primary)` for theme consistency
