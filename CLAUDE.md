# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server with HMR
npm run build      # Type-check (tsc -b) then build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build locally
```

There are no tests in this project.

After `npm install`, a `postinstall` script automatically copies Stockfish WASM binaries from `node_modules` into `public/`.

## Architecture

**Sungam** ("Magnus" backwards) is a chess game review app. It fetches games from Chess.com's public API, runs each position through Stockfish 18 in a Web Worker, and presents an interactive board with move-by-move quality classifications.

### Data Flow

1. `SearchPage` — user enters a Chess.com username (cached in `localStorage`)
2. `DashboardPage` — fetches the last 10 games via `useChessComApi` → `https://api.chess.com/pub/player/{username}/games/archives`
3. `ReviewPage` — the core feature:
   - `useChessGame` parses the PGN (via `chess.js`) into an array of moves and FENs
   - `useStockfish` sends each FEN to `stockfish.worker.ts` via `postMessage`; worker uses UCI protocol with `MultiPV=2` at depth 16
   - `moveClassifier.ts` computes centipawn loss per move and assigns a classification (brilliant → blunder)
   - `EvaluationBar`, `MoveList`, and `MoveClassificationBadge` render the results

### Stockfish Web Worker

Stockfish runs in `src/workers/stockfish.worker.ts` to avoid blocking the UI. The Vite config sets `worker.format: 'es'` and adds `Cross-Origin-Opener-Policy: same-origin` / `Cross-Origin-Embedder-Policy: require-corp` headers (required for `SharedArrayBuffer` / WASM threads). Stockfish is excluded from Vite's dep optimization.

### Move Classification Logic (`src/lib/moveClassifier.ts`)

Scores are normalized to white's perspective (centipawns). `cpLoss` = score before move − score after move (from the moving side's perspective).

| Classification | Condition |
|---|---|
| Brilliant | Best move + second-best gap ≥ 150cp + position unclear (< +200cp) |
| Best | Is the engine's top move |
| Great | cpLoss ≤ 0 |
| Good | cpLoss ≤ 10 |
| Inaccuracy | cpLoss ≤ 30 |
| Mistake | cpLoss ≤ 100 |
| Blunder | cpLoss > 100 |

Winning percentage uses a sigmoid: `50 + 50 * (2/(1 + e^(-cp/400)) - 1)`.

### Key Types (`src/types/index.ts`)

- `AnalyzedMove` — per-move data: `san`, `fen`, `cpBefore/After/Loss`, `classification`, `bestMoveSan/Uci`
- `ProcessedGame` — game metadata: `opponent`, `result`, `pgn`, `userColor`, `userRating`, etc.
- `EngineInfo` — Stockfish output: `score` (cp, white-normalized), `mate`, `pv`, `secondScore`

### Styling

Dark theme is forced in `main.tsx` (`document.documentElement.classList.add('dark')`). All colors use CSS HSL variables defined in `index.css`. Path alias `@/` resolves to `src/`.
