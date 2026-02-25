import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChessComApi } from '@/hooks/useChessComApi'
import { GameCard } from '@/components/GameCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ChevronLeft, RefreshCw, AlertCircle } from 'lucide-react'

export function DashboardPage() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { games, loading, error, fetchGames } = useChessComApi()

  const decodedUsername = decodeURIComponent(username ?? '')

  useEffect(() => {
    if (decodedUsername) {
      fetchGames(decodedUsername)
    }
  }, [decodedUsername, fetchGames])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-sm">♟</span>
              <h1 className="font-bold text-white text-lg">{decodedUsername}</h1>
            </div>
            <p className="text-xs text-zinc-500">Last 10 games</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchGames(decodedUsername)}
            disabled={loading}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-6 space-y-3">
        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-zinc-800 p-4 flex items-center gap-4"
            >
              <Skeleton className="w-1 h-12 rounded-full bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48 bg-zinc-800" />
                <Skeleton className="h-3 w-32 bg-zinc-800" />
              </div>
              <Skeleton className="h-9 w-20 bg-zinc-800" />
            </div>
          ))}

        {/* Error state */}
        {error && !loading && (
          <div className="rounded-lg border border-red-900/50 bg-red-900/10 p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-red-400 font-medium mb-1">Failed to load games</p>
            <p className="text-red-400/70 text-sm mb-4">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchGames(decodedUsername)}
              className="border-red-800 text-red-400 hover:bg-red-900/20"
            >
              Try again
            </Button>
          </div>
        )}

        {/* Games list */}
        {!loading && !error && games.length > 0 && (
          <>
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </>
        )}

        {/* Empty state */}
        {!loading && !error && games.length === 0 && (
          <div className="text-center py-16 text-zinc-600">
            <div className="text-4xl mb-4">♙</div>
            <p>No games found.</p>
          </div>
        )}
      </main>
    </div>
  )
}
