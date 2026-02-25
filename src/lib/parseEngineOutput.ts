import type { EngineInfo } from '@/types'

type InfoHandler = (info: EngineInfo) => void
type BestMoveHandler = (move: string) => void

export function parseEngineOutput(
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
