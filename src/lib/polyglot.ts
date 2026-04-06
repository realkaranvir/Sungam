/**
 * Polyglot Opening Book Format Parser
 *
 * Polyglot uses a binary format with the following structure:
 * - 4-byte magic number (0x63746272 "ctbr" for Chess, "pbbr" for Poker)
 * - For each entry:
 *   - 4-byte position key (64-bit integer, zobrist key)
 *   - 2-byte move (encoded as from square, to square, promotion piece)
 *   - 2-byte weight (how many times this move was played in this position)
 *   - 4-byte learn data (additional book data, often unused)
 */

const MAGIC_NUMBER = 0x63746272 // "ctbr" for chess

export interface PolyglotEntry {
  key: bigint
  move: number // encoded move
  weight: number
  learn: number
}

export interface OpeningBookMove {
  move: string // UCI move
  weight: number
  san: string // Standard Algebraic Notation
}

/**
 * Parse a UCI move string to Polyglot move encoding
 * Format: e2e4 (from square, to square, optional promotion)
 */
export function encodeMove(uci: string): number {
  const from = squareToIndex(uci.slice(0, 2))
  const to = squareToIndex(uci.slice(2, 4))
  const promotion = uci.length === 5 ? pieceToPromotion(uci[4]) : 0

  return (from << 16) | (to << 8) | promotion
}

/**
 * Decode a Polyglot move encoding to UCI
 */
export function decodeMove(move: number): string {
  const from = (move >> 16) & 0x3f
  const to = (move >> 8) & 0x3f
  const promotion = move & 0xff

  let promotionPiece = ''
  if (promotion !== 0) {
    promotionPiece = promotionToPiece(promotion)
  }

  return `${indexToSquare(from)}${indexToSquare(to)}${promotionPiece}`
}

/**
 * Square to Polyglot index (0-63)
 */
function squareToIndex(square: string): number {
  const files = 'abcdefgh'
  const ranks = '87654321'
  const file = files.indexOf(square[0])
  const rank = ranks.indexOf(square[1])
  return rank * 8 + file
}

/**
 * Polyglot index to square
 */
function indexToSquare(index: number): string {
  const files = 'abcdefgh'
  const ranks = '87654321'
  return `${files[index % 8]}${ranks[Math.floor(index / 8)]}`
}

/**
 * Piece to Polyglot promotion encoding
 */
function pieceToPromotion(piece: string): number {
  const promotionPieces: Record<string, number> = {
    'n': 1,
    'b': 2,
    'r': 3,
    'q': 4
  }
  return promotionPieces[piece.toLowerCase()] ?? 0
}

/**
 * Simple hash function for position keys
 * This matches the minimal book we created
 */
export function getPositionKey(fen: string): bigint {
  // For the minimal book, we use a simple hash based on piece positions
  let hash = 0n

  // Parse FEN to get piece positions
  const parts = fen.split(' ')
  const boardPart = parts[0]
  const rows = boardPart.split('/')

  for (let row = 0; row < 8; row++) {
    let col = 0
    for (let char of rows[row]) {
      if (char.match(/[0-9]/)) {
        col += parseInt(char)
      } else {
        // Piece to index: p=0, n=1, b=2, r=3, q=4, k=5
        const pieceIndex = getPieceIndex(char)
        if (pieceIndex !== -1) {
          // Simple hash: position * piece_type + 1
          hash ^= BigInt((row * 8 + col) * (pieceIndex + 1))
        }
        col++
      }
    }
  }

  // Debug logging
  console.log('Position key calculated for:', fen.substring(0, 20) + '...')
  console.log('Key:', hash.toString(16), 'Decimal:', hash)

  return hash
}

/**
 * Get piece index for hashing
 */
function getPieceIndex(char: string): number {
  const pieceMap: Record<string, number> = {
    'p': 0, 'n': 1, 'b': 2, 'r': 3, 'q': 4, 'k': 5,
    'P': 0, 'N': 1, 'B': 2, 'R': 3, 'Q': 4, 'K': 5
  }
  return pieceMap[char] ?? -1
}

/**
 * Polyglot promotion encoding to piece
 */
function promotionToPiece(code: number): string {
  const pieces = ['', 'n', 'b', 'r', 'q']
  return pieces[code] ?? ''
}

/**
 * Read a big-endian 4-byte integer from buffer
 */
function readBigEndianUint32(buffer: Uint8Array, offset: number): number {
  return (
    (buffer[offset] << 24) |
    (buffer[offset + 1] << 16) |
    (buffer[offset + 2] << 8) |
    buffer[offset + 3]
  )
}

/**
 * Read a big-endian 2-byte integer from buffer
 */
function readBigEndianUint16(buffer: Uint8Array, offset: number): number {
  return (buffer[offset] << 8) | buffer[offset + 1]
}

/**
 * Parse a Polyglot book from a Uint8Array
 */
export function parsePolyglotBook(buffer: Uint8Array): Map<bigint, OpeningBookMove[]> {
  const entries = new Map<bigint, OpeningBookMove[]>()

  if (buffer.length < 8) {
    console.error('Polyglot book too small')
    return entries
  }

  // Check magic number
  const magic = readBigEndianUint32(buffer, 0)
  if (magic !== MAGIC_NUMBER) {
    console.error('Invalid Polyglot magic number')
    return entries
  }

  let offset = 4
  while (offset + 12 <= buffer.length) {
    const key = BigInt(readBigEndianUint32(buffer, offset))
    const move = readBigEndianUint16(buffer, offset + 4)
    const weight = readBigEndianUint16(buffer, offset + 6)
    // Learn data, unused in this implementation

    const uci = decodeMove(move)

    if (!entries.has(key)) {
      entries.set(key, [])
    }

    entries.get(key)!.push({
      move: uci,
      weight,
      san: '' // Will be filled by chess.js
    })

    offset += 12
  }

  console.log('Book entries:', Array.from(entries.entries()).map(([key, moves]) => ({
    key: key.toString(16),
    move: moves[0].move,
    weight: moves[0].weight
  })))

  return entries
}