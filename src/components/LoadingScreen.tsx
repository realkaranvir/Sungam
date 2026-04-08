import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
}

export default function LoadingScreen({ message = 'Analyzing with Stockfish...' }: LoadingScreenProps) {
  const [loadingBoard, setLoadingBoard] = useState<boolean>(true)

  // Stop animation after 10 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoadingBoard(false)
    }, 10000)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950">
      {/* Loading Animation */}
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />

        <p className="text-lg font-medium text-zinc-300">{message}</p>

        <p className="text-sm text-zinc-500">
          {loadingBoard ? 'Analyzing moves...' : 'Analysis complete!'}
        </p>

        {/* Progress indicator */}
        {loadingBoard && (
          <div className="w-64">
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}