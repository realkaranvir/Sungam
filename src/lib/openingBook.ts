import { POPULAR_OPENINGS } from './openings'

/**
 * Get the opening name for a position based on move history
 * @param moveHistory Array of SAN moves (e.g., ["e4", "e5", "Nc3"])
 * @returns Short name of the opening if detected, null otherwise
 */
export function getOpeningName(moveHistory: string[]): string | null {
  // Find the opening by matching move history
  for (const opening of POPULAR_OPENINGS) {
    // Check if the played moves match the opening's move sequence (only first N moves)
    let match = true
    for (let i = 0; i < opening.moves.length; i++) {
      if (i >= moveHistory.length || moveHistory[i] !== opening.moves[i]) {
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