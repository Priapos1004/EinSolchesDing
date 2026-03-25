---
tags: [shadcn, dark-mode, css-animations, color-mix, theme-provider]
category: feature
---

# Theme Fixes & Dark Mode Implementation

**Date:** 2026-03-24 | **Ref:** [shadcn-theme-preset](2026-03-24-shadcn-theme-preset.md)

## Summary
Fixed theme tokens not being used in CSS animations (hardcoded yellow instead of primary), added full-screen pulse overlay, improved dialog spacing with DialogFooter, and implemented dark mode with a ThemeProvider following the shadcn/Vite guide.

## Failed Approaches
- **`oklch(from var(--primary) l c h / alpha)` for animation colors**: Relative color syntax has poor browser support (no Firefox <128). **Never do**: use relative color syntax in production CSS without checking caniuse. Used `color-mix(in oklch, var(--primary) N%, transparent)` instead — broad support and achieves the same result.

## Key Decisions
- **`color-mix()` over hardcoded oklch values**: Animations now auto-adapt to theme changes and dark mode without duplicating keyframes (rejected: separate keyframes per theme, relative color syntax).
- **Fixed overlay div for pulse border**: Content stays `max-w-lg` centered while the pulse animation spans the full viewport via a `pointer-events-none` fixed overlay (rejected: removing max-width from content).
- **Simple cycle toggle over dropdown**: ThemeToggle cycles light→dark→system with a single button instead of the shadcn-recommended DropdownMenu, avoiding an extra dependency install for a simple game app.
- **ThemeProvider not in App.tsx**: Placed in `main.tsx` wrapping everything, so the Toaster also respects theme context.

## Gotchas & Learnings
- shadcn's official ThemeProvider example has bugs: no `matchMedia` change listener (OS preference changes ignored), unsafe `localStorage` cast, dead context guard due to non-undefined default. Always review copy-paste patterns.
- `DialogFooter` is not included in shadcn's default dialog install — must be added manually to `dialog.tsx`.
- Sonner's `<Toaster theme="dark">` must be changed to `theme="system"` to respect dark mode; it doesn't read the `.dark` class automatically.
- The `@custom-variant dark (&:is(.dark *))` line in `index.css` (Tailwind v4) is what makes `dark:` utility classes work with the `.dark` class strategy — it was already present from the theme preset.

## Future Work
- Consider extracting a shared page layout component — AdminLogin, CreateGame, and JoinGame share identical structure (centered card + absolute-positioned ThemeToggle).
