import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, UserRound } from 'lucide-react'

const LS_KEY = 'sungam_username'

interface AppHeaderProps {
  onBack?: () => void
  title?: ReactNode
  subtitle?: ReactNode
  right?: ReactNode
  /** If true, renders the full-width max-w-6xl container (ReviewPage). Defaults to max-w-2xl. */
  wide?: boolean
}

export function AppHeader({ onBack, title, subtitle, right, wide = false }: AppHeaderProps) {
  const navigate = useNavigate()

  const handleChangeUser = () => {
    localStorage.removeItem(LS_KEY)
    navigate('/')
  }

  return (
    <div className="border-b border-zinc-900 shrink-0">
      <div className={`${wide ? 'max-w-6xl' : 'max-w-2xl'} mx-auto px-4 py-3 flex items-center gap-3`}>
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-zinc-400 hover:text-white hover:bg-zinc-900 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        {(title || subtitle) && (
          <div className="flex-1 min-w-0">
            {title && <div className="text-sm font-semibold truncate text-white">{title}</div>}
            {subtitle && <div className="text-xs text-zinc-500 truncate">{subtitle}</div>}
          </div>
        )}

        {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}

        <Button
          variant="ghost"
          size="icon"
          onClick={handleChangeUser}
          title="Change user"
          className="text-zinc-400 hover:text-white hover:bg-zinc-900 shrink-0"
        >
          <UserRound className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
