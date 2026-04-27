# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server on port 3000 (all interfaces)
npm run build     # Production build to dist/
npm run lint      # TypeScript type check only (tsc --noEmit, no test runner exists)
npm run clean     # Remove dist/
npm run preview   # Preview production build
```

No test suite exists — `lint` is the only automated correctness check.

## Architecture

This is a **React + TypeScript** card game (QuartetMerge). Game logic is fully client-side.

### Key files

| File | Role |
|---|---|
| `src/lib/gameLogic.ts` | Pure game logic — no UI imports. All card/merge/shape math lives here. |
| `src/App.tsx` | Monolithic game controller: all React state, event handlers, and the entire UI in one file. |
| `src/main.tsx` | React entry point only. |

### Game model (in `gameLogic.ts`)

- **Cards**: `{ id, color: Color, level: 1|2|3 }`. Four colors (red, blue, green, yellow), each mapped 1-to-1 to a tetromino shape (L, O, T, S).
- **Deck**: 80 cards (20 per color, all level 1), shuffled with Fisher-Yates via `getInitialDeck()`.
- **Board**: 3×3 grid; positions encoded as `[row, col]` indices.
- **Merge detection** (`checkMerge`): finds 4+ same-color/same-level cards on the board that match one of 8 orientations of their color's tetromino. Level 1 merges produce a level 2 card (re-enters deck); level 2 merges produce a level 3 card (increments score). Cascades recursively.
- **Win**: all 4 color scores ≥ 1 (each color reached level 3 once). **Loss**: hand is empty and deck is empty.

### UI structure (`App.tsx`)

Three-column layout (Tailwind + Motion animations):
- **Left sidebar**: static tetromino pattern reference guide.
- **Center**: 3×3 board grid with Motion-animated card placement.
- **Right sidebar**: per-color progress bars tracking level-3 merges.
- **Footer**: horizontal carousel showing the player's 5-card hand.
- **Modals**: win/loss overlays with restart.

All React state (`deck`, `hand`, `board`, `score`, `selectedCard`) lives in `App.tsx` via `useState`. No global state library is used.

### Build config

- Path alias `@/` resolves to the project root.

## Conventions

- Game logic changes belong in `gameLogic.ts`; UI-only changes belong in `App.tsx`. Keep them decoupled — `gameLogic.ts` must not import from React or UI files.
- `App.tsx` is already large (~18 KB). Prefer extracting new UI sections into sibling components in `src/` rather than growing it further.
- Animations use the **Motion** library (`motion/react`), not Framer Motion directly.
