import { Chess } from 'chess.js'
import { parsePolyglotBook, getPositionKey as getZobristKey } from './polyglot'
import type { OpeningBookMove } from './polyglot'

export class OpeningBookService {
  private book: Map<bigint, OpeningBookMove[]> = new Map()
  private loaded = false
  private loading = false
  private loadError: Error | null = null
  private debug = false // Set to true to enable debug logging

  /**
   * Get all moves for a position from the opening book
   */
  getMoves(fen: string): OpeningBookMove[] {
    if (!this.loaded || this.loading) {
      return []
    }

    const chess = new Chess(fen)
    const currentPosition = chess.fen()

    // Parse FEN to get the position key using Zobrist hashing
    const key = getZobristKey(currentPosition)

    if (this.debug) {
      console.log('Position:', currentPosition)
      console.log('Key:', key.toString(16))
      console.log('Moves found:', this.book.get(key))
    }

    return this.book.get(key) ?? []
  }

  /**
   * Get the best move from the opening book for a position
   */
  getBestMove(fen: string): OpeningBookMove | null {
    const moves = this.getMoves(fen)
    if (moves.length === 0) return null

    // Sort by weight (most played moves first)
    moves.sort((a, b) => b.weight - a.weight)

    return moves[0]
  }

  /**
   * Get the opening name for a position
   */
  getOpeningName(fen: string): string | null {
    const moves = this.getMoves(fen)
    if (moves.length === 0) return null

    // Get the first move in the sequence
    const firstMove = moves[0]
    const chess = new Chess(fen)

    try {
      const move = chess.move({ from: firstMove.move.slice(0, 2), to: firstMove.move.slice(2, 4), promotion: firstMove.move[4] })
      if (!move) return null

      // Get the position after this move
      const newPosition = chess.fen()

      // Get moves from the new position
      const subsequentMoves = this.getMoves(newPosition)
      if (subsequentMoves.length === 0) {
        return this.detectOpeningName(fen, firstMove.move)
      }

      // Recursively build the opening name
      const moveName = this.detectOpeningName(fen, firstMove.move)
      const subsequentOpening = this.getOpeningName(newPosition)

      if (subsequentOpening) {
        return `${moveName} - ${subsequentOpening}`
      }

      return moveName
    } catch {
      return null
    }
  }

  /**
   * Detect the opening name from the first few moves
   */
  private detectOpeningName(fen: string, firstMove: string): string {
    const chess = new Chess(fen)
    const move = chess.move({ from: firstMove.slice(0, 2), to: firstMove.slice(2, 4), promotion: firstMove[4] })
    if (!move) return 'Unknown Opening'

    return move.san
  }

  /**
   * Load the opening book from a Uint8Array
   */
  loadFromBuffer(buffer: Uint8Array): void {
    if (this.loading) return

    this.loading = true
    this.loadError = null

    try {
      this.book = parsePolyglotBook(buffer)
      this.loaded = true
      this.loading = false

      // Log debug info
      const stats = this.getStats()
      console.log('Opening book loaded:', stats)
      if (this.debug && stats.size > 0) {
        console.log('Sample keys in book:')
        let count = 0
        for (const [key, moves] of this.book.entries()) {
          console.log(`  Key: ${key.toString(16)}, Moves: ${moves.length}`)
          count++
          if (count >= 5) break
        }
      }
    } catch (error) {
      this.loadError = error as Error
      this.loaded = false
      this.loading = false
      console.error('Failed to load opening book:', error)
    }
  }

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
   * Get book statistics
   */
  getStats(): { size: number; moves: number } {
    let totalMoves = 0
    for (const moves of this.book.values()) {
      totalMoves += moves.length
    }
    return { size: this.book.size, moves: totalMoves }
  }
}

// Create singleton instance
export const openingBook = new OpeningBookService()