import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ProcessedGame } from '@/types'

interface GameCardProps {
  game: ProcessedGame
}

export function GameCard({ game }: GameCardProps) {
  const navigate = useNavigate()

  const resultVariant = game.result === 'win' ? 'win' : game.result === 'loss' ? 'loss' : 'draw'
  const resultLabel = game.result === 'win' ? 'Win' : game.result === 'loss' ? 'Loss' : 'Draw'

  const colorIcon = game.userColor === 'white' ? '♔' : '♚'

  const dateStr = game.date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const handleReview = () => {
    navigate(`/review/${game.id}`, { state: { game } })
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
      <CardContent className="p-4 flex items-center gap-4">
        {/* Result indicator */}
        <div
          className={`w-1 self-stretch rounded-full shrink-0 ${
            game.result === 'win'
              ? 'bg-green-500'
              : game.result === 'loss'
              ? 'bg-red-500'
              : 'bg-zinc-500'
          }`}
        />

        {/* Game info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white truncate">
              {colorIcon} vs {game.opponent}
            </span>
            <span className="text-xs text-zinc-500">({game.opponentRating})</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={resultVariant}>{resultLabel}</Badge>
            <span className="text-xs text-zinc-500">{game.timeControl}</span>
            <span className="text-xs text-zinc-600">{dateStr}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="text-right shrink-0 hidden sm:block">
          <div className="text-xs text-zinc-500">Your rating</div>
          <div className="text-sm font-mono text-zinc-300">{game.userRating}</div>
        </div>

        {/* Review button */}
        <Button
          size="sm"
          variant="outline"
          onClick={handleReview}
          className="shrink-0 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-200"
        >
          Review
        </Button>
      </CardContent>
    </Card>
  )
}
