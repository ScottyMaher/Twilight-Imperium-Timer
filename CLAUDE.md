# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 14 web app (TypeScript, React 18) that tracks player turn times for the board game Twilight Imperium. Single-page client-side app with a space-themed UI. Uses Bun as the package manager.

## Commands

- `bun dev` — start dev server
- `bun run build` — production build
- `bun run lint` — ESLint (extends next/core-web-vitals + next/typescript)
- No test framework is configured

## Architecture

### Three-Phase UI Flow

The main page (`app/page.tsx`) is a single `"use client"` component managing three phases:
1. **Configure** — select timer mode and adjust mode-specific settings
2. **Players** — enter player names and drag-to-reorder (Framer Motion)
3. **Running** — active timer with player cards and controls

All state lives in the main page component via `useState` hooks with props drilling (no context or state library).

### Pluggable Timer Mode System

Timer modes are defined in `lib/timerModes/` using the `TimerMode<TConfig>` generic interface (`types.ts`). Each mode self-registers via `registerTimerMode()` in `registry.ts`.

A timer mode must implement:
- `ConfigComponent` — UI for mode-specific settings
- `initializePlayer` — set up mode-specific player fields
- `onTick` — called every second for the current player
- `onEndTurn` — called when a turn ends
- `PlayerCardContent` — renders player card content

Current modes in `lib/timerModes/modes/`:
- **countUp** — simple elapsed time counter
- **actionTimer** — TI4-specific with action time + reserve time banking

To add a new mode: create a file in `modes/`, implement `TimerMode`, call `registerTimerMode()`, and import it in `lib/timerModes/index.ts`.

### Key Interactions

- **Spacebar** ends the current turn (only while running and not paused)
- **Tap/click** anywhere (not on a button) toggles pause/resume
- Pause shows a modal overlay with a play icon

### Persistence

`lib/localStorage.ts` handles saving/loading players, timer state, and mode config. Timer state auto-saves every 60 seconds while running and restores on page reload.

### UI Components

- `components/ui/` contains shadcn/ui components (New York style, Radix UI primitives)
- `components/StarField.tsx` + `StarField.module.css` — animated twinkling background
- Path alias: `@/*` maps to the project root

### Styling

Tailwind CSS with HSL CSS variables for theming (dark mode default). Responsive breakpoints use `md:` prefix. Framer Motion handles layout animations and transitions.
