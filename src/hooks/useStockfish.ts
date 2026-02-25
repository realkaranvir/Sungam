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
  // When true, the next bestmove is from a stop command — ignore it
  const ignoreBestMoveRef = useRef(false)

  useEffect(() => {
    const worker = new Worker(wasmSupported ? '/stockfish.wasm.js' : '/stockfish.js')

    worker.onmessage = (e: MessageEvent) => {
      const line = e.data as string
      if (line === 'readyok') {
        setIsReady(true)
      }
      if (line.startsWith('bestmove') && ignoreBestMoveRef.current) {
        ignoreBestMoveRef.current = false
        return
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

  const analyzePosition = useCallback(
    (fen: string, depth = 16): Promise<{ info: EngineInfo; bestMove: string }> => {
      return new Promise((resolve) => {
        let bestInfo: EngineInfo | null = null
        let secondScore: number | null = null

        infoHandlerRef.current = (info) => {
          if (info.multipv === 1) bestInfo = info
          if (info.multipv === 2) secondScore = info.score
        }

        bestMoveHandlerRef.current = (move) => {
          const base = bestInfo ?? { depth: 0, score: 0, mate: null, pv: '', multipv: 1 }
          resolve({
            info: { ...base, secondScore },
            bestMove: move,
          })
        }

        // If a search is running, stop it — but ignore the bestmove that stop emits
        if (bestInfo !== null || ignoreBestMoveRef.current) {
          ignoreBestMoveRef.current = true
          workerRef.current?.postMessage('stop')
        }

        workerRef.current?.postMessage(`position fen ${fen}`)
        workerRef.current?.postMessage(`go depth ${depth}`)
      })
    },
    []
  )

  const stop = useCallback(() => {
    ignoreBestMoveRef.current = true
    workerRef.current?.postMessage('stop')
  }, [])

  return { isReady, analyzePosition, stop }
}
