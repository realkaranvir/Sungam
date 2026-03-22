const PGN_PATH = '/puzzles.pgn'

interface Puzzle {
  id: string
  fen: string
  moves: string[]
  solution: string
  rating: number
  category: string
  title: string
  theme: string
}

let parsedPuzzles: Puzzle[] | null = null

/**
 * Parse the PGN file and extract puzzle data
 */
async function parsePuzzles(): Promise<Puzzle[]> {
  const response = await fetch(PGN_PATH)
  if (!response.ok) {
    throw new Error(`Failed to load puzzles: ${response.statusText}`)
  }

  const pgn = await response.text()

  // PGN files have puzzles separated by empty lines
  // Each puzzle starts with headers like [Event "..."]
  const puzzles: Puzzle[] = []
  let currentId = 0

  // Split by [Event ""] header (puzzle boundaries)
  const puzzleBlocks = pgn.trim().split(/\[Event "/g)

  console.log(`Found ${puzzleBlocks.length} puzzle blocks...`)

  let skippedMalformed = 0

  for (const block of puzzleBlocks) {
    // Prepend [Event " for proper parsing
    const fullBlock = `[Event "${block}`

    currentId++

    // Extract headers - find all lines starting with '['
    const headerLines = fullBlock.split('\n').filter(line => line.trim().startsWith('['))

    let fen = ''
    let moves: string[] = []
    let solution = ''
    let rating = 1000
    let category = 'General'
    let title = `Puzzle ${currentId}`
    let theme = 'tactical'
    let result = '*'

    // Parse headers
    for (const line of headerLines) {
      const match = line.match(/\[(\w+)\s+"([^"]*)"\]/)
      if (match) {
        const [, key, value] = match
        switch (key) {
          case 'Event':
            title = value.replace('Puzzle', '').trim() || title
            break
          case 'PuzzleCategory':
            category = value
            break
          case 'PuzzleWinner':
            rating = parseInt(value, 10)
            break
          case 'FEN':
            fen = value
            break
          case 'Result':
            result = value
            break
          case 'Theme':
            theme = value
            break
        }
      }
    }

    // Extract moves from the body (after headers)
    const body = fullBlock.split('\n').slice(headerLines.length).join('\n')

    if (fen) {
      // Check if body contains error messages (malformed puzzles)
      const hasError = body.includes('{Error reading move')

      if (!hasError) {
        // Find the moves line (any line with SAN moves, not starting with "[")
        const lines = body.split('\n')
        for (const line of lines) {
          const trimmed = line.trim()
          // Skip empty lines, headers, and error comments
          if (trimmed.length === 0 || trimmed.startsWith('[') || trimmed.includes('{')) {
            continue
          }

          // Check if this line contains moves (at least 2 space-separated parts, not error messages)
          const sanParts = trimmed.split(' ').filter(m => m && !m.includes('{') && m !== result)
          if (sanParts.length >= 2) {
            // This is the moves line, extract SAN moves
            for (const sanMove of sanParts) {
              // Skip error messages
              if (sanMove.includes('Error reading move')) {
                continue
              }

              // Remove move number prefix (e.g., "1." → "", "16..." → "")
              const sanMoveClean = sanMove.replace(/^\d+\.\.\.?/, '')

              if (sanMoveClean) {
                // Save SAN moves directly (don't convert to UCI here)
                // We'll convert to UCI on the fly when validating
                moves.push(sanMoveClean)
              }

              // Last move is the solution
              solution = sanMoveClean || sanMove
            }
            break
          }
        }
      } else {
        skippedMalformed++
      }
    } else {
      skippedMalformed++
    }

    const puzzle: Puzzle = {
      id: `puzzle_${currentId}`,
      fen,
      moves,
      solution,
      rating,
      category,
      title,
      theme,
    }

    puzzles.push(puzzle)
  }

  console.log(`Parsed ${puzzles.length} valid puzzles (skipped ${skippedMalformed} malformed)`)

  return puzzles

  return puzzles
}

/**
 * Get all puzzles (parse and cache if needed)
 */
export async function getPuzzles(): Promise<Puzzle[]> {
  if (parsedPuzzles) {
    return parsedPuzzles
  }

  parsedPuzzles = await parsePuzzles()
  return parsedPuzzles
}

/**
 * Get a random puzzle
 */
export async function getRandomPuzzle(): Promise<Puzzle> {
  const puzzles = await getPuzzles()
  const randomIndex = Math.floor(Math.random() * puzzles.length)
  return puzzles[randomIndex]
}
