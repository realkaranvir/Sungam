import { describe, it, expect, vi } from 'vitest'
import { parseEngineOutput } from '../parseEngineOutput'

describe('parseEngineOutput', () => {
  describe('info lines', () => {
    it('parses a standard cp info line', () => {
      const onInfo = vi.fn()
      parseEngineOutput(
        'info depth 16 seldepth 22 multipv 1 score cp 34 nodes 123456 pv e2e4 e7e5',
        onInfo,
        null
      )
      expect(onInfo).toHaveBeenCalledWith(expect.objectContaining({
        depth: 16,
        score: 34,
        mate: null,
        pv: 'e2e4 e7e5',
        multipv: 1,
      }))
    })

    it('parses a negative cp score', () => {
      const onInfo = vi.fn()
      parseEngineOutput(
        'info depth 12 multipv 1 score cp -150 pv d7d5',
        onInfo,
        null
      )
      expect(onInfo).toHaveBeenCalledWith(expect.objectContaining({ score: -150 }))
    })

    it('parses a mate score', () => {
      const onInfo = vi.fn()
      parseEngineOutput(
        'info depth 5 multipv 1 score mate 3 pv e1g1',
        onInfo,
        null
      )
      expect(onInfo).toHaveBeenCalledWith(expect.objectContaining({
        mate: 3,
        score: 0,
      }))
    })

    it('parses a negative mate score', () => {
      const onInfo = vi.fn()
      parseEngineOutput(
        'info depth 5 multipv 1 score mate -2 pv e8g8',
        onInfo,
        null
      )
      expect(onInfo).toHaveBeenCalledWith(expect.objectContaining({ mate: -2 }))
    })

    it('parses multipv 2', () => {
      const onInfo = vi.fn()
      parseEngineOutput(
        'info depth 16 multipv 2 score cp 10 pv d2d4',
        onInfo,
        null
      )
      expect(onInfo).toHaveBeenCalledWith(expect.objectContaining({ multipv: 2 }))
    })

    it('ignores lowerbound lines', () => {
      const onInfo = vi.fn()
      parseEngineOutput(
        'info depth 16 multipv 1 score cp 34 lowerbound pv e2e4',
        onInfo,
        null
      )
      expect(onInfo).not.toHaveBeenCalled()
    })

    it('ignores upperbound lines', () => {
      const onInfo = vi.fn()
      parseEngineOutput(
        'info depth 16 multipv 1 score cp 34 upperbound pv e2e4',
        onInfo,
        null
      )
      expect(onInfo).not.toHaveBeenCalled()
    })

    it('ignores non-info lines', () => {
      const onInfo = vi.fn()
      parseEngineOutput('uciok', onInfo, null)
      parseEngineOutput('readyok', onInfo, null)
      expect(onInfo).not.toHaveBeenCalled()
    })
  })

  describe('bestmove lines', () => {
    it('fires onBestMove with the move', () => {
      const onBestMove = vi.fn()
      parseEngineOutput('bestmove e2e4 ponder e7e5', null, onBestMove)
      expect(onBestMove).toHaveBeenCalledWith('e2e4')
    })

    it('fires onBestMove with empty string for (none)', () => {
      const onBestMove = vi.fn()
      parseEngineOutput('bestmove (none)', null, onBestMove)
      expect(onBestMove).toHaveBeenCalledWith('')
    })

    it('does not fire onInfo for bestmove lines', () => {
      const onInfo = vi.fn()
      parseEngineOutput('bestmove e2e4', onInfo, null)
      expect(onInfo).not.toHaveBeenCalled()
    })
  })

  describe('null handlers', () => {
    it('does not throw when handlers are null', () => {
      expect(() => {
        parseEngineOutput('info depth 16 multipv 1 score cp 34 pv e2e4', null, null)
        parseEngineOutput('bestmove e2e4', null, null)
      }).not.toThrow()
    })
  })
})
