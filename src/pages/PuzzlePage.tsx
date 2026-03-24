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
  const autoPlayTimeoutRef = useRef<number | null>(null)
  const autoPlaySetupTimeoutRef = useRef<number | null>(null)
  const isAutoPlayingRef = useRef(false)

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

  const convertSanToUci = (san: string, fen: string): string | null => {
    try {
      const chess = new Chess(fen)
      const moves = chess.moves({ verbose: true })
      const move = moves.find(m => m.san === san)
      if (move) {
        return move.lan
      }
      return null
    } catch (err) {
      console.error('Failed to convert SAN to UCI:', err)
      return null
    }
  }

  const autoPlayNextMove = async (chess: Chess, moveIndex: number) => {
    // Check if puzzle is solved or no more moves
    if (solved || isAutoPlayingRef.current || moveIndex >= solution.length) {
      return
    }

    isAutoPlayingRef.current = true

    // Small delay to let user see their move
    await new Promise(resolve => setTimeout(resolve, 500))

    // Get next solution move and auto-play it using chess instance
    const nextMove = solution[moveIndex]

    const uciMove = convertSanToUci(nextMove, chess.fen())

    if (uciMove) {
      chess.move(uciMove)
      setCurrentFen(chess.fen())
      setCurrentMoveIndex(moveIndex + 1)
      isAutoPlayingRef.current = false
    }
  }

  useEffect(() => {
    let autoPlaySetupTimeoutId: number | null = null

    async function loadPuzzle() {
      try {
        const randomPuzzle = await getRandomPuzzle()
        setPuzzle(randomPuzzle)
        setCurrentFen(randomPuzzle.fen)

        // Parse FEN to determine whose turn it is (last char before ' - 0 1')
        const sideToMove = randomPuzzle.fen.split(' ').at(-5) || 'w'
        const boardOrientation = sideToMove === 'w' ? 'black' : 'white'
        setBoardOrientation(boardOrientation)

        // Initialize Chess instance
        const chess = new Chess(randomPuzzle.fen)
        chessRef.current = chess

        console.log('Puzzle FEN:', randomPuzzle.fen)
        console.log('Puzzle moves:', randomPuzzle.moves)
        console.log('Puzzle solution (SAN):', randomPuzzle.solution)
        console.log('Side to move (FEN):', sideToMove)
        console.log('Board orientation set to:', boardOrientation)

        // Extract full solution from puzzle.moves and remove move numbers
        // 1. Clean and extract every move string first
        const fullSolution = randomPuzzle.moves
          .map((m: string) => m.replace(/^\d+\.{1,3}/, '').trim()) // Removes "1." or "1..." from the start
          .filter((m: string) => m.length > 0); // Removes any elements that were ONLY numbers

        // 2. Create the subset (skipping the first move)
        const solution = fullSolution.slice(1);

        console.log('Full solution:', fullSolution)
        console.log('Solution (excluding setup move and move numbers):', solution)

        // Auto-play the setup move after 1.5 seconds
        if (solution.length > 0 && fullSolution.length > 0) {
          autoPlaySetupTimeoutId = setTimeout(() => {
            const setupMove = fullSolution[0]
            console.log('Auto-playing setup move:', setupMove)

            // Convert SAN to UCI and make the move
            const uciMove = convertSanToUci(setupMove, randomPuzzle.fen)
            if (uciMove) {
              chess.move(uciMove)
              setCurrentFen(chess.fen())
              isAutoPlayingRef.current = false
              console.log('Setup move played. New FEN:', chess.fen())
            }
          }, 500)
        }

        // Start from the first move (index 0)
        setCurrentMoveIndex(0)

      } catch (err) {
        console.error('Failed to load puzzle:', err)
        alert('Failed to load puzzle')
      } finally {
        setLoading(false)
      }
    }

    loadPuzzle()

    // Cleanup on unmount
    return () => {
      if (autoPlaySetupTimeoutId) {
        clearTimeout(autoPlaySetupTimeoutId)
      }
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current)
      }
      if (autoPlaySetupTimeoutRef.current) {
        clearTimeout(autoPlaySetupTimeoutRef.current)
      }
      chessRef.current = null
      isAutoPlayingRef.current = false
    }
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

  const onPieceDrop = ({ piece, sourceSquare, targetSquare }: any) => {
    if (solved || isAutoPlayingRef.current) return false

    const chess = chessRef.current
    if (!chess) return false

    const currentTurn = chess.turn()
    console.log('Piece object:', piece)
    console.log('Source square:', sourceSquare, 'Target square:', targetSquare)
    console.log('Current turn:', currentTurn)
    console.log('Piece color from piece object:', piece?.pieceType)

    const squarePiece = chess.get(sourceSquare)
    console.log('Square piece from chess.js:', squarePiece)

    const pieceColor = piece?.pieceType?.charAt(0)
    console.log('Piece color (extracted):', pieceColor)

    if (pieceColor !== currentTurn) {
      console.log('Not your turn! Piece color:', pieceColor, 'Current turn:', currentTurn)
      return false
    }

    const uciMove = `${sourceSquare}${targetSquare}`
    console.log('Move:', uciMove)

    const expectedMove = solution[currentMoveIndex]
    console.log('Current move index:', currentMoveIndex, 'Expected move:', expectedMove)

    if (expectedMove) {
      const solutionUci = convertSanToUci(expectedMove, currentFen)
      if (solutionUci) {
        console.log('Expected move (UCI):', solutionUci)
      }
    }

    try {
      chess.move({ from: sourceSquare, to: targetSquare })
      setCurrentFen(chess.fen())
      setUserMoves([...userMoves, uciMove])

      if (expectedMove) {
        const solutionUci = convertSanToUci(expectedMove, currentFen)
        if (solutionUci && uciMove === solutionUci) {
          // Calculate next index before setting state
          const nextMoveIndex = currentMoveIndex + 1
          setCurrentMoveIndex(nextMoveIndex)
          setFeedback('✓ Good!')
          console.log('Correct move! Continuing to next move.')

          // Use the new index for the check (not the old one)
          console.log('Checking auto-play conditions:', {
            chessRefExists: !!chessRef.current,
            currentTurn: chessRef.current?.turn(),
            boardOrientation,
            nextMoveIndex,
            solutionLength: solution.length,
            shouldAutoPlay: chessRef.current && chessRef.current.turn() !== (boardOrientation === 'white' ? 'w' : 'b') && nextMoveIndex < solution.length - 1
          })
          if (chessRef.current && chessRef.current.turn() !== (boardOrientation === 'white' ? 'w' : 'b') && nextMoveIndex < solution.length - 1) {
            console.log('Triggering auto-play')
            autoPlayNextMove(chessRef.current, nextMoveIndex)
          } else {
            console.log('Skipping auto-play:', {
              currentTurn: chessRef.current?.turn(),
              boardOrientation,
              nextMoveIndex,
              solutionLength: solution.length
            })
            if (nextMoveIndex === solution.length - 1) {
              setSolved(true);
            }
          }
        } else {
          setFeedback('✗ Wrong move!')
          console.log('Wrong move! Move:', uciMove, 'Expected:', solutionUci)

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

  const handleNextPuzzle = async () => {
    // Clear any pending timeouts
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current)
    }
    if (autoPlaySetupTimeoutRef.current) {
      clearTimeout(autoPlaySetupTimeoutRef.current)
    }

    setSolved(false)
    setUserMoves([])
    setCurrentMoveIndex(0)
    setFeedback('')
    setLoading(true)

    try {
      const randomPuzzle = await getRandomPuzzle()
      setPuzzle(randomPuzzle)
      setCurrentFen(randomPuzzle.fen)

      // Parse FEN to determine whose turn it is (last char before ' - 0 1')
      const sideToMove = randomPuzzle.fen.split(' ').at(-5) || 'w'
      const boardOrientation = sideToMove === 'w' ? 'black' : 'white'
      setBoardOrientation(boardOrientation)

      // Initialize Chess instance
      const chess = new Chess(randomPuzzle.fen)
      chessRef.current = chess
      isAutoPlayingRef.current = false
      console.log('Next puzzle loaded. New FEN:', randomPuzzle.fen)

      // Extract full solution from puzzle.moves and remove move numbers
      const fullSolution = randomPuzzle.moves
        .map((m: string) => m.replace(/^\d+\.{1,3}/, '').trim())
        .filter((m: string) => m.length > 0);
      const solution = fullSolution.slice(1);

      console.log('Full solution:', fullSolution)
      console.log('Solution (excluding setup move and move numbers):', solution)

      // Auto-play the setup move after 1.5 seconds
      if (solution.length > 0 && fullSolution.length > 0) {
        autoPlaySetupTimeoutRef.current = setTimeout(() => {
          const setupMove = fullSolution[0]
          console.log('Auto-playing setup move:', setupMove)

          const uciMove = convertSanToUci(setupMove, randomPuzzle.fen)
          if (uciMove) {
            chess.move(uciMove)
            setCurrentFen(chess.fen())
            isAutoPlayingRef.current = false
            console.log('Setup move played. New FEN:', chess.fen())
          }
        }, 1500)
      }

    } catch (err) {
      console.error('Failed to load puzzle:', err)
      alert('Failed to load puzzle')
    } finally {
      setLoading(false)
    }
  }

  // Extract solution (excluding setup move)
  const fullSolution = puzzle.moves.filter((m: string) => !m.match(/^\d+\.$/)).map((m: string) => m.trim())
  const solution = fullSolution.slice(1).filter((m: string) => !m.match(/^\d+\./))

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <AppHeader
        title="Sungam Puzzles"
        subtitle="Solve chess puzzles to improve your game"
      />

      <div className="flex-1 w-full px-4 py-4 overflow-hidden flex flex-col lg:flex-row lg:justify-center gap-4 items-stretch">
        <div className="flex-1 flex flex-col rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="p-3 border-b border-zinc-800 shrink-0">
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Starting position</h3>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-4 h-4 rounded-sm"
                style={{
                  backgroundColor: boardOrientation === 'white' ? '#ffffff' : '#000000',
                  border: boardOrientation === 'white' ? '1px solid #333' : '1px solid #666'
                }}
              />
              <p className="text-xs text-zinc-400">
                {boardOrientation === 'white' ? 'You are playing white' : 'You are playing black'}
              </p>
            </div>
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

        <div className="w-full lg:max-w-xs lg:shrink-0 flex flex-col gap-4">
          <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
            <button
              onClick={handleNextPuzzle}
              className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-white text-sm transition-colors"
            >
              Next Puzzle
            </button>
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
              <span className="text-white text-sm">{userMoves.length} / {Math.ceil(solution.length / 2)}</span>
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
          </div>
        </div>
      </div>
    </div>
  )
}
