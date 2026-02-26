import { CLASSIFICATION_META, type MoveClassification } from '@/types'
import { cn } from '@/lib/utils'

interface MoveClassificationBadgeProps {
  classification: MoveClassification
  className?: string
  showLabel?: boolean
}

export function MoveClassificationBadge({
  classification,
  className,
  showLabel = false,
}: MoveClassificationBadgeProps) {
  const meta = CLASSIFICATION_META[classification]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold',
        meta.color,
        meta.bgColor,
        className,
      )}
    >
      <span>{meta.symbol}</span>
      {showLabel && <span>{meta.label}</span>}
    </span>
  )
}
