import type { MoveClassification, EngineInfo } from '@/types'

/**
 * Classify a chess move based on centipawn scores.
 *
 * @param cpBefore  Score before the move (white perspective)
 * @param cpAfter   Score after the move (white perspective)
 * @param color     Who made the move
 * @param engineBefore  Engine output for the position before the move
 * @param playedMoveUci  The UCI move that was played
 */
export function classifyMove(
  cpBefore: number,
  cpAfter: number,
  color: 'w' | 'b',
  engineBefore: EngineInfo,
  playedMoveUci: string,
): MoveClassification {
  const isBestMove = engineBefore.pv === playedMoveUci

  // cpLoss from the current player's perspective (always positive means bad for player)
  const cpLoss = color === 'w' ? cpBefore - cpAfter : cpAfter - cpBefore

  if (isBestMove) {
    // Brilliant: best move, position was not already winning, AND there was a clear second option
    const positionNotEasy = Math.abs(cpBefore) < 200
    const secondBestGap =
      engineBefore.secondScore !== null
        ? Math.abs(engineBefore.score - engineBefore.secondScore)
        : 0

    if (positionNotEasy && secondBestGap >= 150) {
      return 'brilliant'
    }
    return 'best'
  }

  // Great: not the best move but still gained (cpLoss < 0 means actually improved)
  if (cpLoss <= 0) return 'great'

  if (cpLoss <= 10) return 'good'
  if (cpLoss <= 30) return 'inaccuracy'
  if (cpLoss <= 100) return 'mistake'
  return 'blunder'
}

/**
 * Clamp a centipawn score to a displayable range for the evaluation bar.
 * Returns a value between -1 and 1 representing the balance.
 */
export function scoreToBarValue(cp: number, mate: number | null): number {
  if (mate !== null) {
    return mate > 0 ? 1 : -1
  }
  // Sigmoid-like clamping: ±600cp maps to ~±0.9
  const clamped = Math.max(-1000, Math.min(1000, cp))
  return clamped / 1000
}

/**
 * Format a centipawn score for display.
 */
export function formatScore(cp: number, mate: number | null): string {
  if (mate !== null) {
    return `M${Math.abs(mate)}`
  }
  const pawns = cp / 100
  if (pawns > 0) return `+${pawns.toFixed(1)}`
  return pawns.toFixed(1)
}
