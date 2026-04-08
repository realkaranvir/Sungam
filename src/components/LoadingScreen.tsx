import { useMemo } from 'react'
import { useRef } from 'react'

interface LoadingScreenProps {
  message?: string
  progress?: number
}

const humorousMessages = [
  "🧠 Thinking very hard...",
  "🤖 The engine is thinking silently",
  "⚡ Running the position through the quantum processor",
  "💻 Optimizing for maximum efficiency",
  "🤝 Consulting with Stockfish",
  "🧩 Running the best move algorithm",
  "🔮 Running the position through the neural network",
  "🎯 Optimizing for checkmate in 3",
  "🧠 Deep analysis mode activated",
  "🤖 The engine is grinding",
  "⚙️ Processing the board...",
  "🧠 I'm thinking about the pawns...",
  "💾 Consulting the move database",
  "🤖 Calculating the best move...",
  "🧠 Optimizing for material advantage",
]

export default function LoadingScreen({ message = 'Analyzing with Stockfish...', progress = 0 }: LoadingScreenProps) {
  const previousProgressRef = useRef(0)

  const randomMessage = useMemo(() => {
    // Only change message every 5% progress (about every 3-4 updates)
    const progressIncrement = 5
    const currentIndex = Math.floor(progress / progressIncrement) % humorousMessages.length

    // Only update if progress has increased by at least progressIncrement
    if (progress - previousProgressRef.current >= progressIncrement) {
      previousProgressRef.current = progress
    }

    return humorousMessages[currentIndex]
  }, [progress])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950">
      {/* Loading Animation */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-lg font-medium text-zinc-300">{message}</p>

        <p className="text-sm text-zinc-500">
          {randomMessage}
        </p>

        {/* Progress indicator */}
        {progress > 0 && (
          <div className="w-64">
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}