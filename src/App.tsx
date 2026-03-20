import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SearchPage } from '@/pages/SearchPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ReviewPage } from '@/pages/ReviewPage'
import { PuzzlePage } from '@/pages/PuzzlePage'

export default function App() {
  return (
    <div className="dark">
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/dashboard/:username" element={<DashboardPage />} />
            <Route path="/review/:gameId" element={<ReviewPage />} />
            <Route path="/puzzles" element={<PuzzlePage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </div>
  )
}
