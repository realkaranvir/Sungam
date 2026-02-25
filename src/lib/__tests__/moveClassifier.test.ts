import { describe, it, expect } from 'vitest'
import { classifyMove, scoreToPercentage, formatScore } from '../moveClassifier'

describe('classifyMove', () => {
  describe('brilliant', () => {
    it('returns brilliant when best move, large second-best gap, and position unclear', () => {
      expect(classifyMove(0, true, 200, 100)).toBe('brilliant')
    })

    it('requires gap >= 150cp', () => {
      expect(classifyMove(0, true, 149, 100)).toBe('best')
      expect(classifyMove(0, true, 150, 100)).toBe('brilliant')
    })

    it('requires position to be unclear (cpBefore < 200)', () => {
      expect(classifyMove(0, true, 200, 199)).toBe('brilliant')
      expect(classifyMove(0, true, 200, 200)).toBe('best')
    })

    it('requires secondBestGap to be non-null', () => {
      expect(classifyMove(0, true, null, 100)).toBe('best')
    })
  })

  describe('best', () => {
    it('returns best when playing engine top move without brilliant criteria', () => {
      expect(classifyMove(0, true, 50, 100)).toBe('best')
    })

    it('returns best when position is already winning', () => {
      expect(classifyMove(0, true, 200, 500)).toBe('best')
    })
  })

  describe('great', () => {
    it('returns great when cpLoss is zero (neutral move)', () => {
      expect(classifyMove(0, false, null, 0)).toBe('great')
    })

    it('returns great when cpLoss is negative (gained material)', () => {
      expect(classifyMove(-50, false, null, 0)).toBe('great')
    })
  })

  describe('good', () => {
    it('returns good for cpLoss of 1', () => {
      expect(classifyMove(1, false, null, 0)).toBe('good')
    })

    it('returns good for cpLoss of 10', () => {
      expect(classifyMove(10, false, null, 0)).toBe('good')
    })
  })

  describe('inaccuracy', () => {
    it('returns inaccuracy for cpLoss of 11', () => {
      expect(classifyMove(11, false, null, 0)).toBe('inaccuracy')
    })

    it('returns inaccuracy for cpLoss of 30', () => {
      expect(classifyMove(30, false, null, 0)).toBe('inaccuracy')
    })
  })

  describe('mistake', () => {
    it('returns mistake for cpLoss of 31', () => {
      expect(classifyMove(31, false, null, 0)).toBe('mistake')
    })

    it('returns mistake for cpLoss of 100', () => {
      expect(classifyMove(100, false, null, 0)).toBe('mistake')
    })
  })

  describe('blunder', () => {
    it('returns blunder for cpLoss of 101', () => {
      expect(classifyMove(101, false, null, 0)).toBe('blunder')
    })

    it('returns blunder for large cp loss', () => {
      expect(classifyMove(500, false, null, 0)).toBe('blunder')
    })
  })
})

describe('scoreToPercentage', () => {
  it('returns ~50 for a even position', () => {
    expect(scoreToPercentage(0, null)).toBeCloseTo(50, 0)
  })

  it('returns 95 for forced mate for white', () => {
    expect(scoreToPercentage(0, 3)).toBe(95)
  })

  it('returns 5 for forced mate against white', () => {
    expect(scoreToPercentage(0, -3)).toBe(5)
  })

  it('returns > 50 for a white advantage', () => {
    expect(scoreToPercentage(200, null)).toBeGreaterThan(50)
  })

  it('returns < 50 for a black advantage', () => {
    expect(scoreToPercentage(-200, null)).toBeLessThan(50)
  })

  it('clamps extreme values', () => {
    const high = scoreToPercentage(99999, null)
    const low = scoreToPercentage(-99999, null)
    expect(high).toBeLessThanOrEqual(100)
    expect(low).toBeGreaterThanOrEqual(0)
  })
})

describe('formatScore', () => {
  it('formats positive cp as +X.X', () => {
    expect(formatScore(150, null)).toBe('+1.5')
  })

  it('formats negative cp as -X.X', () => {
    expect(formatScore(-150, null)).toBe('-1.5')
  })

  it('formats white mate', () => {
    expect(formatScore(0, 5)).toBe('M5')
  })

  it('formats black mate', () => {
    expect(formatScore(0, -3)).toBe('M3')
  })
})
