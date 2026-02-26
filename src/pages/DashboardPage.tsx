import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useChessComApi } from '@/hooks/useChessComApi'
import { GameCard } from '@/components/GameCard'
import { AppHeader } from '@/components/AppHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'

export function DashboardPage() {
  const { username } = useParams<{ username: string }>()
  const { games, loading, error, fetchGames } = useChessComApi()

  useEffect(() => {
    if (username) {
      fetchGames(username)
    }
  }, [username, fetchGames])

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AppHeader
        title={username}
        subtitle="Recent games"
      />

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {loading && (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full bg-zinc-900 rounded-lg" />
            ))}
          </>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-900/20 border border-red-900/40 text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Error loading games</p>
              <p className="text-xs mt-0.5 text-red-400/70">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && games.length === 0 && (
          <p className="text-zinc-500 text-center py-8 text-sm">No games found.</p>
        )}

        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  )
}
