import { useMemo } from 'react'

interface LoadingScreenProps {
  message?: string
  progress?: number
}

const humorousMessages = [
  "Thinking about the pawns...",
  "Consulting the move database",
  "Running the position through the computer",
  "Optimizing for checkmate",
  "Calculating the best move",
  "The engine is grinding",
  "Deep analysis mode activated",
  "Processing the board...",
  "Optimizing for maximum efficiency",
  "I'm thinking very hard",
  "Consulting with Stockfish",
  "The engine is pondering",
  "Running the best move algorithm",
  "Optimizing for efficiency",
  "I'm thinking about chess",
  "The engine is doing the thinking",
  "Running the position through the quantum processor",
  "Calculating the best line",
  "Simulating the endgame",
  "Optimizing my bishop pair",
  "Consulting the positional database",
  "Running the tactical lines",
  "The engine is doing its best",
  "Calculating the most efficient win",
  "Optimizing for checkmate in 3",
  "Thinking about the center control",
  "Running the position through the neural network",
  "The engine is thinking silently",
  "Optimizing for material advantage",
  "Calculating the best move...",
  "I'm thinking very hard about this...",
]

export default function LoadingScreen({ message = 'Analyzing with Stockfish...', progress = 0 }: LoadingScreenProps) {
  const randomMessage = useMemo(() => {
    return humorousMessages[Math.floor(Math.random() * humorousMessages.length)]
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