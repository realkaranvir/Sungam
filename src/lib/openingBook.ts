import { POPULAR_OPENINGS } from './openings'
import type { Opening } from './openings'

export class OpeningBookService {
  private loaded = false
  private loading = false
  private loadError: Error | null = null
  private debug = false // Set to true to enable debug logging

  /**
   * Check if the opening book is loaded
   */
  isLoaded(): boolean {
    return this.loaded
  }

  /**
   * Check if the opening book is currently loading
   */
  isLoading(): boolean {
    return this.loading
  }

  /**
   * Get any error that occurred during loading
   */
  getLoadError(): Error | null {
    return this.loadError
  }

  /**
   * Get the opening name for a position based on move history
   */
  getOpeningName(moveHistory: string[]): string | null {
    if (!this.loaded || this.loading) {
      return null
    }

    // Find the opening by matching move history
    for (const opening of POPULAR_OPENINGS) {
      if (opening.moves.length > moveHistory.length) continue

      let match = true
      for (let i = 0; i < moveHistory.length; i++) {
        if (moveHistory[i] !== opening.moves[i]) {
          match = false
          break
        }
      }

      if (match) {
        return opening.shortName
      }
    }

    return null
  }

  /**
   * Get book statistics
   */
  getStats(): { size: number; moves: number } {
    return {
      size: POPULAR_OPENINGS.length,
      moves: POPULAR_OPENINGS.reduce((acc, o) => acc + o.moves.length, 0)
    }
  }

  /**
   * Load the opening book (placeholder - we use the database)
   */
  loadFromBuffer(_buffer: Uint8Array): void {
    // This method is kept for API compatibility but doesn't do anything
    // since we use the database approach instead
    this.loaded = true
    this.loading = false

    // Log debug info
    const stats = this.getStats()
    console.log('Opening book loaded:', stats)
    if (this.debug && stats.size > 0) {
      console.log('Sample openings:')
      let count = 0
      for (const opening of POPULAR_OPENINGS) {
        console.log(`  - ${opening.shortName}: ${opening.moves.length} moves`)
        count++
        if (count >= 5) break
      }
    }
  }

  /**
   * Get move recommendations for a position
   */
  getMoves(moveHistory: string[]): Opening[] {
    if (!this.loaded || this.loading) {
      return []
    }

    // Find the opening by matching move history
    for (const opening of POPULAR_OPENINGS) {
      if (opening.moves.length > moveHistory.length) continue

      let match = true
      for (let i = 0; i < moveHistory.length; i++) {
        if (moveHistory[i] !== opening.moves[i]) {
          match = false
          break
        }
      }

      if (match) {
        return [opening]
      }
    }

    return []
  }
}

// Create singleton instance
export const openingBook = new OpeningBookService()