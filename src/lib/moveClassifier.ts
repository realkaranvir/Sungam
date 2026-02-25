import type { MoveClassification } from '@/types'

// Gap between best and second-best move required to call something "brilliant".
// The idea: only one move works well — the hard-to-find kind.
const BRILLIANT_GAP_CP = 150

export function classifyMove(
  cpLoss: number,
  isBestMove: boolean,
  // Gap in cp between the best and second-best move (mover's perspective, from evalBefore).
  // Positive means there's a clear "only move" quality to the best move.
  secondBestGap: number | null,
  // The best eval before the move (mover's perspective). Used to guard against
  // calling quiet moves in won positions "brilliant".
  cpBefore: number,
): MoveClassification {
  // Brilliant requires:
  // 1. You played the engine's top move
  // 2. The position before was not already winning (not above +200cp) — avoids
  //    trivial "only move" situations in completely won positions
  // 3. The second-best move is significantly worse (large gap) — truly only one move
  const positionIsUnclear = cpBefore < 200
  if (
    isBestMove &&
    secondBestGap !== null &&
    secondBestGap >= BRILLIANT_GAP_CP &&
    positionIsUnclear
  ) return 'brilliant'

  if (isBestMove) return 'best'
  if (cpLoss <= 0) return 'great'
  if (cpLoss <= 10) return 'good'
  if (cpLoss <= 30) return 'inaccuracy'
  if (cpLoss <= 100) return 'mistake'
  return 'blunder'
}

export const CLASSIFICATION_META: Record<
  MoveClassification,
  { label: string; color: string; bgColor: string; borderColor: string; icon: string }
> = {
  brilliant: {
    label: 'Brilliant',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/15',
    borderColor: 'border-cyan-400/30',
    icon: '!!',
  },
  great: {
    label: 'Great',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/15',
    borderColor: 'border-blue-400/30',
    icon: '!',
  },
  best: {
    label: 'Best',
    color: 'text-green-400',
    bgColor: 'bg-green-400/15',
    borderColor: 'border-green-400/30',
    icon: '★',
  },
  good: {
    label: 'Good',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/15',
    borderColor: 'border-emerald-400/30',
    icon: '✓',
  },
  inaccuracy: {
    label: 'Inaccuracy',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/15',
    borderColor: 'border-yellow-400/30',
    icon: '?!',
  },
  mistake: {
    label: 'Mistake',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/15',
    borderColor: 'border-orange-400/30',
    icon: '?',
  },
  blunder: {
    label: 'Blunder',
    color: 'text-red-400',
    bgColor: 'bg-red-400/15',
    borderColor: 'border-red-400/30',
    icon: '??',
  },
}

export function scoreToPercentage(cp: number, mate: number | null): number {
  if (mate !== null) {
    return mate > 0 ? 95 : 5
  }
  const clamped = Math.max(-1000, Math.min(1000, cp))
  return 50 + 50 * (2 / (1 + Math.exp(-clamped / 400)) - 1)
}

export function formatScore(cp: number, mate: number | null): string {
  if (mate !== null) {
    return mate > 0 ? `M${mate}` : `M${Math.abs(mate)}`
  }
  const pawns = cp / 100
  if (pawns > 0) return `+${pawns.toFixed(1)}`
  return pawns.toFixed(1)
}
