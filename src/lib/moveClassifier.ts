import type { MoveClassification, EngineInfo } from '@/types'
import { Chess } from 'chess.js'

// Piece values in centipawns for sacrifice detection
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 300,
  b: 300,
  r: 500,
  q: 900,
}

/**
 * Check if a UCI move is a sacrifice.
 * A move is a sacrifice if the piece moved is worth more than the piece captured
 * AND the destination square is attacked by the opponent after the move.
 */
function isSacrifice(fenBefore: string, uciMove: string): boolean {
  try {
    const game = new Chess(fenBefore)
    const move = game.move({
      from: uciMove.slice(0, 2),
      to: uciMove.slice(2, 4),
      promotion: uciMove.length === 5 ? uciMove[4] : undefined
    })

    if (!move) return false

    // Value of the piece we moved
    const movingValue = PIECE_VALUES[move.piece.toLowerCase()] ?? 0
    // Value of the piece we captured (if any)
    const capturedValue = move.captured ? (PIECE_VALUES[move.captured.toLowerCase()] ?? 0) : 0

    // A sacrifice only makes sense if we're moving a major/minor piece
    if (movingValue < 300) return false

    // Check if the destination square is now attacked by the opponent.
    // In chess.js, isAttacked checks if a square is attacked by a certain color.
    // The turn has already swapped to the opponent after game.move().
    const isAttackedByOpponent = game.isAttacked(move.to, game.turn())

    // If the square is NOT attacked, it's just a safe move or taking a hung piece.
    // If it IS attacked, it's a sacrifice if we gave up more value than we took.
    return isAttackedByOpponent && (movingValue > capturedValue)
  } catch (e) {
    console.error('Error in isSacrifice:', e)
    return false
  }
}

/**
 * Classify a chess move based on centipawn scores, approximating Chess.com's system.
 *
 * @param cpBefore      Score before the move (white perspective — positive = white winning)
 * @param cpAfter       Score after the move (white perspective — positive = white winning)
 * @param color         Who made the move
 * @param engineBefore  Engine output for the position before the move (MultiPV 2)
 * @param playedMoveUci The UCI move that was actually played
 * @param userColor     Karan's chosen color
 * @param fenBefore     FEN of the position before the move (for sacrifice detection)
 */
export function classifyMove(
  cpBefore: number,
  cpAfter: number,
  color: 'w' | 'b',
  engineBefore: EngineInfo,
  playedMoveUci: string,
  userColor: 'white' | 'black',
  fenBefore?: string,
): MoveClassification {
  const winPct = (cp: number) => 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1)

  const isBestMove = playedMoveUci !== '' && engineBefore.pv === playedMoveUci

  // Win% before and after from the moving player's perspective
  const wpBefore = color === 'w' ? winPct(cpBefore) : winPct(-cpBefore)
  const wpAfter  = color === 'w' ? winPct(cpAfter)  : winPct(-cpAfter)

  // Win% loss (positive = player lost winning chances)
  const wpLoss = wpBefore - wpAfter

  const bestScore   = color === 'w' ? engineBefore.score : -engineBefore.score
  const secondScore = engineBefore.secondScore !== null
    ? (color === 'w' ? engineBefore.secondScore : -engineBefore.secondScore)
    : null
  const secondBestGap = secondScore !== null ? bestScore - secondScore : 0

  if (isBestMove) {
    // Brilliant: best move AND it's a sacrifice AND significantly better than alternatives
    // Criteria (approximating Chess.com):
    //   1. Position is competitive — not already a forced win (|cp| < 500)
    //   2. Best move is a sacrifice (moving valuable piece to undefended/lower-value square)
    //   3. Second best move is dramatically worse (gap ≥ 300cp) — think +1 vs +7
    const movingPlayerColor = color === 'w' ? 'white' : 'black'
    const isUserMove = movingPlayerColor === userColor

    const positionCompetitive = Math.abs(cpBefore) < 500
    const sacrifice = (isUserMove && fenBefore) ? isSacrifice(fenBefore, playedMoveUci) : false

    if (isUserMove && positionCompetitive && sacrifice && secondBestGap >= 300) {
      return 'brilliant'
    }

    // Great: only one good move — second best was significantly worse (≥150cp gap).
    // The player found the only real option in a difficult position.
    if (secondBestGap >= 150) {
      return 'great'
    }

    // Best → Good when multiple moves are essentially equivalent (gap < 30cp).
    if (secondBestGap < 30) {
      return 'good'
    }

    return 'best'
  }

  // Non-best moves: use win% loss thresholds
  if (wpLoss <= 3)  return 'good'        // ≤3% win% loss
  if (wpLoss <= 7)  return 'inaccuracy'  // ≤7% win% loss
  if (wpLoss <= 14) return 'mistake'     // ≤14% win% loss
  return 'blunder'                        // >14% win% loss
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
