import { useEffect, useState, useRef } from 'react'
import { Chessboard } from 'react-chessboard'
import { getRandomPuzzle } from '@/data/puzzles'
import { AppHeader } from '@/components/AppHeader'

export function PuzzlePage() {
  const [puzzle, setPuzzle] = useState<any>(null)
  const [currentFen, setCurrentFen] = useState('')
  const [loading, setLoading] = useState(true)
  const [boardSize, setBoardSize] = useState<number | undefined>(undefined)

  const boardMeasureRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = boardMeasureRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      setBoardSize(Math.floor(w / 8) * 8)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    async function loadPuzzle() {
      try {
        const randomPuzzle = await getRandomPuzzle()
        setPuzzle(randomPuzzle)
        setCurrentFen(randomPuzzle.fen)
        console.log('Puzzle FEN:', randomPuzzle.fen)
        console.log('Puzzle moves:', randomPuzzle.moves)
        console.log('Puzzle solution:', randomPuzzle.solution)
      } catch (err) {
        console.error('Failed to load puzzle:', err)
        alert('Failed to load puzzle')
      } finally {
        setLoading(false)
      }
    }

    loadPuzzle()
  }, [getRandomPuzzle])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-zinc-500">Loading puzzle...</div>
      </div>
    )
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-zinc-500">No puzzle loaded</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <AppHeader
        title="Sungam Puzzles"
        subtitle="Solve chess puzzles to improve your game"
      />

      <div className="flex-1 w-full px-4 py-4 overflow-hidden flex flex-col lg:flex-row lg:justify-center gap-4 items-stretch">
        {/* Left Column: Puzzle info */}
        <div className="w-full lg:max-w-xs lg:shrink-0 flex flex-col gap-4">
          <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Category</span>
              </div>
              <span className="text-white text-sm">{puzzle.category}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Theme</span>
              </div>
              <span className="text-white text-sm">{puzzle.theme}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Title</span>
              </div>
              <span className="text-white text-sm">{puzzle.title}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Chessboard */}
        <div className="flex-1 flex flex-col rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="p-3 border-b border-zinc-800 shrink-0">
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Starting position</h3>
          </div>
          <div className="flex-1 min-h-0 p-4 flex items-center justify-center">
            <div
              ref={boardMeasureRef}
              className="min-h-0 min-w-0"
              style={{ width: 'min(100%, calc(100vh - 12rem))', maxWidth: '100%', maxHeight: '100%' }}
            >
              <div style={{ width: boardSize, height: boardSize }}>
                <Chessboard
                  options={{
                    position: currentFen,
                    boardOrientation: 'white',
                    allowDragging: false,
                    boardStyle: {
                      borderRadius: '4px',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                    },
                    darkSquareStyle: { backgroundColor: '#3d3d3d' },
                    lightSquareStyle: { backgroundColor: '#a0a0a0' },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
