import type { MoveClassification, EngineInfo } from '@/types'

// Piece values in centipawns for sacrifice detection
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 300,
  b: 300,
  r: 500,
  q: 900,
}

/**
 * Check if a UCI move is a sacrifice — the played move gives up material
 * that is worth at least a minor piece (300cp), by moving onto a square
 * occupied by a lower-value or no-value piece.
 *
 * A sacrifice means: we capture nothing (moving into danger) or capture
 * something worth less than what we're moving. We approximate by checking
 * if the destination square has no enemy piece (pure sacrifice) OR the
 * captured piece is worth less than the moving piece.
 */
function isSacrifice(fenBefore: string, uciMove: string): boolean {
  const from = uciMove.slice(0, 2)
  const to   = uciMove.slice(2, 4)

  // Parse board from FEN
  const boardPart = fenBefore.split(' ')[0]
  if (!boardPart) return false

  const board: (string | null)[][] = []
  for (const rank of boardPart.split('/')) {
    const row: (string | null)[] = []
    for (const ch of rank) {
      if (ch >= '1' && ch <= '8') {
        for (let i = 0; i < parseInt(ch); i++) row.push(null)
      } else {
        row.push(ch)
      }
    }
    board.push(row)
  }

  const fileToIdx = (f: string) => f.charCodeAt(0) - 'a'.charCodeAt(0)
  const rankToIdx = (r: string) => 8 - parseInt(r) // rank '8' = row 0

  const fromFile = fileToIdx(from[0])
  const fromRank = rankToIdx(from[1])
  const toFile   = fileToIdx(to[0])
  const toRank   = rankToIdx(to[1])

  if (fromRank < 0 || fromRank > 7 || toRank < 0 || toRank > 7) return false

  const movingPiece = board[fromRank]?.[fromFile]
  const targetPiece = board[toRank]?.[toFile]

  if (!movingPiece) return false

  const movingValue = PIECE_VALUES[movingPiece.toLowerCase()] ?? 0
  const capturedValue = targetPiece ? (PIECE_VALUES[targetPiece.toLowerCase()] ?? 0) : 0

  // A sacrifice: moving a piece worth more than what we capture (including capturing nothing)
  // Minimum: moving piece must be at least a minor piece (not just a pawn sac — those are common)
  return movingValue >= 300 && capturedValue < movingValue
}

/**
 * Classify a chess move based on centipawn scores, approximating Chess.com's system.
 *
 * @param cpBefore      Score before the move (white perspective — positive = white winning)
 * @param cpAfter       Score after the move (white perspective — positive = white winning)
 * @param color         Who made the move
 * @param engineBefore  Engine output for the position before the move (MultiPV 2)
 * @param playedMoveUci The UCI move that was actually played
 * @param fenBefore     FEN of the position before the move (for sacrifice detection)
 */
export function classifyMove(
  cpBefore: number,
  cpAfter: number,
  color: 'w' | 'b',
  engineBefore: EngineInfo,
  playedMoveUci: string,
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
    const positionCompetitive = Math.abs(cpBefore) < 500
    const sacrifice = fenBefore ? isSacrifice(fenBefore, playedMoveUci) : false

    if (positionCompetitive && sacrifice && secondBestGap >= 300) {
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
