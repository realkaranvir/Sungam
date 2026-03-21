import { useEffect, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { getRandomPuzzle } from '@/data/puzzles'

export function PuzzlePage() {
  const [puzzle, setPuzzle] = useState<any>(null)
  const [currentFen, setCurrentFen] = useState('')
  const [loading, setLoading] = useState(true)

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
  }, [])

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
    <div className="min-h-screen bg-zinc-950 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Sungam Puzzles</h1>
        <p className="text-zinc-500 mb-6">Solve chess puzzles to improve your game</p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
          <div className="text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-zinc-500">Category:</span>{' '}
                <span className="text-white">{puzzle.category}</span>
              </div>
              <div>
                <span className="text-zinc-500">Theme:</span>{' '}
                <span className="text-white">{puzzle.theme}</span>
              </div>
              <div className="col-span-2">
                <span className="text-zinc-500">Title:</span>{' '}
                <span className="text-white">{puzzle.title}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
          <div className="text-zinc-500 text-sm mb-4">Starting position</div>
          <div style={{ width: '480px', height: '480px' }}>
            <Chessboard
              options={{
                position: currentFen,
                boardOrientation: 'white',
                allowDragging: false,
              }}
            />
          </div>
        </div>

        <div className="mt-6 text-zinc-600 text-sm">
          <p>Console output:</p>
          <p className="text-zinc-500">✓ Puzzle FEN logged</p>
          <p className="text-zinc-500">✓ Puzzle moves logged</p>
          <p className="text-zinc-500">✓ Puzzle solution logged</p>
        </div>
      </div>
    </div>
  )
}