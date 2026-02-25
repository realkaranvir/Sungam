import { useState, useCallback, useMemo } from 'react'
import { Chess } from 'chess.js'
import type { AnalyzedMove } from '@/types'

export function useChessGame(pgn: string) {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)
  const [analyzedMoves, setAnalyzedMoves] = useState<AnalyzedMove[]>([])

  const { moves, fens } = useMemo(() => {
    try {
      const chess = new Chess()
      chess.loadPgn(pgn)
      const history = chess.history({ verbose: true })

      const fens: string[] = []
      const replay = new Chess()
      fens.push(replay.fen())

      for (const move of history) {
        replay.move(move)
        fens.push(replay.fen())
      }

      return { moves: history, fens }
    } catch {
      return { moves: [], fens: [new Chess().fen()] }
    }
  }, [pgn])

  const currentFen = fens[currentMoveIndex + 1] ?? fens[0]
  const currentMove = currentMoveIndex >= 0 ? moves[currentMoveIndex] : null
  const lastMoveSquares =
    currentMove
      ? { from: currentMove.from, to: currentMove.to }
      : null

  const goToMove = useCallback(
    (index: number) => {
      setCurrentMoveIndex(Math.max(-1, Math.min(index, moves.length - 1)))
    },
    [moves.length]
  )

  const goForward = useCallback(() => {
    setCurrentMoveIndex((prev) => Math.min(prev + 1, moves.length - 1))
  }, [moves.length])

  const goBack = useCallback(() => {
    setCurrentMoveIndex((prev) => Math.max(prev - 1, -1))
  }, [])

  const goToStart = useCallback(() => setCurrentMoveIndex(-1), [])
  const goToEnd = useCallback(
    () => setCurrentMoveIndex(moves.length - 1),
    [moves.length]
  )

  return {
    moves,
    fens,
    currentFen,
    currentMoveIndex,
    lastMoveSquares,
    analyzedMoves,
    setAnalyzedMoves,
    goToMove,
    goForward,
    goBack,
    goToStart,
    goToEnd,
  }
}
