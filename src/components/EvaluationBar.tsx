import { scoreToPercentage, formatScore } from '@/lib/moveClassifier'
import type { EngineInfo } from '@/types'

interface EvaluationBarProps {
  engineInfo: EngineInfo | null
  orientation: 'white' | 'black'
}

export function EvaluationBar({ engineInfo, orientation }: EvaluationBarProps) {
  const score = engineInfo?.score ?? 0
  const mate = engineInfo?.mate ?? null

  const whitePercent = scoreToPercentage(score, mate)
  // When viewing as black, black's color is at the bottom
  const bottomPercent = orientation === 'white' ? whitePercent : 100 - whitePercent

  const formattedScore = formatScore(score, mate)
  const whiteIsWinning = whitePercent >= 50

  return (
    <div className="flex flex-col items-center gap-1 self-stretch flex-none w-6 select-none">
      {/* The bar itself */}
      <div className="relative flex-1 w-3 rounded-sm overflow-hidden bg-zinc-950 border border-zinc-800">
        {/* Bottom fill */}
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ease-out ${
            orientation === 'white' ? 'bg-white' : 'bg-zinc-200'
          }`}
          style={{ height: `${bottomPercent}%` }}
        />
        {/* Top fill */}
        <div
          className={`absolute top-0 left-0 right-0 transition-all duration-300 ease-out ${
            orientation === 'white' ? 'bg-zinc-800' : 'bg-zinc-800'
          }`}
          style={{ height: `${100 - bottomPercent}%` }}
        />
        {/* Center line */}
        <div
          className="absolute left-0 right-0 h-px bg-zinc-500 z-10"
          style={{ top: '50%' }}
        />
      </div>

      {/* Score label — outside the bar, always readable */}
      <span
        className={`text-[10px] font-mono font-semibold tabular-nums leading-none ${
          whiteIsWinning ? 'text-zinc-200' : 'text-zinc-500'
        }`}
      >
        {formattedScore}
      </span>
    </div>
  )
}
