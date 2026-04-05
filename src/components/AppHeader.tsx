import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, UserRound, Puzzle, FileSearch } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

const LS_KEY = 'sungam_username'

interface AppHeaderProps {
  onBack?: () => void
  title?: ReactNode
  subtitle?: ReactNode
  right?: ReactNode
  progress?: number
  progressLabel?: string
}

export function AppHeader({ 
  onBack, 
  title, 
  subtitle, 
  right, 
  progress,
  progressLabel
}: AppHeaderProps) {
  const navigate = useNavigate()

  const handleChangeUser = () => {
    localStorage.removeItem(LS_KEY)
    navigate('/')
  }

  return (
    <div className="border-b border-zinc-900 shrink-0 relative">
      <div className="w-full px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="default"
              onClick={onBack}
              className="text-zinc-400 hover:text-white hover:bg-zinc-900 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          {(title || subtitle) && (
            <div className="flex flex-col">
              {title && <div className="text-sm font-semibold truncate text-white">{title}</div>}
              {subtitle && <div className="text-xs text-zinc-500 truncate">{subtitle}</div>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {right}
          <Button
            variant="ghost"
            size="default"
            onClick={() => navigate('/puzzles')}
            title="Puzzles"
            className="text-zinc-400 hover:text-white hover:bg-zinc-900 shrink-0"
          >
            <Puzzle className="h-4 w-4" />
            <span className="ml-2 text-xs hidden sm:inline">Puzzles</span>
          </Button>

          <Button
            variant="ghost"
            size="default"
            onClick={() => {
              const username = localStorage.getItem(LS_KEY)
              if (username) {
                navigate(`/dashboard/${username}`)
              } else {
                navigate('/')
              }
            }}
            title="Review games"
            className="text-zinc-400 hover:text-white hover:bg-zinc-900 shrink-0"
          >
            <FileSearch className="h-4 w-4" />
            <span className="ml-2 text-xs hidden sm:inline">Review</span>
          </Button>

          <Button
            variant="ghost"
            size="default"
            onClick={handleChangeUser}
            title="Change user"
            className="text-zinc-400 hover:text-white hover:bg-zinc-900 shrink-0"
          >
            <UserRound className="h-4 w-4" />
            <span className="ml-2 text-xs hidden sm:inline">Switch user</span>
          </Button>
        </div>
      </div>

      {progress !== undefined && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5">
          <div className="max-w-6xl mx-auto px-4">
             {progressLabel && (
               <div className="absolute bottom-1.5 right-4 text-[10px] text-zinc-500 bg-zinc-950/80 px-1 rounded">
                 {progressLabel} {progress}%
               </div>
             )}
             <Progress value={progress} className="h-full rounded-none bg-transparent" />
          </div>
        </div>
      )}
    </div>
  )
}
