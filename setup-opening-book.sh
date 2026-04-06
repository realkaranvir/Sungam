#!/bin/bash

# Setup Polyglot opening book
# Downloads and converts a full Polyglot opening book

echo "Setting up Polyglot opening book..."

# Create a public directory if it doesn't exist
mkdir -p public

# Download Polyglot book using Python
python3 << 'EOF'
import requests
import struct

# Try to download from a reliable source
book_urls = [
    # UCCI Books (Polyglot)
    "https://github.com/andygriffiths/UcciBooks/raw/main/books/polyglot-opening-book.bin",
    # Niessner Openbook
    "https://raw.githubusercontent.com/niessner/openbook/master/openbook.bin",
    # Opening book from Stockfish repository
    "https://raw.githubusercontent.com/official-stockfish/books/master/opening.bin",
]

book_file = None

for url in book_urls:
    try:
        print(f"Trying to download from: {url}")
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            # Check if it's a valid binary file
            if len(response.content) > 100:
                # Check for Polyglot magic number
                magic = struct.unpack('>I', response.content[0:4])[0]
                if magic == 0x63746272:  # "ctbr"
                    book_file = response.content
                    print(f"✓ Downloaded valid Polyglot book: {len(book_file)} bytes")
                    break
                else:
                    print(f"✗ Invalid magic number: {hex(magic)}")
            else:
                print(f"✗ File too small: {len(response.content)} bytes")
    except Exception as e:
        print(f"✗ Failed to download from {url}: {e}")

if book_file:
    with open('public/opening-book.bin', 'wb') as f:
        f.write(book_file)
    print("\n✓ Opening book setup complete!")
    print(f"  File: public/opening-book.bin")
    print(f"  Size: {len(book_file)} bytes")
else:
    print("\n✗ Failed to download a valid Polyglot book")
    print("\nUsing minimal book instead...")
    # Create a minimal Polyglot book
    magic = struct.pack('>I', 0x63746272)
    key = struct.pack('>I', 0)
    move = struct.pack('>H', 0x1a02)  # e2e4
    weight = struct.pack('>H', 100)
    learn = struct.pack('>I', 0)
    entry = magic + key + move + weight + learn

    with open('public/opening-book.bin', 'wb') as f:
        f.write(entry)

    print(f"  Created minimal book: {len(entry)} bytes (e2e4 only)")
EOF

if [ -f "public/opening-book.bin" ]; then
    echo ""
    echo "The opening book will be loaded automatically by the app."
    echo "If you want a full book, you can re-run this script or manually download from a Polyglot repository."
else
    echo "Failed to create opening book"
    exit 1
fi