import { useEffect, useState, useRef } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { getRandomPuzzle } from '@/data/puzzles'
import { AppHeader } from '@/components/AppHeader'

export function PuzzlePage() {
  const [puzzle, setPuzzle] = useState<any>(null)
  const [currentFen, setCurrentFen] = useState('')
  const [loading, setLoading] = useState(true)
  const [userMoves, setUserMoves] = useState<string[]>([])
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [solved, setSolved] = useState(false)
  const [feedback, setFeedback] = useState<string>('')
  const [boardSize, setBoardSize] = useState<number | undefined>(undefined)
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white')

  const boardMeasureRef = useRef<HTMLDivElement | null>(null)
  const chessRef = useRef<Chess | null>(null)

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

        // Parse FEN to determine whose turn it is (last char before ' - 0 1')
        const sideToMove = randomPuzzle.fen.split(' ').at(-5) || 'w'
        setBoardOrientation(sideToMove as 'white' | 'black')

        // Initialize Chess instance
        const chess = new Chess(randomPuzzle.fen)
        chessRef.current = chess

        console.log('Puzzle FEN:', randomPuzzle.fen)
        console.log('Puzzle moves:', randomPuzzle.moves)
        console.log('Puzzle solution (SAN):', randomPuzzle.solution)
        console.log('Side to move:', sideToMove)
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

  const convertSanToUci = (san: string, fen: string): string | null => {
    try {
      const chess = new Chess(fen)
      const moves = chess.moves({ verbose: true })
      const move = moves.find(m => m.san === san)
      if (move) {
        // Use LAN (long algebraic notation) and convert to UCI
        // LAN is like 'c2c3', UCI is also 'c2c3'
        return move.lan
      }
      return null
    } catch (err) {
      console.error('Failed to convert SAN to UCI:', err)
      return null
    }
  }

  const extractFullSolution = (moves: string[]): string[] => {
    // Remove move number prefixes (e.g., '8.', '9.') and get just the moves
    return moves.filter(m => !m.match(/^\d+\.$/)).map(m => m.trim())
  }

  const fullSolution = extractFullSolution(puzzle.moves)

  console.log('Full solution (UCI):', fullSolution)

  const onPieceDrop = ({ piece, sourceSquare, targetSquare }: any) => {
    // Check if already solved
    if (solved) return false

    // Check if it's the correct player's turn
    const chess = chessRef.current
    if (!chess) return false

    const currentTurn = chess.turn()
    console.log('Piece object:', piece)
    console.log('Source square:', sourceSquare, 'Target square:', targetSquare)
    console.log('Current turn:', currentTurn)
    console.log('Piece color from piece object:', piece?.pieceType)

    // Get piece color from chess.js board state
    const squarePiece = chess.get(sourceSquare)
    console.log('Square piece from chess.js:', squarePiece)

    // Extract color from pieceType (first character: 'w' or 'b')
    const pieceColor = piece?.pieceType?.charAt(0)

    console.log('Piece color (extracted):', pieceColor)

    if (pieceColor !== currentTurn) {
      console.log('Not your turn! Piece color:', pieceColor, 'Current turn:', currentTurn)
      return false
    }

    // Convert move to UCI
    const uciMove = `${sourceSquare}${targetSquare}`
    console.log('Move:', uciMove)

    // Get expected move from solution
    const expectedMove = fullSolution[currentMoveIndex]
    console.log('Current move index:', currentMoveIndex, 'Expected move:', expectedMove)

    if (expectedMove) {
      const solutionUci = convertSanToUci(expectedMove, currentFen)
      if (solutionUci) {
        console.log('Expected move (UCI):', solutionUci)
      }
    }

    // Make the move in chess.js
    try {
      chess.move({ from: sourceSquare, to: targetSquare })
      setCurrentFen(chess.fen())
      setUserMoves([...userMoves, uciMove])

      // Check if move matches expected solution
      if (expectedMove) {
        const solutionUci = convertSanToUci(expectedMove, currentFen)
        if (solutionUci && uciMove === solutionUci) {
          // Correct move
          if (currentMoveIndex === fullSolution.length - 1) {
            // Last move - puzzle solved!
            setFeedback('✓ Correct!')
            setSolved(true)
            console.log('Puzzle solved! Correct move:', uciMove)
          } else {
            // Not last move, continue to next
            setCurrentMoveIndex(currentMoveIndex + 1)
            setFeedback('✓ Good!')
            console.log('Correct move! Continuing to next move.')
          }
        } else {
          // Wrong move - show error and reset
          setFeedback('✗ Wrong move!')
          console.log('Wrong move! Move:', uciMove, 'Expected:', solutionUci)

          // Undo the move
          chess.undo()
          setCurrentFen(chess.fen())
        }
      }

      console.log('Valid move made! New FEN:', chess.fen())
      return true
    } catch (err) {
      console.log('Invalid move:', err)
      return false
    }
  }

  const handleNextPuzzle = () => {
    setSolved(false)
    setUserMoves([])
    setCurrentMoveIndex(0)
    setFeedback('')
    setCurrentFen(puzzle.fen)
    const chess = new Chess(puzzle.fen)
    chessRef.current = chess
    console.log('Next puzzle loaded. New FEN:', puzzle.fen)
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
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Moves</span>
              </div>
              <span className="text-white text-sm">{userMoves.length} / {fullSolution.length}</span>
            </div>
            {feedback && (
              <div className="p-3 rounded-lg bg-zinc-800 border border-zinc-700">
                <p className="text-zinc-300 text-sm">{feedback}</p>
              </div>
            )}
            {solved && (
              <div className="p-3 rounded-lg bg-green-950/30 border border-green-500/30">
                <p className="text-green-400 text-sm font-medium">✓ Correct!</p>
              </div>
            )}
            <button
              onClick={handleNextPuzzle}
              className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-white text-sm transition-colors"
            >
              Next Puzzle
            </button>
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
              style={{ width: 'min(100%, calc(100vh - 10rem))', maxWidth: '100%', maxHeight: '100%' }}
            >
              <div style={{ width: boardSize, height: boardSize }}>
                <Chessboard
                  options={{
                    position: currentFen,
                    boardOrientation,
                    onPieceDrop,
                    allowDragging: true,
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