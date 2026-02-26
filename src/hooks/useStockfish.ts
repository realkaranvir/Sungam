import { useEffect, useRef, useCallback } from 'react'
import type { EngineInfo } from '@/types'
import { parseInfoLine } from '@/lib/parseEngineOutput'

interface PendingAnalysis {
  resolve: (info: EngineInfo) => void
  reject: (err: Error) => void
  lines: string[]
  bestAtDepth: Map<number, EngineInfo>
  secondAtDepth: Map<number, { score: number; depth: number }>
}

export function useStockfish() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef<PendingAnalysis | null>(null)
  const readyRef = useRef(false)
  const readyResolversRef = useRef<Array<() => void>>([])

  useEffect(() => {
    const worker = new Worker('/stockfish-18-lite-single.js')
    workerRef.current = worker

    worker.onmessage = (e: MessageEvent<string>) => {
      const line = e.data
      if (typeof line !== 'string') return

      // Engine ready
      if (line === 'readyok') {
        readyRef.current = true
        readyResolversRef.current.forEach((r) => r())
        readyResolversRef.current = []
        return
      }

      // uciok - send setoption then isready
      if (line === 'uciok') {
        worker.postMessage('setoption name MultiPV value 2')
        worker.postMessage('setoption name Threads value 1')
        worker.postMessage('setoption name Hash value 16')
        worker.postMessage('isready')
        return
      }

      const pending = pendingRef.current
      if (!pending) return

      // Collect info lines
      if (line.startsWith('info ')) {
        pending.lines.push(line)
        const parsed = parseInfoLine(line)
        if (parsed) {
          const { pvIndex, info } = parsed
          if (pvIndex === 1) {
            pending.bestAtDepth.set(info.depth, info)
          } else if (pvIndex === 2) {
            pending.secondAtDepth.set(info.depth, { score: info.score, depth: info.depth })
          }
        }
      }

      // Analysis complete
      if (line.startsWith('bestmove')) {
        const bestParts = line.split(' ')
        const bestMoveUci = bestParts[1] ?? ''

        // Find the deepest completed depth
        let deepestDepth = 0
        for (const depth of pending.bestAtDepth.keys()) {
          if (depth > deepestDepth) deepestDepth = depth
        }

        const best = pending.bestAtDepth.get(deepestDepth)
        const second = pending.secondAtDepth.get(deepestDepth)

        if (best) {
          const result: EngineInfo = {
            ...best,
            pv: bestMoveUci || best.pv,
            secondScore: second ? second.score : null,
          }
          pending.resolve(result)
        } else {
          pending.reject(new Error('No engine output received'))
        }
        pendingRef.current = null
      }
    }

    worker.onerror = (e) => {
      console.error('Stockfish worker error:', e)
      const pending = pendingRef.current
      if (pending) {
        pending.reject(new Error(`Engine error: ${e.message}`))
        pendingRef.current = null
      }
    }

    // Initialize engine
    worker.postMessage('uci')

    return () => {
      worker.terminate()
      workerRef.current = null
      readyRef.current = false
    }
  }, [])

  const waitForReady = useCallback((): Promise<void> => {
    if (readyRef.current) return Promise.resolve()
    return new Promise((resolve) => {
      readyResolversRef.current.push(resolve)
    })
  }, [])

  const analyzePosition = useCallback(
    async (fen: string, depth = 16): Promise<EngineInfo> => {
      const worker = workerRef.current
      if (!worker) throw new Error('Engine not initialized')

      await waitForReady()

      // Cancel any pending analysis
      if (pendingRef.current) {
        worker.postMessage('stop')
        pendingRef.current = null
      }

      return new Promise((resolve, reject) => {
        pendingRef.current = {
          resolve,
          reject,
          lines: [],
          bestAtDepth: new Map(),
          secondAtDepth: new Map(),
        }

        worker.postMessage(`position fen ${fen}`)
        worker.postMessage(`go depth ${depth}`)
      })
    },
    [waitForReady],
  )

  const stop = useCallback(() => {
    const worker = workerRef.current
    if (worker) {
      worker.postMessage('stop')
    }
    pendingRef.current = null
  }, [])

  return { analyzePosition, stop }
}
