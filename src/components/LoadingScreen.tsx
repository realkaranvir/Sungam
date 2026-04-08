import { } from 'react'

interface LoadingScreenProps {
  message?: string
  progress?: number
}

const funnyMessages = [
  "Analyzing like a grandmaster",
  "Finding the best move...",
  "Stockfish is thinking...",
  "Evaluating positions...",
  "Calculating optimal lines...",
  "Looking for blunders...",
  "Preparing the analysis...",
  "Stockfish is grinding...",
  "Analyzing with the grandmaster engine...",
  "Deep thinking...",
  "Stockfish is pondering...",
  "Finding the winning line...",
  "Evaluating the position...",
  "Stockfish is on the job...",
  "Analyzing the game...",
  "Deep dive mode activated...",
  "Stockfish is making coffee... ☕",
  "Stockfish is meditating...",
  "Gathering chess wisdom...",
  "Analyzing with the best...",
]

export default function LoadingScreen({ message = 'Analyzing with Stockfish...', progress = 0 }: LoadingScreenProps) {
  const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)]

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