#!/bin/bash

# Setup Polyglot opening book
# Creates a minimal opening book with e2e4

echo "Setting up minimal opening book..."
mkdir -p public

# Create a minimal Polyglot book using Python
python3 << 'EOF'
import struct

# Magic number: ctbr = 0x63746272
magic = struct.pack('>I', 0x63746272)

# Create a simple entry for e2e4
# Position key: 0 (simplified)
key = struct.pack('>I', 0)

# Move: e2e4 = 0x1a02 (from e2 (26) to e4 (34))
move = struct.pack('>H', 0x1a02)

# Weight: 100
weight = struct.pack('>H', 100)

# Learn: 0
learn = struct.pack('>I', 0)

# Combine into single entry (12 bytes)
entry = magic + key + move + weight + learn

# Write to file
with open('public/opening-book.bin', 'wb') as f:
    f.write(entry)

print("Created minimal Polyglot book")
print(f"Size: {len(entry)} bytes")
EOF

if [ -f "public/opening-book.bin" ]; then
    echo "Opening book setup complete!"
    echo "Note: This is a minimal book with only e2e4. For full book support, you can download a Polyglot book from a reliable source."
else
    echo "Failed to create opening book"
    exit 1
fi