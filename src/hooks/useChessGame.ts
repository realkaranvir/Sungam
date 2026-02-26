import { useMemo } from 'react'
import { Chess } from 'chess.js'
import type { ParsedMove } from '@/types'

export interface ChessGameData {
  moves: ParsedMove[]
  initialFen: string
}

export function useChessGame(pgn: string): ChessGameData {
  return useMemo(() => {
    const chess = new Chess()

    try {
      chess.loadPgn(pgn)
    } catch {
      return { moves: [], initialFen: new Chess().fen() }
    }

    const history = chess.history({ verbose: true })
    const moves: ParsedMove[] = []

    // Replay game to get FEN at each position
    const replay = new Chess()
    for (const move of history) {
      const fenBefore = replay.fen()
      replay.move(move.san)
      const fenAfter = replay.fen()
      const fullMoveNumber = Math.ceil(moves.length / 2) + 1

      const uci = move.from + move.to + (move.promotion ?? '')
      moves.push({
        san: move.san,
        uci,
        fen: fenAfter,
        fenBefore,
        moveNumber: fullMoveNumber,
        color: move.color as 'w' | 'b',
      })
    }

    return {
      moves,
      initialFen: new Chess().fen(),
    }
  }, [pgn])
}
