#!/bin/bash

# Download Polyglot opening book
# Using a standard Polyglot book from a reliable source

BOOK_URL="https://github.com/andygriffiths/UcciBooks/raw/main/books/polyglot-opening-book.bin"
BOOK_FILE="opening-book.bin"

echo "Downloading Polyglot opening book..."
curl -L -o "$BOOK_FILE" "$BOOK_URL"

if [ -f "$BOOK_FILE" ]; then
    echo "Book downloaded successfully: $BOOK_FILE"
    echo "Size: $(ls -lh "$BOOK_FILE" | awk '{print $5}')"

    # Create a public directory if it doesn't exist
    mkdir -p public

    # Move the book to the public directory
    mv "$BOOK_FILE" "public/"
    echo "Book moved to public/opening-book.bin"

    echo "Opening book setup complete!"
    echo "The book will be loaded by the app on startup."
else
    echo "Failed to download the opening book"
    exit 1
fi