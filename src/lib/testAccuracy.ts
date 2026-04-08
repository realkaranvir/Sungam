import { Chess } from 'chess.js'

interface AnalyzedMove {
  san: string
  fen: string
  fenBefore: string
  moveNumber: number
  color: 'w' | 'b'
  cpBefore: number
  cpAfter: number
  cpLoss: number
  classification: string
  bestMoveSan: string
}

export async function analyzeGame(gamePgn: string) {
  const chess = new Chess()
  chess.loadPgn(gamePgn)

  const history = chess.history({ verbose: true })
  const analyzedMoves: AnalyzedMove[] = []

  // Replay game to get FEN at each position
  const replay = new Chess()

  for (const move of history) {
    const fenBefore = replay.fen()
    replay.move(move.san)
    const fenAfter = replay.fen()
    const fullMoveNumber = Math.ceil(analyzedMoves.length / 2) + 1

    // Simplified: use move.san as bestMoveSan for now
    analyzedMoves.push({
      san: move.san,
      fen: fenAfter,
      fenBefore,
      moveNumber: fullMoveNumber,
      color: move.color as 'w' | 'b',
      cpBefore: 0,
      cpAfter: 0,
      cpLoss: 0,
      classification: '',
      bestMoveSan: move.san,
    })
  }

  return { analyzedMoves }
}

export function calculateAccuracy(analyzedMoves: AnalyzedMove[], color: 'w' | 'b'): number {
  const moves = analyzedMoves.filter((m): m is NonNullable<typeof m> => m !== null && m.color === color)
  if (moves.length === 0) return 50

  let totalScore = 0

  moves.forEach((move) => {
    const bestMoveScore = move.cpBefore
    const playedMoveScore = move.cpAfter
    const cpLoss = Math.abs(bestMoveScore - playedMoveScore)

    // Sigmoid function to map cp loss to 0-1 accuracy
    const k = 30
    const sigmoid = 1 / (1 + Math.exp(-cpLoss / k))

    // Weight by position strength
    const positionScore = Math.abs(bestMoveScore)
    const weight = 1 / (positionScore + 1)

    totalScore += sigmoid * weight
  })

  const averageScore = totalScore / moves.length

  // Map to human-friendly scale
  const accuracy = Math.min(100, Math.max(0, (Math.log2(averageScore + 1) / Math.log2(2)) * 100))

  return accuracy
}