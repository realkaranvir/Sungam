let sfWorker: Worker | null = null

const wasmSupported =
  typeof WebAssembly === 'object' &&
  WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00))

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data as {
    type: string
    payload?: { fen?: string; depth?: number }
  }

  if (type === 'INIT') {
    sfWorker = new Worker(wasmSupported ? '/stockfish.wasm.js' : '/stockfish.js')
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
