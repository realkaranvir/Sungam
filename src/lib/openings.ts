/**
 * Opening Database
 *
 * Contains popular chess openings with their standard move sequences.
 * Used to identify what opening a game is following.
 */

export interface Opening {
  name: string
  shortName: string
  description: string
  moves: string[] // Move sequence in UCI format
}

/**
 * Popular openings database
 */
export const POPULAR_OPENINGS: Opening[] = [
  // Grand Prix Attack
  {
    name: "Grand Prix Attack",
    shortName: "Grand Prix",
    description: "1. e4 c5 2. Nc3 d6 3. g4",
    moves: ["e2e4", "c7c5", "b1c3", "d7d6", "g2g4"]
  },

  // Vienna Game
  {
    name: "Vienna Game",
    shortName: "Vienna",
    description: "1. e4 e5 2. b1c3",
    moves: ["e2e4", "e7e5", "b1c3"]
  },

  // Ruy Lopez (Spanish)
  {
    name: "Ruy Lopez (Spanish)",
    shortName: "Ruy Lopez",
    description: "1. e4 e5 2. Nf3 Nc6 3. Bb5",
    moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5"]
  },

  // Italian Game
  {
    name: "Italian Game",
    shortName: "Italian",
    description: "1. e4 e5 2. Nf3 Nc6 3. Bc4",
    moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4"]
  },

  // Scotch Game
  {
    name: "Scotch Game",
    shortName: "Scotch",
    description: "1. e4 e5 2. Nf3 Nc6 3. d4",
    moves: ["e2e4", "e7e5", "g1f3", "b8c6", "d2d4"]
  },

  // Four Knights Game
  {
    name: "Four Knights Game",
    shortName: "Four Knights",
    description: "1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6",
    moves: ["e2e4", "e7e5", "g1f3", "b8c6", "b1c3", "g8f6"]
  },

  // Petroff Defense
  {
    name: "Petroff Defense",
    shortName: "Petroff",
    description: "1. e4 e5 2. Nf3 Nf6",
    moves: ["e2e4", "e7e5", "g1f3", "g8f6"]
  },

  // King's Gambit
  {
    name: "King's Gambit",
    shortName: "King's Gambit",
    description: "1. e4 e5 2. f4",
    moves: ["e2e4", "e7e5", "f2f4"]
  },

  // Bishop's Opening
  {
    name: "Bishop's Opening",
    shortName: "Bishop's Opening",
    description: "1. e4 e5 2. Bc4",
    moves: ["e2e4", "e7e5", "f1c4"]
  },

  // Queen's Gambit
  {
    name: "Queen's Gambit",
    shortName: "Queen's Gambit",
    description: "1. d4 d5 2. c4",
    moves: ["d2d4", "d7d5", "c2c4"]
  },

  // Queen's Pawn Game
  {
    name: "Queen's Pawn Game",
    shortName: "Queen's Pawn",
    description: "1. d4 d5 2. Nf3",
    moves: ["d2d4", "d7d5", "g1f3"]
  },

  // Catalan Opening
  {
    name: "Catalan Opening",
    shortName: "Catalan",
    description: "1. d4 d5 2. c4 e6 3. g3",
    moves: ["d2d4", "d7d5", "c2c4", "e7e6", "g1g3"]
  },

  // Nimzo-Indian Defense
  {
    name: "Nimzo-Indian Defense",
    shortName: "Nimzo-Indian",
    description: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4",
    moves: ["d2d4", "g8f6", "c2c4", "e7e6", "b1c3", "f8b4"]
  },

  // King's Indian Defense
  {
    name: "King's Indian Defense",
    shortName: "King's Indian",
    description: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7",
    moves: ["d2d4", "g8f6", "c2c4", "g7g6", "b1c3", "f8g7"]
  },

  // French Defense
  {
    name: "French Defense",
    shortName: "French",
    description: "1. e4 e6 2. d4 d5",
    moves: ["e2e4", "e7e6", "d2d4", "d7d5"]
  },

  // Caro-Kann Defense
  {
    name: "Caro-Kann Defense",
    shortName: "Caro-Kann",
    description: "1. e4 c6 2. d4 d5",
    moves: ["e2e4", "c7c6", "d2d4", "d7d5"]
  },

  // Sicilian Defense
  {
    name: "Sicilian Defense",
    shortName: "Sicilian",
    description: "1. e4 c5",
    moves: ["e2e4", "c7c5"]
  },

  // Alekhine's Defense
  {
    name: "Alekhine's Defense",
    shortName: "Alekhine",
    description: "1. e4 Nf6",
    moves: ["e2e4", "g8f6"]
  },

  // Scandinavian Defense
  {
    name: "Scandinavian Defense",
    shortName: "Scandinavian",
    description: "1. e4 d5 2. exd5",
    moves: ["e2e4", "d7d5", "e2e4"]
  },

  // Philidor Defense
  {
    name: "Philidor Defense",
    shortName: "Philidor",
    description: "1. e4 e5 2. Nf3 d6",
    moves: ["e2e4", "e7e5", "g1f3", "d7d6"]
  },

  // Pirc Defense
  {
    name: "Pirc Defense",
    shortName: "Pirc",
    description: "1. e4 d6 2. d4 Nf6 3. Nc3 g6",
    moves: ["e2e4", "d7d6", "d2d4", "g8f6", "b1c3", "g7g6"]
  },

  // Modern Defense
  {
    name: "Modern Defense",
    shortName: "Modern",
    description: "1. e4 g6 2. d4 Bg7",
    moves: ["e2e4", "g7g6", "d2d4", "f8g7"]
  },

  // London System
  {
    name: "London System",
    shortName: "London",
    description: "1. d4 d5 2. Bf4",
    moves: ["d2d4", "d7d5", "f1f4"]
  },

  // Bird's Opening
  {
    name: "Bird's Opening",
    shortName: "Bird",
    description: "1. f4",
    moves: ["f2f4"]
  },

  // Portuguese Opening
  {
    name: "Portuguese Opening",
    shortName: "Portuguese",
    description: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4",
    moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5", "b2b4"]
  },

  // Olaf's Opening
  {
    name: "Olaf's Opening",
    shortName: "Olaf's",
    description: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3",
    moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5", "c2c3"]
  },

  // Van't Kruijs Opening
  {
    name: "Van't Kruijs Opening",
    shortName: "Van't Kruijs",
    description: "1. e4 e5 2. Bc4 Bc5 3. c3",
    moves: ["e2e4", "e7e5", "f1c4", "f8c5", "c2c3"]
  },

  // Schuyler Opening
  {
    name: "Schuyler Opening",
    shortName: "Schuyler",
    description: "1. e4 e5 2. Bc4 Bc5 3. Nf3",
    moves: ["e2e4", "e7e5", "f1c4", "f8c5", "g1f3"]
  },

  // Evans Gambit
  {
    name: "Evans Gambit",
    shortName: "Evans",
    description: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4",
    moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5", "b2b4", "b7b5", "a2a4"]
  },

  // Philidor Defense
  {
    name: "Philidor Defense",
    shortName: "Philidor",
    description: "1. e4 e5 2. Nf3 d6",
    moves: ["e2e4", "e7e5", "g1f3", "d7d6"]
  }
]

/**
 * Find which opening a game is following
 *
 * @param moves Array of played moves in UCI format
 * @returns The opening name if a match is found, null otherwise
 */
export function detectOpening(moves: string[]): string | null {
  if (moves.length === 0) return null

  for (const opening of POPULAR_OPENINGS) {
    if (opening.moves.length > moves.length) continue

    // Check if the played moves match the opening's move sequence
    let match = true
    for (let i = 0; i < moves.length; i++) {
      if (moves[i] !== opening.moves[i]) {
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
 * Get opening info by move sequence
 */
export function getOpeningByMoves(moves: string[]): Opening | null {
  return POPULAR_OPENINGS.find(opening => {
    if (opening.moves.length > moves.length) return false

    for (let i = 0; i < moves.length; i++) {
      if (moves[i] !== opening.moves[i]) return false
    }

    return true
  }) || null
}