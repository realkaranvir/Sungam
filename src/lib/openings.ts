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
  moves: string[] // Move sequence in SAN format (Standard Algebraic Notation)
}

/**
 * Popular openings database
 * Expanded to include major ECO codes, variations, and gambits.
 * Order matters for detectOpening: Place longer/more specific variations BEFORE 
 * their shorter base openings so the most specific match is found first.
 */
export const POPULAR_OPENINGS: Opening[] = [
  // --- FLANK OPENINGS (1. c4, 1. Nf3, etc.) ---
  {
    name: "English Opening: Symmetrical Variation",
    shortName: "English Symmetrical",
    description: "1. c4 c5",
    moves: ["c4", "c5"]
  },
  {
    name: "English Opening: Reversed Sicilian",
    shortName: "English Reversed Sicilian",
    description: "1. c4 e5",
    moves: ["c4", "e5"]
  },
  {
    name: "English Opening",
    shortName: "English",
    description: "1. c4",
    moves: ["c4"]
  },
  {
    name: "Réti Opening",
    shortName: "Réti",
    description: "1. Nf3 d5 2. c4",
    moves: ["Nf3", "d5", "c4"]
  },
  {
    name: "Zukertort Opening",
    shortName: "Zukertort",
    description: "1. Nf3",
    moves: ["Nf3"]
  },
  {
    name: "Nimzowitsch-Larsen Attack",
    shortName: "Larsen's Opening",
    description: "1. b3",
    moves: ["b3"]
  },
  {
    name: "Polish Opening (Sokolsky)",
    shortName: "Polish",
    description: "1. b4",
    moves: ["b4"]
  },
  {
    name: "Grob's Attack",
    shortName: "Grob",
    description: "1. g4",
    moves: ["g4"]
  },
  {
    name: "Bird's Opening",
    shortName: "Bird",
    description: "1. f4",
    moves: ["f4"]
  },

  // --- SEMI-OPEN GAMES (1. e4 - anything but e5) ---
  
  // Sicilian Defense & Variations
  {
    name: "Sicilian Defense: Najdorf Variation",
    shortName: "Sicilian Najdorf",
    description: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"]
  },
  {
    name: "Sicilian Defense: Dragon Variation",
    shortName: "Sicilian Dragon",
    description: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6"]
  },
  {
    name: "Sicilian Defense: Accelerated Dragon",
    shortName: "Accelerated Dragon",
    description: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 g6",
    moves: ["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "g6"]
  },
  {
    name: "Sicilian Defense: Alapin Variation",
    shortName: "Sicilian Alapin",
    description: "1. e4 c5 2. c3",
    moves: ["e4", "c5", "c3"]
  },
  {
    name: "Sicilian Defense: Closed",
    shortName: "Closed Sicilian",
    description: "1. e4 c5 2. Nc3",
    moves: ["e4", "c5", "Nc3"]
  },
  {
    name: "Grand Prix Attack",
    shortName: "Grand Prix",
    description: "1. e4 c5 2. Nc3 d6 3. f4 (or 3. g4)",
    moves: ["e4", "c5", "Nc3", "d6", "f4"] // Most common Grand Prix path
  },
  {
    name: "Sicilian Defense",
    shortName: "Sicilian",
    description: "1. e4 c5",
    moves: ["e4", "c5"]
  },

  // French Defense & Variations
  {
    name: "French Defense: Advance Variation",
    shortName: "French Advance",
    description: "1. e4 e6 2. d4 d5 3. e5",
    moves: ["e4", "e6", "d4", "d5", "e5"]
  },
  {
    name: "French Defense: Exchange Variation",
    shortName: "French Exchange",
    description: "1. e4 e6 2. d4 d5 3. exd5 exd5",
    moves: ["e4", "e6", "d4", "d5", "exd5", "exd5"]
  },
  {
    name: "French Defense: Winawer Variation",
    shortName: "French Winawer",
    description: "1. e4 e6 2. d4 d5 3. Nc3 Bb4",
    moves: ["e4", "e6", "d4", "d5", "Nc3", "Bb4"]
  },
  {
    name: "French Defense: Tarrasch Variation",
    shortName: "French Tarrasch",
    description: "1. e4 e6 2. d4 d5 3. Nd2",
    moves: ["e4", "e6", "d4", "d5", "Nd2"]
  },
  {
    name: "French Defense",
    shortName: "French",
    description: "1. e4 e6",
    moves: ["e4", "e6"]
  },

  // Caro-Kann & Variations
  {
    name: "Caro-Kann Defense: Advance Variation",
    shortName: "Caro-Kann Advance",
    description: "1. e4 c6 2. d4 d5 3. e5",
    moves: ["e4", "c6", "d4", "d5", "e5"]
  },
  {
    name: "Caro-Kann Defense: Exchange Variation",
    shortName: "Caro-Kann Exchange",
    description: "1. e4 c6 2. d4 d5 3. exd5 cxd5",
    moves: ["e4", "c6", "d4", "d5", "exd5", "cxd5"]
  },
  {
    name: "Caro-Kann Defense: Classical Variation",
    shortName: "Caro-Kann Classical",
    description: "1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5",
    moves: ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5"]
  },
  {
    name: "Caro-Kann Defense",
    shortName: "Caro-Kann",
    description: "1. e4 c6 2. d4 d5",
    moves: ["e4", "c6", "d4", "d5"]
  },

  // Other Semi-Open
  {
    name: "Alekhine's Defense",
    shortName: "Alekhine",
    description: "1. e4 Nf6",
    moves: ["e4", "Nf6"]
  },
  {
    name: "Scandinavian Defense: Mieses-Kotroc Variation",
    shortName: "Scandi Kotroc",
    description: "1. e4 d5 2. exd5 Qxd5",
    moves: ["e4", "d5", "exd5", "Qxd5"]
  },
  {
    name: "Scandinavian Defense",
    shortName: "Scandinavian",
    description: "1. e4 d5",
    moves: ["e4", "d5"]
  },
  {
    name: "Pirc Defense",
    shortName: "Pirc",
    description: "1. e4 d6 2. d4 Nf6 3. Nc3 g6",
    moves: ["e4", "d6", "d4", "Nf6", "Nc3", "g6"]
  },
  {
    name: "Modern Defense",
    shortName: "Modern",
    description: "1. e4 g6 2. d4 Bg7",
    moves: ["e4", "g6", "d4", "Bg7"]
  },

  // --- OPEN GAMES (1. e4 e5) ---
  
  // Ruy Lopez & Variations
  {
    name: "Ruy Lopez: Marshall Attack",
    shortName: "Ruy Lopez Marshall",
    description: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 O-O 8. c3 d5",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "O-O", "c3", "d5"]
  },
  {
    name: "Ruy Lopez: Berlin Defense",
    shortName: "Ruy Lopez Berlin",
    description: "1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6"]
  },
  {
    name: "Ruy Lopez: Exchange Variation",
    shortName: "Ruy Lopez Exchange",
    description: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Bxc6",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Bxc6"]
  },
  {
    name: "Ruy Lopez: Morphy Defense",
    shortName: "Ruy Lopez Morphy",
    description: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"]
  },
  {
    name: "Ruy Lopez (Spanish Game)",
    shortName: "Ruy Lopez",
    description: "1. e4 e5 2. Nf3 Nc6 3. Bb5",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"]
  },

  // Italian Game & Variations
  {
    name: "Italian Game: Fried Liver Attack",
    shortName: "Fried Liver",
    description: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Nxd5 6. Nxf7",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Nxd5", "Nxf7"]
  },
  {
    name: "Italian Game: Two Knights Defense",
    shortName: "Two Knights",
    description: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"]
  },
  {
    name: "Italian Game: Giuoco Piano",
    shortName: "Giuoco Piano",
    description: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"]
  },
  {
    name: "Italian Game",
    shortName: "Italian",
    description: "1. e4 e5 2. Nf3 Nc6 3. Bc4",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"]
  },

  // Other Open Games
  {
    name: "Evans Gambit",
    shortName: "Evans Gambit",
    description: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4"]
  },
  {
    name: "Scotch Game",
    shortName: "Scotch",
    description: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4",
    moves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4"]
  },
  {
    name: "Four Knights Game",
    shortName: "Four Knights",
    description: "1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6",
    moves: ["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6"]
  },
  {
    name: "Petroff Defense",
    shortName: "Petroff",
    description: "1. e4 e5 2. Nf3 Nf6",
    moves: ["e4", "e5", "Nf3", "Nf6"]
  },
  {
    name: "Vienna Game",
    shortName: "Vienna",
    description: "1. e4 e5 2. Nc3",
    moves: ["e4", "e5", "Nc3"]
  },
  {
    name: "King's Gambit Accepted",
    shortName: "KGA",
    description: "1. e4 e5 2. f4 exf4",
    moves: ["e4", "e5", "f4", "exf4"]
  },
  {
    name: "King's Gambit Declined",
    shortName: "KGD",
    description: "1. e4 e5 2. f4 Bc5",
    moves: ["e4", "e5", "f4", "Bc5"]
  },
  {
    name: "King's Gambit",
    shortName: "King's Gambit",
    description: "1. e4 e5 2. f4",
    moves: ["e4", "e5", "f4"]
  },
  {
    name: "Bishop's Opening",
    shortName: "Bishop's Opening",
    description: "1. e4 e5 2. Bc4",
    moves: ["e4", "e5", "Bc4"]
  },
  {
    name: "Philidor Defense",
    shortName: "Philidor",
    description: "1. e4 e5 2. Nf3 d6",
    moves: ["e4", "e5", "Nf3", "d6"]
  },

  // --- CLOSED GAMES (1. d4 d5) ---
  
  // Queen's Gambit & Defenses
  {
    name: "Queen's Gambit Accepted",
    shortName: "QGA",
    description: "1. d4 d5 2. c4 dxc4",
    moves: ["d4", "d5", "c4", "dxc4"]
  },
  {
    name: "Slav Defense",
    shortName: "Slav",
    description: "1. d4 d5 2. c4 c6",
    moves: ["d4", "d5", "c4", "c6"]
  },
  {
    name: "Semi-Slav Defense",
    shortName: "Semi-Slav",
    description: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6",
    moves: ["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "e6"]
  },
  {
    name: "Queen's Gambit Declined: Tarrasch Defense",
    shortName: "QGD Tarrasch",
    description: "1. d4 d5 2. c4 e6 3. Nc3 c5",
    moves: ["d4", "d5", "c4", "e6", "Nc3", "c5"]
  },
  {
    name: "Queen's Gambit Declined",
    shortName: "QGD",
    description: "1. d4 d5 2. c4 e6",
    moves: ["d4", "d5", "c4", "e6"]
  },
  {
    name: "Queen's Gambit",
    shortName: "Queen's Gambit",
    description: "1. d4 d5 2. c4",
    moves: ["d4", "d5", "c4"]
  },
  
  // Other Closed
  {
    name: "Catalan Opening",
    shortName: "Catalan",
    description: "1. d4 d5 2. c4 e6 3. Nf3 Nf6 4. g3",
    moves: ["d4", "d5", "c4", "e6", "Nf3", "Nf6", "g3"]
  },
  {
    name: "London System",
    shortName: "London",
    description: "1. d4 d5 2. Bf4",
    moves: ["d4", "d5", "Bf4"]
  },
  {
    name: "Queen's Pawn Game",
    shortName: "Queen's Pawn",
    description: "1. d4 d5",
    moves: ["d4", "d5"]
  },

  // --- SEMI-CLOSED GAMES (1. d4 Nf6, etc.) ---

  {
    name: "Nimzo-Indian Defense",
    shortName: "Nimzo-Indian",
    description: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4",
    moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"]
  },
  {
    name: "King's Indian Defense",
    shortName: "King's Indian",
    description: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7",
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7"]
  },
  {
    name: "Grünfeld Defense",
    shortName: "Grünfeld",
    description: "1. d4 Nf6 2. c4 g6 3. Nc3 d5",
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5"]
  },
  {
    name: "Queen's Indian Defense",
    shortName: "Queen's Indian",
    description: "1. d4 Nf6 2. c4 e6 3. Nf3 b6",
    moves: ["d4", "Nf6", "c4", "e6", "Nf3", "b6"]
  },
  {
    name: "Bogo-Indian Defense",
    shortName: "Bogo-Indian",
    description: "1. d4 Nf6 2. c4 e6 3. Nf3 Bb4+",
    moves: ["d4", "Nf6", "c4", "e6", "Nf3", "Bb4+"]
  },
  {
    name: "Modern Benoni",
    shortName: "Benoni",
    description: "1. d4 Nf6 2. c4 c5 3. d5 e6",
    moves: ["d4", "Nf6", "c4", "c5", "d5", "e6"]
  },
  {
    name: "Benko Gambit",
    shortName: "Benko Gambit",
    description: "1. d4 Nf6 2. c4 c5 3. d5 b5",
    moves: ["d4", "Nf6", "c4", "c5", "d5", "b5"]
  },
  {
    name: "Dutch Defense: Leningrad",
    shortName: "Dutch Leningrad",
    description: "1. d4 f5 2. c4 Nf6 3. g3 g6",
    moves: ["d4", "f5", "c4", "Nf6", "g3", "g6"]
  },
  {
    name: "Dutch Defense: Stonewall",
    shortName: "Dutch Stonewall",
    description: "1. d4 f5 2. c4 e6 3. Nf3 Nf6 4. g3 d5",
    moves: ["d4", "f5", "c4", "e6", "Nf3", "Nf6", "g3", "d5"]
  },
  {
    name: "Dutch Defense",
    shortName: "Dutch",
    description: "1. d4 f5",
    moves: ["d4", "f5"]
  },
  {
    name: "Trompowsky Attack",
    shortName: "Trompowsky",
    description: "1. d4 Nf6 2. Bg5",
    moves: ["d4", "Nf6", "Bg5"]
  }
]

/**
 * Find which opening a game is following
 * Checks in order, so place deeper variations before their general parents
 *
 * @param moves Array of played moves in SAN format
 * @returns The opening name if a match is found, null otherwise
 */
export function detectOpening(moves: string[]): string | null {
  if (moves.length === 0) return null

  for (const opening of POPULAR_OPENINGS) {
    if (moves.length < opening.moves.length) continue;

    // Check if the played moves match the opening's move sequence (only first N moves)
    let match = true
    for (let i = 0; i < opening.moves.length; i++) {
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