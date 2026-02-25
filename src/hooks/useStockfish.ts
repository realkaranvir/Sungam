import { useEffect, useRef, useCallback, useState } from 'react'
import type { EngineInfo } from '@/types'

type InfoHandler = (info: EngineInfo) => void
type BestMoveHandler = (move: string) => void

export function useStockfish() {
  const workerRef = useRef<Worker | null>(null)
  const [isReady, setIsReady] = useState(false)
  const infoHandlerRef = useRef<InfoHandler | null>(null)
  const bestMoveHandlerRef = useRef<BestMoveHandler | null>(null)

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/stockfish.worker.ts', import.meta.url),
      { type: 'module' }
    )

    worker.onmessage = (e: MessageEvent) => {
      const { type, line } = e.data as { type: string; line: string }

      if (type === 'READY') {
        setIsReady(true)
      }

      if (type === 'ENGINE_OUTPUT' && line) {
        parseEngineOutput(line, infoHandlerRef.current, bestMoveHandlerRef.current)
      }
    }

    worker.postMessage({ type: 'INIT' })
    workerRef.current = worker

    return () => {
      worker.postMessage({ type: 'TERMINATE' })
      worker.terminate()
    }
  }, [])

  const analyze = useCallback(
    (
      fen: string,
      depth: number,
      onInfo: InfoHandler,
      onBestMove: BestMoveHandler
    ) => {
      infoHandlerRef.current = onInfo
      bestMoveHandlerRef.current = onBestMove
      workerRef.current?.postMessage({ type: 'ANALYZE', payload: { fen, depth } })
    },
    []
  )

  const stop = useCallback(() => {
    workerRef.current?.postMessage({ type: 'STOP' })
  }, [])

  const analyzePosition = useCallback(
    (fen: string, depth = 18): Promise<{ info: EngineInfo; bestMove: string }> => {
      return new Promise((resolve) => {
        // Track best (multipv 1) and second-best (multipv 2) separately
        let bestInfo: EngineInfo | null = null
        let secondScore: number | null = null

        const onInfo: InfoHandler = (info) => {
          if (info.multipv === 1) bestInfo = info
          if (info.multipv === 2) secondScore = info.score
        }

        const onBestMove: BestMoveHandler = (move) => {
          const base = bestInfo ?? { depth: 0, score: 0, mate: null, pv: '', multipv: 1 }
          resolve({
            info: { ...base, secondScore },
            bestMove: move,
          })
        }

        analyze(fen, depth, onInfo, onBestMove)
      })
    },
    [analyze]
  )

  return { isReady, analyze, stop, analyzePosition }
}

function parseEngineOutput(
  line: string,
  onInfo: InfoHandler | null,
  onBestMove: BestMoveHandler | null
) {
  if (line.startsWith('info') && line.includes('score') && !line.includes('lowerbound') && !line.includes('upperbound')) {
    const depthMatch = line.match(/depth (\d+)/)
    const cpMatch = line.match(/score cp (-?\d+)/)
    const mateMatch = line.match(/score mate (-?\d+)/)
    const pvMatch = line.match(/ pv (.+)/)
    const multipvMatch = line.match(/multipv (\d+)/)

    const info: EngineInfo = {
      depth: depthMatch ? parseInt(depthMatch[1]) : 0,
      score: cpMatch ? parseInt(cpMatch[1]) : 0,
      mate: mateMatch ? parseInt(mateMatch[1]) : null,
      pv: pvMatch ? pvMatch[1].trim() : '',
      secondScore: null,
      multipv: multipvMatch ? parseInt(multipvMatch[1]) : 1,
    }

    onInfo?.(info)
  }

  if (line.startsWith('bestmove')) {
    const parts = line.split(' ')
    if (parts[1] && parts[1] !== '(none)') {
      onBestMove?.(parts[1])
    } else {
      onBestMove?.('')
    }
  }
}
