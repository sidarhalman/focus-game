# Focus Game — Project Memory

## What is this?
A premium mobile-first cognitive training web app (brain training).
~40 mini-games across 8 cognitive domains. Inspired by Peak / Elevate category.
Optimized for iPhone 16 (393 × 852 pt viewport), works in portrait mobile Safari.

## Tech Stack
- **Framework:** React 18 + TypeScript (strict)
- **Build:** Vite
- **Styling:** Tailwind CSS v3
- **Animation:** Framer Motion
- **State:** Zustand
- **Persistence:** localStorage (local-first, cloud sync later)
- **PWA:** Vite PWA plugin

## Folder Structure
```
src/
  engine/          # Reusable game engine (GameShell, TimerBar, ScoreHUD…)
  games/           # One folder per mini-game
  screens/         # App screens (Home, Workout, Results, Profile…)
  store/           # Zustand stores (user, session, progress)
  design/          # Design tokens, theme
  hooks/           # Shared React hooks
  utils/           # Pure helpers
  content/         # Game metadata, copy, difficulty configs
public/
  icons/           # PWA icons
```

## Coding Rules
- **No `any` type** — use `unknown` + type guards if needed
- **No `console.log`** left in committed code (use logger util)
- **No bare string literals** for copy — use content/ config files
- **Touch targets ≥ 44×44 pt** — mobile-first always
- **Every game must implement `GameDefinition` interface** from engine/
- **Tests required** before marking a game as complete
- Components: functional only, no class components
- Prefer named exports over default exports (except page-level routes)
- Keep components under 200 lines — split if larger
- Animations must respect `prefers-reduced-motion`

## Architectural Decisions
- **Local-first:** all state in localStorage, no backend in v1
- **Game engine pattern:** every game is a plug-in to GameShell, not standalone
- **Difficulty:** DifficultyManager handles level, not individual games
- **Scoring:** normalized 0–1000 per game, then aggregated to skill score
- **Session:** 3–5 min daily workout = 4–5 games selected by WorkoutPlanner

## MVP Games (Phase 1 — 8 games)
1. Pattern Recall (Memory)
2. Sequence Tap (Memory / Attention)
3. Odd-One-Out (Attention)
4. Color-Rule Switch (Flexibility)
5. Quick Compare (Math / Processing Speed)
6. Number Trail (Processing Speed)
7. Word Sort (Language)
8. Precision Tap (Coordination)

## Design Tokens (quick ref)
- Primary: `#6C63FF` (purple)
- Success: `#22C55E`
- Error: `#EF4444`
- BG: `#0F0F1A` (dark)
- Surface: `#1A1A2E`
- Font: Inter (system fallback)
- Border radius base: 16px

## Do NOT
- Add features not in the current phase spec
- Use `any` type
- Leave `console.log` in code
- Create components wider than 393px as base
- Clone existing app mechanics 1-to-1 (originality matters)
- Skip the `GameDefinition` interface for new games

## Phase Roadmap
- **Phase 1 (MVP):** 8 games, daily workout, streaks, local save, results
- **Phase 2:** 20 games, skill map, achievements, adaptive difficulty
- **Phase 3:** 40 games, cloud sync, premium tier
