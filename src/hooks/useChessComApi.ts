import { useState, useCallback } from 'react'
import type { ChessComGame, ProcessedGame } from '@/types'

const BASE_URL = 'https://api.chess.com/pub'
const HEADERS = {
  'User-Agent': 'Sungam Chess Review App - github.com/sungam (chess-review-tool)',
}

export function useChessComApi() {
  const [games, setGames] = useState<ProcessedGame[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGames = useCallback(async (username: string) => {
    if (!username.trim()) return
    setLoading(true)
    setError(null)
    setGames([])

    try {
      const archivesRes = await fetch(
        `${BASE_URL}/player/${username.toLowerCase()}/games/archives`,
        { headers: HEADERS }
      )

      if (archivesRes.status === 404) {
        throw new Error(`Player "${username}" not found on Chess.com`)
      }
      if (!archivesRes.ok) {
        throw new Error('Failed to reach Chess.com API. Try again later.')
      }

      const { archives } = (await archivesRes.json()) as { archives: string[] }

      if (!archives || archives.length === 0) {
        throw new Error('No games found for this player.')
      }

      // Try to get enough games — work backwards through archives
      let allGames: ChessComGame[] = []
      for (let i = archives.length - 1; i >= 0 && allGames.length < 10; i--) {
        const gamesRes = await fetch(archives[i], { headers: HEADERS })
        if (!gamesRes.ok) continue
        const { games: rawGames } = (await gamesRes.json()) as {
          games: ChessComGame[]
        }
        allGames = [...rawGames, ...allGames]
      }

      const last10 = allGames.slice(-10).reverse()
      setGames(last10.map((g) => processGame(g, username)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }, [])

  return { games, loading, error, fetchGames }
}

function processGame(game: ChessComGame, username: string): ProcessedGame {
  const isWhite =
    game.white.username.toLowerCase() === username.toLowerCase()
  const userSide = isWhite ? game.white : game.black
  const opponentSide = isWhite ? game.black : game.white

  const result: 'win' | 'loss' | 'draw' =
    userSide.result === 'win'
      ? 'win'
      : opponentSide.result === 'win'
      ? 'loss'
      : 'draw'

  const timeControl = formatTimeControl(game.time_control)

  return {
    id: game.url.split('/').pop() ?? game.url,
    opponent: opponentSide.username,
    opponentRating: opponentSide.rating,
    userColor: isWhite ? 'white' : 'black',
    result,
    timeControl,
    date: new Date(game.end_time * 1000),
    pgn: game.pgn,
    userRating: userSide.rating,
  }
}

function formatTimeControl(tc: string): string {
  if (tc === '-') return 'Unlimited'
  const parts = tc.split('+')
  const base = parseInt(parts[0])
  const increment = parts[1] ? parseInt(parts[1]) : 0

  if (base >= 3600) return `${base / 3600}h${increment ? `+${increment}` : ''}`
  if (base >= 60) return `${base / 60}m${increment ? `+${increment}` : ''}`
  return tc
}
