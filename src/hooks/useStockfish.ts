import { useEffect, useRef, useCallback } from 'react'
import type { EngineInfo, EngineLine } from '@/types'
import { parseInfoLine } from '@/lib/parseEngineOutput'

interface StoredLine {
  score: number
  mate: number | null
  pvMoves: string[]
}

interface PendingAnalysis {
  resolve: (info: EngineInfo) => void
  reject: (err: Error) => void
  // depth -> pvIndex -> best stored line at that depth
  linesAtDepth: Map<number, Map<number, StoredLine>>
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
        worker.postMessage('setoption name MultiPV value 3')
        worker.postMessage('setoption name Threads value 1')
        worker.postMessage('setoption name Hash value 16')
        worker.postMessage('isready')
        return
      }

      const pending = pendingRef.current
      if (!pending) return

      // Collect info lines and store per depth/pvIndex
      if (line.startsWith('info ')) {
        const parsed = parseInfoLine(line)
        if (parsed) {
          const { pvIndex, info, pvMoves } = parsed
          let depthMap = pending.linesAtDepth.get(info.depth)
          if (!depthMap) {
            depthMap = new Map()
            pending.linesAtDepth.set(info.depth, depthMap)
          }
          depthMap.set(pvIndex, { score: info.score, mate: info.mate, pvMoves })
        }
      }

      // Analysis complete
      if (line.startsWith('bestmove')) {
        const bestParts = line.split(' ')
        const bestMoveUci = bestParts[1] ?? ''

        // Find the deepest depth that has a pvIndex=1 entry
        let deepestDepth = 0
        for (const [depth, pvMap] of pending.linesAtDepth) {
          if (pvMap.has(1) && depth > deepestDepth) deepestDepth = depth
        }

        const depthMap = pending.linesAtDepth.get(deepestDepth)
        const best = depthMap?.get(1)
        const secondData = depthMap?.get(2)

        if (best) {
          // Build the lines array (up to 3)
          const lines: EngineLine[] = []
          for (let idx = 1; idx <= 3; idx++) {
            const lineData = depthMap?.get(idx)
            if (lineData) {
              lines.push({
                index: idx,
                score: lineData.score,
                mate: lineData.mate,
                moves: lineData.pvMoves,
              })
            }
          }

          const result: EngineInfo = {
            depth: deepestDepth,
            score: best.score,
            mate: best.mate,
            pv: bestMoveUci || best.pvMoves[0] || '',
            secondScore: secondData ? secondData.score : null,
            lines,
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
          linesAtDepth: new Map(),
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
