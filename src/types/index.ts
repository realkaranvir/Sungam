export type MoveClassification =
  | 'brilliant'
  | 'great'
  | 'best'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'

export interface EngineLine {
  index: number       // multipv index: 1, 2, or 3
  score: number       // centipawns, side-to-move perspective
  mate: number | null
  moves: string[]     // full UCI move list
}

export interface EngineInfo {
  depth: number
  score: number       // centipawns, side-to-move perspective
  mate: number | null
  pv: string          // best move UCI
  secondScore: number | null  // for brilliant detection
  lines: EngineLine[] // top engine variations (up to 3)
}

export interface AnalyzedMove {
  san: string
  fen: string         // position AFTER the move
  fenBefore: string   // position BEFORE the move
  moveNumber: number
  color: 'w' | 'b'
  cpBefore: number    // score before move (white perspective)
  cpAfter: number     // score after move (white perspective)
  cpLoss: number      // always positive, from current player's perspective
  classification: MoveClassification
  bestMoveSan: string
  bestMoveUci: string
}

export interface ChessComArchive {
  games: ChessComRawGame[]
}

export interface ChessComRawGame {
  url: string
  pgn: string
  time_control: string
  end_time: number
  rated: boolean
  white: {
    username: string
    rating: number
    result: string
  }
  black: {
    username: string
    rating: number
    result: string
  }
}

export interface ProcessedGame {
  id: string
  opponent: string
  opponentRating: number
  userColor: 'white' | 'black'
  result: 'win' | 'loss' | 'draw'
  timeControl: string
  date: string
  pgn: string
  userRating: number
}

export interface ParsedMove {
  san: string
  uci: string      // UCI move string e.g. "e2e4"
  fen: string      // position after the move
  fenBefore: string
  moveNumber: number
  color: 'w' | 'b'
}

export const CLASSIFICATION_META: Record<
  MoveClassification,
  { label: string; symbol: string; color: string; bgColor: string }
> = {
  brilliant: {
    label: 'Brilliant',
    symbol: '!!',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/20',
  },
  great: {
    label: 'Great',
    symbol: '!',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
  },
  best: {
    label: 'Best',
    symbol: '★',
    color: 'text-green-400',
    bgColor: 'bg-green-400/20',
  },
  good: {
    label: 'Good',
    symbol: '✓',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/20',
  },
  inaccuracy: {
    label: 'Inaccuracy',
    symbol: '?!',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/20',
  },
  mistake: {
    label: 'Mistake',
    symbol: '?',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/20',
  },
  blunder: {
    label: 'Blunder',
    symbol: '??',
    color: 'text-red-400',
    bgColor: 'bg-red-400/20',
  },
}
