import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function SearchPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState(
    () => localStorage.getItem('chesscom_username') ?? ''
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) return
    localStorage.setItem('chesscom_username', trimmed)
    navigate(`/dashboard/${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Logo / Brand */}
      <div className="mb-12 text-center animate-fade-in">
        <div className="text-6xl mb-4 select-none">♟</div>
        <h1 className="text-5xl font-bold tracking-tight text-white mb-2">
          Sungam
        </h1>
        <p className="text-zinc-400 text-lg font-light">
          Chess game analysis. Powered by Stockfish.
        </p>
      </div>

      {/* Search form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md animate-slide-up"
      >
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Chess.com username"
              className="pl-10 h-12 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-500 text-base"
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-12 px-6 bg-white text-black hover:bg-zinc-100 font-semibold"
            disabled={!username.trim()}
          >
            Analyze
          </Button>
        </div>
        <p className="text-center text-xs text-zinc-600 mt-4">
          Fetches your last 10 games from Chess.com Public API
        </p>
      </form>

      {/* Footer */}
      <div className="absolute bottom-6 text-xs text-zinc-700">
        Magnus backwards.
      </div>
    </div>
  )
}
