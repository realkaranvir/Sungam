import { useState, useCallback } from 'react'
import type { ProcessedGame, ChessComArchive, ChessComRawGame } from '@/types'

function processGame(game: ChessComRawGame, username: string): ProcessedGame {
  const userLower = username.toLowerCase()
  const isWhite = game.white.username.toLowerCase() === userLower
  const userSide = isWhite ? game.white : game.black
  const opponentSide = isWhite ? game.black : game.white

  let result: 'win' | 'loss' | 'draw'
  if (userSide.result === 'win') result = 'win'
  else if (
    userSide.result === 'checkmated' ||
    userSide.result === 'resigned' ||
    userSide.result === 'timeout' ||
    userSide.result === 'abandoned' ||
    userSide.result === 'lose' ||
    userSide.result === 'timevsinsufficient'
  ) {
    result = 'loss'
  } else {
    result = 'draw'
  }

  const date = new Date(game.end_time * 1000)
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  // Extract game ID from URL
  const id = game.url.split('/').pop() ?? game.url

  return {
    id,
    opponent: opponentSide.username,
    opponentRating: opponentSide.rating,
    userColor: isWhite ? 'white' : 'black',
    result,
    timeControl: game.time_control,
    date: dateStr,
    pgn: game.pgn,
    userRating: userSide.rating,
  }
}

function formatArchiveUrl(username: string, year: number, month: number): string {
  const mm = String(month).padStart(2, '0')
  return `https://api.chess.com/pub/player/${username}/games/${year}/${mm}`
}

export function useChessComApi() {
  const [games, setGames] = useState<ProcessedGame[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGames = useCallback(async (username: string) => {
    setLoading(true)
    setError(null)
    setGames([])

    try {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1 // 1-indexed

      // Try current month, then previous month
      const monthsToTry = [
        { year: currentYear, month: currentMonth },
        {
          year: currentMonth === 1 ? currentYear - 1 : currentYear,
          month: currentMonth === 1 ? 12 : currentMonth - 1,
        },
      ]

      let allGames: ChessComRawGame[] = []

      for (const { year, month } of monthsToTry) {
        const url = formatArchiveUrl(username.toLowerCase(), year, month)
        try {
          const res = await fetch(url, {
            headers: {
              'User-Agent': 'Sungam Chess Review App',
            },
          })
          if (!res.ok) continue
          const data: ChessComArchive = await res.json()
          if (data.games && data.games.length > 0) {
            allGames = [...allGames, ...data.games]
          }
        } catch {
          // silently skip failed months
        }
      }

      if (allGames.length === 0) {
        setError(`No games found for "${username}". Make sure the username is correct.`)
        return
      }

      // Sort by end_time descending, take last 10
      const sorted = [...allGames].sort((a, b) => b.end_time - a.end_time)
      const last10 = sorted.slice(0, 10)
      const processed = last10.map((g) => processGame(g, username))
      setGames(processed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch games')
    } finally {
      setLoading(false)
    }
  }, [])

  return { games, loading, error, fetchGames }
}
