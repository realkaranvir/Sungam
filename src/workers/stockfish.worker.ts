let sfWorker: Worker | null = null

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data as {
    type: string
    payload?: { fen?: string; depth?: number }
  }

  if (type === 'INIT') {
    sfWorker = new Worker('/stockfish.js')
    sfWorker.onmessage = (sfEvent: MessageEvent) => {
      const line = sfEvent.data as string
      if (line === 'readyok') {
        self.postMessage({ type: 'READY' })
      }
      self.postMessage({ type: 'ENGINE_OUTPUT', line })
    }
    sfWorker.postMessage('uci')
    sfWorker.postMessage('setoption name MultiPV value 2')
    sfWorker.postMessage('setoption name Threads value 1')
    sfWorker.postMessage('isready')
  }

  if (type === 'ANALYZE' && payload?.fen) {
    sfWorker?.postMessage('stop')
    sfWorker?.postMessage(`position fen ${payload.fen}`)
    sfWorker?.postMessage(`go depth ${payload.depth ?? 18}`)
  }

  if (type === 'STOP') {
    sfWorker?.postMessage('stop')
  }

  if (type === 'TERMINATE') {
    sfWorker?.terminate()
    sfWorker = null
  }
}
