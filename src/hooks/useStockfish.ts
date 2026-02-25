import { useEffect, useRef, useCallback, useState } from 'react'
import type { EngineInfo } from '@/types'
import { parseEngineOutput } from '@/lib/parseEngineOutput'

type InfoHandler = (info: EngineInfo) => void
type BestMoveHandler = (move: string) => void

const wasmSupported =
  typeof WebAssembly === 'object' &&
  WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00))

export function useStockfish() {
  const workerRef = useRef<Worker | null>(null)
  const [isReady, setIsReady] = useState(false)
  const infoHandlerRef = useRef<InfoHandler | null>(null)
  const bestMoveHandlerRef = useRef<BestMoveHandler | null>(null)

  useEffect(() => {
    const worker = new Worker(wasmSupported ? '/stockfish.wasm.js' : '/stockfish.js')

    worker.onmessage = (e: MessageEvent) => {
      const line = e.data as string
      if (line === 'readyok') {
        setIsReady(true)
      }
      parseEngineOutput(line, infoHandlerRef.current, bestMoveHandlerRef.current)
    }

    worker.postMessage('uci')
    worker.postMessage('setoption name MultiPV value 2')
    worker.postMessage('setoption name Threads value 1')
    worker.postMessage('isready')
    workerRef.current = worker

    return () => {
      worker.postMessage('quit')
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
      workerRef.current?.postMessage('stop')
      workerRef.current?.postMessage(`position fen ${fen}`)
      workerRef.current?.postMessage(`go depth ${depth}`)
    },
    []
  )

  const stop = useCallback(() => {
    workerRef.current?.postMessage('stop')
  }, [])

  const analyzePosition = useCallback(
    (fen: string, depth = 18): Promise<{ info: EngineInfo; bestMove: string }> => {
      return new Promise((resolve) => {
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

