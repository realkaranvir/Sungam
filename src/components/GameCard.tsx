import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ProcessedGame } from '@/types'
import { cn } from '@/lib/utils'

interface GameCardProps {
  game: ProcessedGame
}

const resultColors = {
  win: 'bg-green-500/20 text-green-400 border-green-500/30',
  loss: 'bg-red-500/20 text-red-400 border-red-500/30',
  draw: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
}

const resultLabels = {
  win: 'Win',
  loss: 'Loss',
  draw: 'Draw',
}

function formatTimeControl(tc: string): string {
  if (tc.includes('+')) {
    const [base, increment] = tc.split('+')
    const mins = Math.floor(parseInt(base) / 60)
    return `${mins}+${increment}`
  }
  const secs = parseInt(tc)
  if (!isNaN(secs)) {
    return `${Math.floor(secs / 60)} min`
  }
  return tc
}

export function GameCard({ game }: GameCardProps) {
  const navigate = useNavigate()

  const handleReview = () => {
    navigate(`/review/${game.id}`, { state: { game } })
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          {/* Left: game info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className={cn('text-xs font-semibold border', resultColors[game.result])}
              >
                {resultLabels[game.result]}
              </Badge>
              <span className="text-xs text-zinc-500">
                {game.userColor === 'white' ? '♔' : '♚'} You
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-white truncate">
                vs {game.opponent}
              </span>
              <span className="text-xs text-zinc-500 shrink-0">
                ({game.opponentRating})
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-zinc-600">{formatTimeControl(game.timeControl)}</span>
              <span className="text-zinc-700">·</span>
              <span className="text-xs text-zinc-600">{game.date}</span>
            </div>
          </div>

          {/* Right: action */}
          <Button
            size="sm"
            onClick={handleReview}
            className="shrink-0 bg-zinc-700 hover:bg-zinc-600 text-white border-0"
          >
            Review
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
