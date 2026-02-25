import { useEffect, useState, useCallback, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { useChessGame } from '@/hooks/useChessGame'
import { useStockfish } from '@/hooks/useStockfish'
import { classifyMove } from '@/lib/moveClassifier'
import { EvaluationBar } from '@/components/EvaluationBar'
import { MoveList } from '@/components/MoveList'
import { MoveClassificationBadge } from '@/components/MoveClassificationBadge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import type { AnalyzedMove, EngineInfo, ProcessedGame } from '@/types'
import { CLASSIFICATION_META } from '@/lib/moveClassifier'

export function ReviewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  useParams<{ gameId: string }>()
  const game = location.state?.game as ProcessedGame | undefined

  const [analysisPhase, setAnalysisPhase] = useState<'idle' | 'analyzing' | 'done'>('idle')
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentEngineInfo, setCurrentEngineInfo] = useState<EngineInfo | null>(null)
  const [perMoveEvals, setPerMoveEvals] = useState<(EngineInfo | null)[]>([])
  const analysisRunning = useRef(false)

  // Board size — driven by container width via ResizeObserver
  const boardContainerRef = useRef<HTMLDivElement>(null)
  const [boardSize, setBoardSize] = useState(480)

  const pgn = game?.pgn ?? ''
  const orientation = game?.userColor ?? 'white'

  const {
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
  } = useChessGame(pgn)

  const { isReady, analyzePosition } = useStockfish()

  // Resize observer: board fills its container.
  // Subtract the eval bar width (w-6 = 24px) + gap (8px) so the chessboard itself is square.
  const EVAL_BAR_TOTAL = 24 + 8 // w-6 + gap-2
  useEffect(() => {
    const el = boardContainerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      const availableForBoard = width - EVAL_BAR_TOTAL
      setBoardSize(Math.floor(Math.min(availableForBoard, height)))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Update engine info display when navigating moves
  useEffect(() => {
    const idx = currentMoveIndex + 1
    if (perMoveEvals[idx] !== undefined) {
      setCurrentEngineInfo(perMoveEvals[idx])
    }
  }, [currentMoveIndex, perMoveEvals])

  // Run full analysis when engine is ready
  useEffect(() => {
    if (!isReady || fens.length === 0 || analysisRunning.current) return
    if (analysisPhase !== 'idle') return
    if (moves.length === 0) return

    analysisRunning.current = true
    setAnalysisPhase('analyzing')

    runAnalysis()

    async function runAnalysis() {
      const evals: EngineInfo[] = []

      for (let i = 0; i < fens.length; i++) {
        try {
          const { info } = await analyzePosition(fens[i], 16)
          const isBlackToMove = fens[i].split(' ')[1] === 'b'
          const normalized: EngineInfo = {
            ...info,
            score: isBlackToMove ? -info.score : info.score,
            mate: info.mate !== null && isBlackToMove ? -info.mate : info.mate,
            secondScore:
              info.secondScore !== null
                ? isBlackToMove ? -info.secondScore : info.secondScore
                : null,
          }
          evals.push(normalized)
        } catch {
          evals.push({ depth: 0, score: 0, mate: null, pv: '', secondScore: null })
        }
        setAnalysisProgress(Math.round(((i + 1) / fens.length) * 100))
      }

      setPerMoveEvals(evals)

      const classified: AnalyzedMove[] = moves.map((move, idx) => {
        const evalBefore = evals[idx]
        const evalAfter = evals[idx + 1]
        if (!evalBefore || !evalAfter) return null

        const isBlackMove = move.color === 'b'
        const cpBefore = isBlackMove ? -evalBefore.score : evalBefore.score
        const cpAfter = isBlackMove ? -evalAfter.score : evalAfter.score
        const cpLoss = cpBefore - cpAfter

        const bestMoveUci = evalBefore.pv.split(' ')[0] ?? ''
        let bestMoveSan = ''
        try {
          const chess = new Chess(fens[idx])
          const result = chess.move({
            from: bestMoveUci.slice(0, 2),
            to: bestMoveUci.slice(2, 4),
            promotion: bestMoveUci[4] ?? undefined,
          })
          bestMoveSan = result?.san ?? ''
        } catch { /* ignore */ }

        const isBestMove = move.san === bestMoveSan

        let secondBestGap: number | null = null
        if (evalBefore.secondScore !== null) {
          const bestFromMover = isBlackMove ? -evalBefore.score : evalBefore.score
          const secondFromMover = isBlackMove ? -evalBefore.secondScore : evalBefore.secondScore
          secondBestGap = bestFromMover - secondFromMover
        }

        return {
          san: move.san,
          fen: fens[idx + 1],
          moveNumber: Math.floor(idx / 2) + 1,
          color: isBlackMove ? 'black' : 'white',
          cpBefore,
          cpAfter,
          cpLoss,
          classification: classifyMove(cpLoss, isBestMove, secondBestGap, cpBefore),
          bestMoveSan,
          bestMoveUci,
        } satisfies AnalyzedMove
      }).filter((m): m is AnalyzedMove => m !== null)

      setAnalyzedMoves(classified)
      setAnalysisPhase('done')
      analysisRunning.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, fens, moves])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === 'ArrowRight') { e.preventDefault(); goForward() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goBack() }
      if (e.key === 'ArrowUp') { e.preventDefault(); goToStart() }
      if (e.key === 'ArrowDown') { e.preventDefault(); goToEnd() }
    },
    [goForward, goBack, goToStart, goToEnd]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">No game data found.</p>
          <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </div>
    )
  }

  const highlightSquares: Record<string, { background: string }> = {}
  if (lastMoveSquares) {
    highlightSquares[lastMoveSquares.from] = { background: 'rgba(255, 255, 100, 0.18)' }
    highlightSquares[lastMoveSquares.to] = { background: 'rgba(255, 255, 100, 0.3)' }
  }

  const currentAnalyzedMove = currentMoveIndex >= 0 ? analyzedMoves[currentMoveIndex] : null
  const currentEvalInfo = perMoveEvals[currentMoveIndex + 1] ?? currentEngineInfo

  const classificationCounts = analyzedMoves.reduce(
    (acc, m) => { acc[m.classification] = (acc[m.classification] ?? 0) + 1; return acc },
    {} as Record<string, number>
  )

  const engineStatusText =
    analysisPhase === 'analyzing' ? `${analysisProgress}%` :
    analysisPhase === 'done' ? 'Done' :
    !isReady ? 'Loading…' : ''

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <header className="shrink-0 border-b border-zinc-800 px-3 py-2 flex items-center gap-2">
        <Button
          variant="ghost" size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0 text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 w-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-white text-sm truncate">
              {game.userColor === 'white' ? '♔' : '♚'} vs {game.opponent}
            </span>
            <span className={`text-xs font-medium shrink-0 ${
              game.result === 'win' ? 'text-green-400' :
              game.result === 'loss' ? 'text-red-400' : 'text-zinc-400'
            }`}>
              {game.result === 'win' ? 'Win' : game.result === 'loss' ? 'Loss' : 'Draw'}
            </span>
          </div>
          <div className="text-[11px] text-zinc-500 leading-tight">
            {game.timeControl} · {game.date.toLocaleDateString()}
          </div>
        </div>

        {engineStatusText && (
          <span className="shrink-0 text-[11px] text-zinc-600 font-mono">{engineStatusText}</span>
        )}
      </header>

      {/* Analysis progress bar */}
      {analysisPhase === 'analyzing' && (
        <Progress value={analysisProgress} className="h-0.5 shrink-0 rounded-none bg-zinc-900" />
      )}

      {/* ── Main area: board + sidebar ── */}
      {/*
        Desktop (md+): row layout — board fills left, move list on right (fixed w-56)
        Mobile: column layout — board on top, controls + move list below
      */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* Board column */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0">

          {/* Board + eval bar — this div grows to fill available space */}
          <div ref={boardContainerRef} className="flex-1 flex items-center justify-center p-2 min-h-0 overflow-hidden">
            <div
              className="flex gap-2 items-stretch"
              style={{ height: boardSize }}
            >
              {/* Eval bar — stretches to board height */}
              <EvaluationBar engineInfo={currentEvalInfo ?? null} orientation={orientation} />

              {/* Board — exact square */}
              <div style={{ width: boardSize, height: boardSize }} className="shrink-0">
                <Chessboard
                  options={{
                    position: currentFen,
                    boardOrientation: orientation,
                    allowDragging: false,
                    squareStyles: highlightSquares,
                    boardStyle: {
                      borderRadius: '4px',
                      boxShadow: '0 4px 32px rgba(0,0,0,0.6)',
                    },
                    darkSquareStyle: { backgroundColor: '#3d4a60' },
                    lightSquareStyle: { backgroundColor: '#8fa0b8' },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Move info + controls — fixed height below board */}
          <div className="shrink-0 px-3 pb-2 space-y-1.5">
            {/* Current move classification */}
            <div className="flex items-center justify-between min-h-[1.75rem]">
              <div className="flex items-center gap-2 text-sm">
                {currentAnalyzedMove ? (
                  <>
                    <MoveClassificationBadge
                      classification={currentAnalyzedMove.classification}
                      cpLoss={currentAnalyzedMove.cpLoss}
                      size="md"
                    />
                    <span className="font-mono font-medium text-white">
                      {currentAnalyzedMove.san}
                    </span>
                    <span className="text-zinc-500">
                      {CLASSIFICATION_META[currentAnalyzedMove.classification].label}
                    </span>
                    {currentAnalyzedMove.cpLoss > 10 && currentAnalyzedMove.bestMoveSan && (
                      <span className="text-zinc-600 text-xs hidden sm:inline">
                        Best: {currentAnalyzedMove.bestMoveSan}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-zinc-600 text-sm">
                    {currentMoveIndex === -1 ? 'Starting position' : ''}
                  </span>
                )}
              </div>
              {/* Eval score */}
              {currentEvalInfo && (
                <span className="text-sm font-mono text-zinc-400 tabular-nums">
                  {currentEvalInfo.mate !== null
                    ? currentEvalInfo.mate > 0 ? `+M${currentEvalInfo.mate}` : `-M${Math.abs(currentEvalInfo.mate)}`
                    : (currentEvalInfo.score >= 0 ? '+' : '') + (currentEvalInfo.score / 100).toFixed(1)}
                </span>
              )}
            </div>

            {/* Nav controls */}
            <div className="flex items-center justify-center gap-1">
              <Button variant="ghost" size="icon"
                onClick={goToStart} disabled={currentMoveIndex === -1}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 h-9 w-9"
              >
                <ChevronsLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon"
                onClick={goBack} disabled={currentMoveIndex === -1}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 h-9 w-9"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-xs text-zinc-600 w-24 text-center font-mono tabular-nums">
                {currentMoveIndex === -1 ? 'Start' : `${currentMoveIndex + 1} / ${moves.length}`}
              </span>
              <Button variant="ghost" size="icon"
                onClick={goForward} disabled={currentMoveIndex === moves.length - 1}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 h-9 w-9"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon"
                onClick={goToEnd} disabled={currentMoveIndex === moves.length - 1}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 h-9 w-9"
              >
                <ChevronsRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Summary stats */}
            {analysisPhase === 'done' && analyzedMoves.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center">
                {(['brilliant', 'great', 'best', 'good', 'inaccuracy', 'mistake', 'blunder'] as const).map((cls) => {
                  const count = classificationCounts[cls] ?? 0
                  if (count === 0) return null
                  const meta = CLASSIFICATION_META[cls]
                  return (
                    <div key={cls}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${meta.bgColor} ${meta.borderColor}`}
                    >
                      <span className={`font-bold font-mono ${meta.color}`}>{meta.icon}</span>
                      <span className="text-zinc-400">{count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Mobile: move list inline below controls */}
          <div className="md:hidden shrink-0 h-36 border-t border-zinc-800 overflow-hidden">
            <MoveList
              moves={moves}
              analyzedMoves={analyzedMoves}
              currentMoveIndex={currentMoveIndex}
              onMoveClick={goToMove}
            />
          </div>
        </div>

        {/* Desktop sidebar: move list */}
        <div className="hidden md:flex w-52 shrink-0 border-l border-zinc-800 flex-col">
          <div className="px-3 py-2 border-b border-zinc-800 shrink-0">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Moves</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <MoveList
              moves={moves}
              analyzedMoves={analyzedMoves}
              currentMoveIndex={currentMoveIndex}
              onMoveClick={goToMove}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
