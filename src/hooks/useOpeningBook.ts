import { useEffect, useState } from 'react'
import { openingBook } from '@/lib/openingBook'

/**
 * Hook to load the opening book asynchronously
 */
export function useOpeningBook() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadBook = async () => {
      if (openingBook.isLoaded()) {
        setIsLoaded(true)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Load the opening book from the public directory
        const response = await fetch('/opening-book.bin')
        if (!response.ok) {
          throw new Error('Failed to load opening book')
        }

        const buffer = await response.arrayBuffer()
        const uint8Array = new Uint8Array(buffer)

        // Check if it's a valid Polyglot book
        if (uint8Array.length < 8) {
          throw new Error('Book file too small')
        }

        const magic = (uint8Array[0] << 24) |
                      (uint8Array[1] << 16) |
                      (uint8Array[2] << 8) |
                      uint8Array[3]

        if (magic !== 0x63746272) { // "ctbr"
          throw new Error('Invalid Polyglot magic number')
        }

        openingBook.loadFromBuffer(uint8Array)

        setIsLoaded(true)
      } catch (err) {
        setError(err as Error)
        console.error('Failed to load opening book:', err)
        // Continue without the book - app will still work, just without book moves
      } finally {
        setIsLoading(false)
      }
    }

    loadBook()
  }, [])

  return {
    isLoaded,
    isLoading,
    error,
    book: openingBook,
  }
}