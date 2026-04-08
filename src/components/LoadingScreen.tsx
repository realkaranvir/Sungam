import React, { useEffect } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { Loader2 } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = 'Analyzing with Stockfish...' }: LoadingScreenProps) {
  const [loadingBoard, setLoadingBoard] = React.useState<boolean>(true)
  const [currentPly, setCurrentPly] = React.useState<number>(0)

  // Animate a random piece movement
  useEffect(() => {
    if (loadingBoard) {
      const interval = setInterval(() => {
        const boardEl = document.getElementById('loading-chessboard') as HTMLElement
        if (!boardEl) return

        const squares = boardEl.querySelectorAll('[data-square]')
        if (squares.length === 0) return

        // Randomly select a piece to move
        const randomSquare = squares[Math.floor(Math.random() * squares.length)] as HTMLElement
        const from = randomSquare.dataset.square || ''

        // Get all possible moves for this piece
        const chess = new Chess()
        try {
          const pieceMoves = chess.moves({ square: from as any, verbose: true }) as any[]
          if (pieceMoves.length > 0) {
            setCurrentPly((prev) => prev + 1)
          }
        } catch (e) {
          // Ignore errors
        }
      }, 1500)

      return () => clearInterval(interval)
    }
  }, [loadingBoard])

  // Stop animation after 10 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoadingBoard(false)
    }, 10000)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950">
      {/* Animated Chessboard */}
      <div className="mb-8 p-4 bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl">
        <div id="loading-chessboard" className="w-[min(90vw,400px)] h-[min(90vw,400px)]">
          <Chessboard
            options={{
              position: 'start',
              boardOrientation: 'white',
              allowDragging: false,
              boardStyle: {
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              },
              darkSquareStyle: { backgroundColor: '#18181b' },
              lightSquareStyle: { backgroundColor: '#27272a' },
            }}
          />
        </div>
      </div>

      {/* Loading Animation */}
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />

        <p className="text-lg font-medium text-zinc-300">{message}</p>

        <p className="text-sm text-zinc-500">
          {loadingBoard ? 'Analyzing moves...' : 'Analysis complete!'}
        </p>

        {/* Progress indicator */}
        {loadingBoard && (
          <div className="w-64">
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${(currentPly / 8) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}