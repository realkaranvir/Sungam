import { scoreToBarValue, formatScore } from '@/lib/moveClassifier'
import { cn } from '@/lib/utils'

interface EvaluationBarProps {
  cp: number
  mate: number | null
  orientation?: 'white' | 'black'
  className?: string
}

export function EvaluationBar({
  cp,
  mate,
  orientation = 'white',
  className,
}: EvaluationBarProps) {
  const value = scoreToBarValue(cp, mate) // -1 to 1, white perspective
  const whitePercent = Math.round(((value + 1) / 2) * 100)
  const blackPercent = 100 - whitePercent

  const score = formatScore(cp, mate)
  const isWhiteAdvantage = cp > 0 || (mate !== null && mate > 0)

  return (
    <div className={cn('flex flex-col items-center gap-1 self-stretch', className, 'lg:h-[calc(100vh-13rem)]')} style={{ minHeight: '300px' }}>
      {/* Score label on top */}
      <span
        className={cn(
          'text-xs font-bold tabular-nums shrink-0',
          isWhiteAdvantage ? 'text-white' : 'text-zinc-400',
        )}
      >
        {score}
      </span>

      {/* Bar — grows to fill remaining height */}
      <div className="relative flex-1 w-4 rounded overflow-hidden bg-zinc-900 border border-zinc-700 lg:h-full lg:my-4">
        {/* Keep each color beside its pieces when the board orientation changes. */}
        <div
          className={cn(
            'absolute left-0 right-0 bg-zinc-900 transition-all duration-500 ease-in-out',
            orientation === 'white' ? 'top-0' : 'bottom-0',
          )}
          style={{ height: `${blackPercent}%` }}
        />
        <div
          className={cn(
            'absolute left-0 right-0 bg-white transition-all duration-500 ease-in-out',
            orientation === 'white' ? 'bottom-0' : 'top-0',
          )}
          style={{ height: `${whitePercent}%` }}
        />
        {/* Center line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-zinc-600" />
      </div>
    </div>
  )
}
