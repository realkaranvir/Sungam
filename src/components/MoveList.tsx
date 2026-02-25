import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MoveClassificationBadge } from '@/components/MoveClassificationBadge'
import { cn } from '@/lib/utils'
import type { AnalyzedMove } from '@/types'

interface MoveListProps {
  moves: { san: string; color: string }[]
  analyzedMoves: AnalyzedMove[]
  currentMoveIndex: number
  onMoveClick: (index: number) => void
}

export function MoveList({
  moves,
  analyzedMoves,
  currentMoveIndex,
  onMoveClick,
}: MoveListProps) {
  const activeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [currentMoveIndex])

  const movePairs: { white: number; black: number | null }[] = []
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({ white: i, black: i + 1 < moves.length ? i + 1 : null })
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-0.5">
        {movePairs.map((pair, pairIdx) => (
          <div key={pairIdx} className="flex items-center gap-1 rounded">
            <span className="w-6 text-right text-xs text-zinc-600 font-mono shrink-0 pr-1">
              {pairIdx + 1}.
            </span>

            <MoveButton
              index={pair.white}
              moves={moves}
              analyzedMoves={analyzedMoves}
              currentMoveIndex={currentMoveIndex}
              onMoveClick={onMoveClick}
              activeRef={pair.white === currentMoveIndex ? activeRef : undefined}
            />

            {pair.black !== null ? (
              <MoveButton
                index={pair.black}
                moves={moves}
                analyzedMoves={analyzedMoves}
                currentMoveIndex={currentMoveIndex}
                onMoveClick={onMoveClick}
                activeRef={pair.black === currentMoveIndex ? activeRef : undefined}
              />
            ) : (
              <div className="flex-1" />
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

function MoveButton({
  index,
  moves,
  analyzedMoves,
  currentMoveIndex,
  onMoveClick,
  activeRef,
}: {
  index: number
  moves: { san: string }[]
  analyzedMoves: AnalyzedMove[]
  currentMoveIndex: number
  onMoveClick: (index: number) => void
  activeRef?: React.RefObject<HTMLButtonElement | null>
}) {
  const move = moves[index]
  const analyzed = analyzedMoves[index]
  const isActive = index === currentMoveIndex

  return (
    <button
      ref={activeRef as React.RefObject<HTMLButtonElement>}
      onClick={() => onMoveClick(index)}
      className={cn(
        'flex items-center gap-1 flex-1 px-2 py-1 rounded text-sm font-mono text-left transition-colors',
        isActive
          ? 'bg-zinc-700 text-white'
          : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
      )}
    >
      <span className="truncate">{move.san}</span>
      {analyzed && (
        <MoveClassificationBadge
          classification={analyzed.classification}
          cpLoss={analyzed.cpLoss}
        />
      )}
    </button>
  )
}
