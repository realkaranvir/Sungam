/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'

import { useChessGame } from '@/hooks/useChessGame'
import { useStockfish } from '@/hooks/useStockfish'
import { classifyMove } from '@/lib/moveClassifier'
import { getHikaruComment } from '@/lib/hikaruCoach'
import { EvaluationBar } from '@/components/EvaluationBar'
import { MoveList } from '@/components/MoveList'
import { MoveClassificationBadge } from '@/components/MoveClassificationBadge'
import LoadingScreen from '@/components/LoadingScreen'
import { EvaluationGraph } from '@/components/EvaluationGraph'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'

import type { ProcessedGame, AnalyzedMove, EngineInfo, MoveClassification } from '@/types'
import { CLASSIFICATION_META as META } from '@/types'
import { formatScore } from '@/lib/moveClassifier'
import { getOpeningName } from '@/lib/openingBook'
import { POPULAR_OPENINGS } from '@/lib/openings'
import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from 'lucide-react'

// Convert UCI move to SAN in a position
function uciToSan(fen: string, uci: string): string {
  try {
    const chess = new Chess(fen)
    const move = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] })
    return move?.san ?? uci
  } catch {
    return uci
  }
}

// Convert a UCI PV sequence into space-separated SAN, limited to maxPlies
function pvToSan(fen: string, uciMoves: string[], maxPlies = 4): string {
  try {
    const chess = new Chess(fen)
    const parts: string[] = []
    for (let i = 0; i < Math.min(uciMoves.length, maxPlies); i++) {
      const uci = uciMoves[i]
      const move = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] })
      if (!move) break
      parts.push(move.san)
    }
    return parts.join(' ')
  } catch {
    return uciMoves.slice(0, maxPlies).join(' ')
  }
}

export function ReviewPage() {
  const location = useLocation()
  const navigate = useNavigate()
  useParams() // gameId present in URL but game data comes via router state
  const game = location.state?.game as ProcessedGame | undefined
  const userColor = game?.userColor ?? 'white'

  // Debug: log game and accuracies
  console.log('=== ReviewPage Debug ===')
  console.log('Game object:', game)
  console.log('Game has accuracies:', game?.accuracies !== undefined)
  console.log('White accuracy:', game?.accuracies?.white)
  console.log('Black accuracy:', game?.accuracies?.black)
  console.log('========================')

  const { moves, initialFen } = useChessGame(game?.pgn ?? '')
  const { analyzePosition, stop } = useStockfish()

  const [currentIndex, setCurrentIndex] = useState(-1) // -1 = initial

  interface AnalysisState {
    analyzedMoves: (AnalyzedMove | null)[]
    engineInfos: (EngineInfo | null)[]
    progress: number
    isAnalyzing: boolean
    currentOpening: string | null
  }
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    analyzedMoves: [],
    engineInfos: [],
    progress: 0,
    isAnalyzing: false,
    currentOpening: null,
  })
  const analyzedMoves = analysisState.analyzedMoves
  const engineInfos = analysisState.engineInfos
  const isAnalyzing = analysisState.isAnalyzing
  const analysisAbortRef = useRef(false)
  const currentOpeningRef = useRef<string | null>(null)

  // Snap board size to multiple of 8 to prevent subpixel gaps in the grid
  const boardMeasureRef = useRef<HTMLDivElement | null>(null)
  const [boardSize, setBoardSize] = useState<number | undefined>(undefined)
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

  // Current position FEN
  const currentFen =
    currentIndex === -1 ? initialFen : (moves[currentIndex]?.fen ?? initialFen)

  // Current engine info for display
  const currentEngineInfo =
    currentIndex === -1
      ? null
      : (engineInfos[currentIndex] ?? null)

  // Run analysis when moves are loaded
  useEffect(() => {
    if (moves.length === 0) return

    setAnalysisState({
      analyzedMoves: new Array(moves.length).fill(null),
      engineInfos: new Array(moves.length).fill(null),
      progress: 0,
      isAnalyzing: true,
      currentOpening: null,
    })
    analysisAbortRef.current = false

    const runAnalysis = async () => {
      // Pre-analyze: initial position + all positions after each move
      const fensToAnalyze: string[] = [initialFen, ...moves.map((m) => m.fen)]

      const engineResults: EngineInfo[] = []

      for (let i = 0; i < fensToAnalyze.length; i++) {
        if (analysisAbortRef.current) break

        const fen = fensToAnalyze[i]
        try {
          const info = await analyzePosition(fen, 16)
          engineResults.push(info)
        } catch {
          // Use a neutral score if analysis fails
          engineResults.push({ depth: 0, score: 0, mate: null, pv: '', secondScore: null, lines: [] })
        }

        // Progress: we've analyzed i+1 positions out of fensToAnalyze.length
        const progress = Math.round(((i + 1) / fensToAnalyze.length) * 100)
        setAnalysisState((prev) => ({ ...prev, progress }))
      }

      if (analysisAbortRef.current) {
        setAnalysisState((prev) => ({ ...prev, isAnalyzing: false }))
        return
      }

      // Detect the opening BEFORE classifying moves
      const moveHistory = moves.map(m => m.san) // Use SAN format, not UCI
      const detectedOpening = getOpeningName(moveHistory) || null

      if (detectedOpening) {
        // Opening detected - use ref for book move classification
        currentOpeningRef.current = detectedOpening
      }

      // Now classify each move
      const analyzed: AnalyzedMove[] = []
      const infos: EngineInfo[] = []

      // Now classify each move
      for (let i = 0; i < moves.length; i++) {
        const move = moves[i]
        const infoBeforeMove = engineResults[i]  // position before this move
        const infoAfterMove = engineResults[i + 1]  // position after this move

        // Normalize scores to white's perspective.
        // Stockfish scores are from the side-to-move's perspective, so negate when it's black's turn.
        const cpBefore = move.color === 'w' ? infoBeforeMove.score : -infoBeforeMove.score
        const cpAfter  = move.color === 'w' ? -infoAfterMove.score : infoAfterMove.score

        let classification = classifyMove(
          cpBefore,
          cpAfter,
          move.color,
          infoBeforeMove,
          move.uci,
          userColor,
          move.fenBefore,
        )

        // Check if the move is in the opening book
        // Use ref instead of state since state updates are async
        if (currentOpeningRef.current && currentOpeningRef.current.length > i) {
          // Get the detected opening directly
          const opening = POPULAR_OPENINGS.find(o => o.shortName === currentOpeningRef.current)
          if (opening && opening.moves[i] === move.san) {
            classification = 'book'
          }
        }

        // Check if the played move matches the best move
        // The played move in UCI: we get it from fenBefore
        const bestMoveSan = uciToSan(move.fenBefore, infoBeforeMove.pv)

        // Both scores are now white-perspective. Loss for the moving player:
        // white: their advantage = cpBefore, after = cpAfter → loss = cpBefore - cpAfter
        // black: their advantage = -cpBefore, after = -cpAfter → loss = cpAfter - cpBefore
        const cpLoss =
          move.color === 'w'
            ? cpBefore - cpAfter
            : cpAfter - cpBefore

        // Get opening name if move is in book
        const openingName = (classification === 'book')
          ? getOpeningName(moves.slice(0, i + 1).map(m => m.uci)) ?? undefined
          : undefined

        analyzed.push({
          san: move.san,
          fen: move.fen,
          fenBefore: move.fenBefore,
          moveNumber: move.moveNumber,
          color: move.color,
          cpBefore,
          cpAfter,
          cpLoss: Math.max(0, cpLoss),
          classification,
          bestMoveSan,
          bestMoveUci: infoBeforeMove.pv,
          openingName: openingName || undefined,
        })

        infos.push(infoAfterMove)
      }

      // Update ref synchronously so it's available during classification
      currentOpeningRef.current = detectedOpening

      // Final state update
      setAnalysisState((prev) => ({
        ...prev,
        analyzedMoves: analyzed,
        engineInfos: infos,
        isAnalyzing: false,
        progress: 100,
        currentOpening: currentOpeningRef.current,
      }))
    }

    void runAnalysis()

    return () => {
      analysisAbortRef.current = true
      stop()
    }
  }, [moves, initialFen, analyzePosition, stop])

  // Navigation
  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(-1, Math.min(moves.length - 1, index))
      setCurrentIndex(clamped)
    },
    [moves.length],
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goTo(currentIndex - 1)
      else if (e.key === 'ArrowRight') goTo(currentIndex + 1)
      else if (e.key === 'ArrowUp') goTo(-1)
      else if (e.key === 'ArrowDown') goTo(moves.length - 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentIndex, goTo, moves.length])

  const currentAnalyzed = currentIndex >= 0 ? (analyzedMoves[currentIndex] as AnalyzedMove | null) : null
  const hikaruComment = currentAnalyzed ? getHikaruComment(currentAnalyzed.classification) : null

  // Determine Hikaru Coach avatar based on move classification
  const getHikaruAvatar = (classification?: MoveClassification) => {
    if (!classification) return '/assets/hikaru/good.gif'
    switch (classification) {
      case 'brilliant':
      case 'great':
      case 'best':
        return '/assets/hikaru/brilliant.gif'
      case 'good':
      case 'inaccuracy':
        return '/assets/hikaru/good.gif'
      case 'mistake':
      case 'blunder':
        return '/assets/hikaru/bad.gif'
      default:
        return '/assets/hikaru/good.gif'
    }
  }
  const hikaruAvatar = getHikaruAvatar(currentAnalyzed?.classification)

  // Eval bar score — Stockfish scores are from the side-to-move's perspective.
  // Convert to white's perspective: negate when it's black's turn in the current position.
  const sideToMove = currentFen.split(' ')[1] // 'w' or 'b'
  const sideMultiplier = sideToMove === 'b' ? -1 : 1
  const evalCp = (currentEngineInfo?.score ?? 0) * sideMultiplier
  const rawMate = currentEngineInfo?.mate ?? null
  const evalMate = rawMate !== null ? rawMate * sideMultiplier : null

  // Summary counts
  const classificationCounts = (analyzedMoves as (AnalyzedMove | null)[]).reduce(
    (acc, m) => {
      if (m) acc[m.classification] = (acc[m.classification] ?? 0) + 1
      return acc
    },
    {} as Partial<Record<MoveClassification, number>>,
  )

  if (!game) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-zinc-400">Game not found</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  // Get accuracy from chess.com API if available
  const whiteAccuracy = game?.accuracies?.white ?? 0
  const blackAccuracy = game?.accuracies?.black ?? 0

  console.log('White accuracy value:', whiteAccuracy)
  console.log('Black accuracy value:', blackAccuracy)
  console.log('Has accuracies:', !!game?.accuracies)
  console.log('Accuracies object:', game?.accuracies)

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Full-screen loading screen */}
      {isAnalyzing && (
        <LoadingScreen message="Analyzing with Stockfish..." progress={analysisState.progress} />
      )}

      <AppHeader
        onBack={() => navigate(-1)}
        title={`vs ${game.opponent} (${game.opponentRating})`}
        subtitle={`${game.userColor === 'white' ? '♔' : '♚'} You · ${game.result} · ${game.date}`}
        right={
          <div className="hidden sm:flex items-center gap-1.5">
            {(Object.keys(META) as MoveClassification[]).map((key) => {
              const count = classificationCounts[key]
              if (!count) return null
              return (
                <div key={key} className="flex items-center gap-1">
                  <MoveClassificationBadge classification={key} />
                  <span className="text-xs text-zinc-400">{count}</span>
                </div>
              )
            })}
          </div>
        }
      />

      {/* Main content */}
      <div className="flex-1 w-full px-4 py-4 overflow-hidden flex flex-col lg:flex-row lg:justify-center gap-4 items-stretch">

        {/* Left Column: Analysis & Engine (Desktop only) */}
        <div className="hidden lg:flex flex-col gap-4 w-full lg:max-w-xs lg:shrink-0 overflow-y-auto">
           {/* Current move info */}
           {currentAnalyzed && (
              <div className="space-y-4">
                {/* Hikaru Coach Section */}
                <div className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/20 flex flex-col gap-3 items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/40 overflow-hidden">
                    <img 
                      src={hikaruAvatar} 
                      alt="Hikaru Nakamura"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Hikaru Coach</p>
                    <p className="text-sm text-indigo-100 italic">"{hikaruComment}"</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium">
                      {currentAnalyzed.moveNumber}
                      {currentAnalyzed.color === 'w' ? '.' : '...'}{' '}
                      {currentAnalyzed.san}
                    </span>
                    <MoveClassificationBadge
                      classification={currentAnalyzed.classification}
                      showLabel
                    />
                  </div>
                  {currentAnalyzed.classification !== 'best' &&
                    currentAnalyzed.classification !== 'brilliant' &&
                    currentAnalyzed.bestMoveSan && (
                      <p className="text-xs text-zinc-500">
                        Best: <span className="text-zinc-300 font-mono">{currentAnalyzed.bestMoveSan}</span>
                      </p>
                    )}
                  {currentAnalyzed.cpLoss > 0 && (
                    <p className="text-xs text-zinc-600">
                      −{(currentAnalyzed.cpLoss / 100).toFixed(2)} pawns
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Top engine lines */}
            {currentEngineInfo && currentEngineInfo.lines.length > 0 && (
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Engine Lines</p>
                {currentEngineInfo.lines.map((engineLine) => {
                  const lineCp = engineLine.score * sideMultiplier
                  const lineMate = engineLine.mate !== null ? engineLine.mate * sideMultiplier : null
                  const scoreStr = formatScore(lineCp, lineMate)
                  const san = pvToSan(currentFen, engineLine.moves)
                  return (
                    <div key={engineLine.index} className="flex flex-col gap-0.5 min-w-0 pb-1.5 border-b border-zinc-800/50 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-zinc-600 uppercase">Line {engineLine.index}</span>
                        <span className={`text-xs font-mono tabular-nums ${lineCp >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {scoreStr}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400 font-mono break-words">{san}</span>
                    </div>
                  )
                })}
              </div>
            )}
        </div>

        {/* Center Column: Board */}
        <div className="flex flex-col items-center gap-2 w-full lg:w-auto lg:shrink-0 min-h-0">
          {/* Eval bar + board, bar matches board height */}
          <div className="flex items-stretch gap-2 flex-1 min-h-0">
            <EvaluationBar
              cp={evalCp}
              mate={evalMate}
              orientation={game.userColor}
            />
            {/* Board: outer div constrains size, inner div snaps to multiple of 8 to prevent subpixel gaps */}
            <div
              ref={boardMeasureRef}
              className="min-h-0 min-w-0"
              style={{ width: 'min(100%, calc(100vh - 13rem))', maxWidth: '100%', maxHeight: '100%' }}
            >
              <div style={{ width: boardSize, height: boardSize }}>
                <Chessboard
                  options={{
                    position: currentFen,
                    boardOrientation: game.userColor,
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

          {/* Controls + mobile-only info — constrained to board width on desktop */}
          <div style={{ width: boardSize }}>
            {/* Navigation controls */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => goTo(-1)}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => goTo(currentIndex - 1)}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => goTo(currentIndex + 1)}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => goTo(moves.length - 1)}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Current move info (Mobile only) */}
            {currentAnalyzed && (
              <div className="mt-2 space-y-2 lg:hidden">
                {/* Hikaru Coach Section */}
                <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20 flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/40 overflow-hidden">
                    <img 
                      src={hikaruAvatar} 
                      alt="Hikaru Nakamura"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Hikaru Coach</p>
                    <p className="text-sm text-indigo-100 italic">"{hikaruComment}"</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-medium">
                    {currentAnalyzed.moveNumber}
                    {currentAnalyzed.color === 'w' ? '.' : '...'}{' '}
                    {currentAnalyzed.san}
                  </span>
                  <MoveClassificationBadge
                    classification={currentAnalyzed.classification}
                    showLabel
                  />
                </div>
                {currentAnalyzed.classification !== 'best' &&
                  currentAnalyzed.classification !== 'brilliant' &&
                  currentAnalyzed.bestMoveSan && (
                    <p className="text-xs text-zinc-500">
                      Best: <span className="text-zinc-300 font-mono">{currentAnalyzed.bestMoveSan}</span>
                    </p>
                  )}
                {currentAnalyzed.cpLoss > 0 && (
                  <p className="text-xs text-zinc-600">
                    −{(currentAnalyzed.cpLoss / 100).toFixed(2)} pawns
                  </p>
                )}
                </div>
              </div>
            )}

            {/* Top engine lines (Mobile only) */}
            {currentEngineInfo && currentEngineInfo.lines.length > 0 && (
              <div className="mt-2 p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5 lg:hidden">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Engine Lines</p>
                {currentEngineInfo.lines.map((engineLine) => {
                  const lineCp = engineLine.score * sideMultiplier
                  const lineMate = engineLine.mate !== null ? engineLine.mate * sideMultiplier : null
                  const scoreStr = formatScore(lineCp, lineMate)
                  const san = pvToSan(currentFen, engineLine.moves)
                  return (
                    <div key={engineLine.index} className="flex items-baseline gap-2 min-w-0">
                      <span className="text-xs text-zinc-600 shrink-0 w-10">Line {engineLine.index}</span>
                      <span className={`text-xs font-mono shrink-0 tabular-nums ${lineCp >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {scoreStr}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono truncate">{san}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Move list and evaluation graph — fills remaining width up to a max, then centers */}
        <div className="w-full flex flex-col gap-4 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden lg:flex-1 lg:max-w-xs lg:self-stretch" style={{ height: 'calc(100vh - 13rem)' }}>
          <div className="p-3 border-b border-zinc-800 shrink-0">
            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Analysis</h3>
          </div>
          <div className="flex-1 min-h-0 flex flex-col gap-4 p-3 overflow-hidden">
            {/* Opening name header */}
            {analysisState.currentOpening && (
              <div className="shrink-0">
                <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                  <span>Opening:</span>
                  <span className="text-white">{analysisState.currentOpening}</span>
                </h4>
              </div>
            )}

            {/* Move list */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <MoveList
                moves={moves}
                analyzedMoves={analyzedMoves as (AnalyzedMove | null)[]}
                currentMoveIndex={currentIndex}
                onMoveClick={setCurrentIndex}
              />
            </div>

            {/* Evaluation graph */}
            {analyzedMoves.length > 0 && analyzedMoves.filter((m): m is NonNullable<typeof m> => m !== null).length > 0 && (
              <div className="shrink-0">
                <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Evaluation</h4>

                {/* Accuracy percentages */}
                <div className="flex gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>White</span>
                      <span>{whiteAccuracy.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-500"
                        style={{ width: `${whiteAccuracy}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>Black</span>
                      <span>{blackAccuracy.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-zinc-300 transition-all duration-500"
                        style={{ width: `${blackAccuracy}%` }}
                      />
                    </div>
                  </div>
                </div>

                <EvaluationGraph
                  evaluations={analyzedMoves
                    .map(m => m?.cpBefore ?? 0)
                    .map(cp => Math.max(-1000, Math.min(1000, cp))) // Cap at ±10 pawns (1000 cp)
                  }
                  moveNumbers={analyzedMoves.map(m => m?.moveNumber ?? 0)}
                  currentMoveIndex={currentIndex}
                  height={150}
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
