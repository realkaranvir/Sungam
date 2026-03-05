import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Dices } from 'lucide-react'

const LS_KEY = 'sungam_username'

const TOP_GMS = [
  'Hikaru',
  'MagnusCarlsen',
  'GothamChess',
  'Firouzja2003',
  'lachesisq',
  'FabianoCaruana',
  'AnishGiri',
  'WesleySo',
  'LevonAronian',
  'ViditChess'
]

export function SearchPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState(() => localStorage.getItem(LS_KEY) ?? '')

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY)
    if (stored) {
      navigate(`/dashboard/${stored}`, { replace: true })
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) return
    localStorage.setItem(LS_KEY, trimmed)
    navigate(`/dashboard/${trimmed}`)
  }

  const handleRandomGM = () => {
    const randomIndex = Math.floor(Math.random() * TOP_GMS.length)
    setUsername(TOP_GMS[randomIndex])
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / title */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Sungam
          </h1>
          <p className="text-zinc-500 text-sm">Chess.com game review</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Chess.com username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 pr-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-600"
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={handleRandomGM}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              title="Pick a random top GM"
            >
              <Dices className="h-4 w-4" />
            </button>
          </div>
          <Button
            type="submit"
            className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-semibold"
            disabled={!username.trim()}
          >
            Analyze Games
          </Button>
        </form>
      </div>
    </div>
  )
}
