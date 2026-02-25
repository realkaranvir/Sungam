export type MoveClassification =
  | 'brilliant'
  | 'great'
  | 'best'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'

export interface EngineInfo {
  depth: number
  score: number           // best move score, normalized to White's perspective
  mate: number | null
  pv: string
  secondScore: number | null  // second-best move score (null if only one legal move)
  multipv?: number        // internal: which multipv line this came from
}

export interface AnalyzedMove {
  san: string
  fen: string
  moveNumber: number
  color: 'white' | 'black'
  cpBefore: number
  cpAfter: number
  cpLoss: number
  classification: MoveClassification
  bestMoveSan: string
  bestMoveUci: string
}

export interface ChessComGame {
  url: string
  pgn: string
  time_control: string
  end_time: number
  rated: boolean
  white: { username: string; rating: number; result: string }
  black: { username: string; rating: number; result: string }
}

export interface ProcessedGame {
  id: string
  opponent: string
  opponentRating: number
  userColor: 'white' | 'black'
  result: 'win' | 'loss' | 'draw'
  timeControl: string
  date: Date
  pgn: string
  userRating: number
}
