# Sungam

Sungam is a chess game review app. Enter a Chess.com username, browse their recent games, and get full engine analysis of any game — evaluation graph, per-move classification, and opening book coverage. A puzzle mode is included for daily practice.

## Features

- **Game search** — Look up any Chess.com username and browse their games from the last 3 months via the [Chess.com API](https://www.chess.com/news/view/api)
- **Game review** — Stockfish 18 (WASM) analysis running entirely in the browser: evaluation graph, per-move classification badges (best, good, inaccuracy, mistake, blunder), and opening book detection
- **Puzzles** — Puzzle mode with click-to-move, autoplay, and a confetti celebration on solve. Puzzles are drawn at random from a fixed library of 191,264 positions (~88 MB), so repeats are rare: the chance of seeing the same puzzle twice stays under 1% until you've solved ~60, climbs to ~10% around 200, and only reaches ~50% after ~500.
- **Dashboard** — Per-user game list with results and links into review

## Tech Stack

- [React 19](https://react.dev/) + TypeScript + [Vite](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [react-chessboard](https://github.com/clayt0n5/react-chessboard) + [chess.js](https://github.com/jhlywa/chess.js)
- [Stockfish 18](https://stockfishchess.org/) (WASM build, runs client-side)
- [react-router-dom](https://reactrouter.com/), [sonner](https://sonner.emilkowal.ski/) toasts, [canvas-confetti](https://canvas-confetti.com/)

Puzzles are stored in `public/puzzles.pgn` and can be refreshed with `scripts/fetch-puzzles.js`. The Stockfish WASM files are copied into `public/` automatically on `npm install` via `scripts/copy-stockfish.js`.

## Development

```bash
npm install     # installs deps and copies Stockfish WASM into public/
npm run dev     # start dev server with hot reload
npm run build   # type-check and build for production
npm run lint    # run ESLint
npm run preview # preview the production build locally
```

## Deployment

Sungam is deployed on [Render](https://render.com) as a static site with auto-deploy on push.

- **Production** (`main`): https://sungam.onrender.com
- **Development** (`dev`): https://sungam-develop.onrender.com

Pull requests against `dev` get an automatic Render preview environment. Previews (any `*.onrender.com` host other than prod/dev) load the [eruda](https://github.com/lirious/eruda) in-browser debugger.

## Credits

Created by Karan with a local AI model (Qwen3.8-27B via llama.cpp) running on his Mac, using OpenClaw and [OpenCode](https://opencode.ai).
