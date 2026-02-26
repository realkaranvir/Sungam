import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MoveClassificationBadge } from '@/components/MoveClassificationBadge'
import type { AnalyzedMove, ParsedMove } from '@/types'
import { cn } from '@/lib/utils'

interface MoveListProps {
  moves: ParsedMove[]
  analyzedMoves: (AnalyzedMove | null)[]
  currentMoveIndex: number  // -1 = initial position
  onMoveClick: (index: number) => void
}

export function MoveList({
  moves,
  analyzedMoves,
  currentMoveIndex,
  onMoveClick,
}: MoveListProps) {
  const activeRef = useRef<HTMLButtonElement | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll active move into view within the scroll area (not the page)
  useEffect(() => {
    const btn = activeRef.current
    if (!btn) return

    // Find the Radix ScrollArea viewport (the actual scrollable container)
    const viewport = scrollAreaRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    )

    if (viewport) {
      const btnTop = btn.offsetTop
      const btnBottom = btnTop + btn.offsetHeight
      const viewportTop = viewport.scrollTop
      const viewportBottom = viewportTop + viewport.clientHeight

      if (btnTop < viewportTop) {
        viewport.scrollTo({ top: btnTop - 8, behavior: 'smooth' })
      } else if (btnBottom > viewportBottom) {
        viewport.scrollTo({ top: btnBottom - viewport.clientHeight + 8, behavior: 'smooth' })
      }
    } else {
      // Fallback: use scrollIntoView but constrained to parent
      btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [currentMoveIndex])

  // Pair moves into rows: [white, black]
  const movePairs: Array<{ index: number; move: ParsedMove; analyzed: AnalyzedMove | null }[]> = []

  for (let i = 0; i < moves.length; i += 2) {
    const pair = []
    pair.push({ index: i, move: moves[i], analyzed: analyzedMoves[i] ?? null })
    if (i + 1 < moves.length) {
      pair.push({ index: i + 1, move: moves[i + 1], analyzed: analyzedMoves[i + 1] ?? null })
    }
    movePairs.push(pair)
  }

  return (
    <div ref={scrollAreaRef} className="h-full">
    <ScrollArea className="h-full">
      <div className="p-2 space-y-0.5">
        {movePairs.map((pair, pairIndex) => (
          <div key={pairIndex} className="flex items-center gap-1">
            {/* Move number */}
            <span className="text-xs text-zinc-500 w-7 shrink-0 text-right">
              {pairIndex + 1}.
            </span>

            {/* White and black moves */}
            {pair.map(({ index, move, analyzed }) => {
              const isActive = index === currentMoveIndex
              return (
                <button
                  key={index}
                  ref={isActive ? activeRef : null}
                  onClick={() => onMoveClick(index)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded text-sm font-mono transition-colors flex-1 text-left',
                    isActive
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white',
                  )}
                >
                  <span>{move.san}</span>
                  {analyzed && analyzed.classification !== 'good' && (
                    <MoveClassificationBadge
                      classification={analyzed.classification}
                      className="ml-auto"
                    />
                  )}
                </button>
              )
            })}

            {/* Pad last row if only one move */}
            {pair.length === 1 && <div className="flex-1" />}
          </div>
        ))}

        {moves.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-4">No moves</p>
        )}
      </div>
    </ScrollArea>
    </div>
  )
}
