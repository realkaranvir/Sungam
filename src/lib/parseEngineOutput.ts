import type { EngineInfo } from '@/types'

/**
 * Parse a single UCI "info" line from Stockfish.
 * Returns the pvIndex, a partial EngineInfo, and the full PV as a UCI move array.
 * Returns null if the line isn't an info line with a score.
 */
export function parseInfoLine(
  line: string,
): { pvIndex: number; info: EngineInfo; pvMoves: string[] } | null {
  if (!line.startsWith('info ')) return null

  const depthMatch = line.match(/\bdepth (\d+)/)
  const multipvMatch = line.match(/\bmultipv (\d+)/)
  const scoreMatch = line.match(/\bscore (cp|mate) (-?\d+)/)

  if (!scoreMatch || !depthMatch) return null

  const depth = parseInt(depthMatch[1], 10)
  const pvIndex = multipvMatch ? parseInt(multipvMatch[1], 10) : 1
  const scoreType = scoreMatch[1]
  const scoreValue = parseInt(scoreMatch[2], 10)

  // Extract the full PV: everything after " pv "
  const pvStart = line.indexOf(' pv ')
  const pvMoves = pvStart !== -1 ? line.slice(pvStart + 4).trim().split(/\s+/).filter(Boolean) : []
  const pv = pvMoves[0] ?? ''

  let score = 0
  let mate: number | null = null

  if (scoreType === 'cp') {
    score = scoreValue
  } else {
    mate = scoreValue
    score = scoreValue > 0 ? 100000 - scoreValue : -100000 - scoreValue
  }

  return {
    pvIndex,
    pvMoves,
    info: {
      depth,
      score,
      mate,
      pv,
      secondScore: null,
      lines: [],
    },
  }
}

/**
 * Parse all info lines from a batch of UCI output lines.
 * Returns the best (multipv 1) engine info at the deepest depth, with secondScore set.
 */
export function parseEngineOutput(lines: string[]): EngineInfo | null {
  let best: EngineInfo | null = null
  let second: EngineInfo | null = null
  let bestDepth = 0

  for (const line of lines) {
    const parsed = parseInfoLine(line)
    if (!parsed) continue

    const { pvIndex, info } = parsed

    if (pvIndex === 1 && info.depth >= bestDepth) {
      bestDepth = info.depth
      best = info
    } else if (pvIndex === 2) {
      second = info
    }
  }

  if (!best) return null

  return {
    ...best,
    secondScore: second ? second.score : null,
    lines: [],
  }
}
