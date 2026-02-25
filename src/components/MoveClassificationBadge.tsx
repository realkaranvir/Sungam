import { CLASSIFICATION_META } from '@/lib/moveClassifier'
import type { MoveClassification } from '@/types'
import { cn } from '@/lib/utils'

interface MoveClassificationBadgeProps {
  classification: MoveClassification
  cpLoss?: number
  size?: 'sm' | 'md'
}

export function MoveClassificationBadge({
  classification,
  cpLoss,
  size = 'sm',
}: MoveClassificationBadgeProps) {
  const meta = CLASSIFICATION_META[classification]

  return (
    <span
      title={`${meta.label}${cpLoss !== undefined ? ` (${cpLoss > 0 ? '-' : ''}${Math.abs(cpLoss / 100).toFixed(1)} pawns)` : ''}`}
      className={cn(
        'inline-flex items-center justify-center rounded font-bold font-mono border',
        meta.color,
        meta.bgColor,
        meta.borderColor,
        size === 'sm' ? 'text-[10px] px-1 py-0.5 min-w-[1.5rem]' : 'text-xs px-1.5 py-1 min-w-[2rem]'
      )}
    >
      {meta.icon}
    </span>
  )
}
