import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChessComApi } from '@/hooks/useChessComApi'
import { GameCard } from '@/components/GameCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle } from 'lucide-react'

export function DashboardPage() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { games, loading, error, fetchGames } = useChessComApi()

  useEffect(() => {
    if (username) {
      fetchGames(username)
    }
  }, [username, fetchGames])

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-900">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-zinc-400 hover:text-white hover:bg-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{username}</h1>
            <p className="text-xs text-zinc-500">Recent games</p>
          </div>
        </div>
      </div>

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
