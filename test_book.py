import struct

# Magic number: ctbr = 0x63746272 (big endian)
magic = struct.pack('>I', 0x63746272)

# Key for starting position (72) - big endian format
key = struct.pack('>I', 72)

# Move: e2e4 = 0x1a02 (big endian)
move = struct.pack('>H', 0x1a02)

# Weight: 100 (big endian)
weight = struct.pack('>H', 100)

# Learn: 0 (big endian)
learn = struct.pack('>I', 0)

# Combine into single entry (16 bytes)
entry = magic + key + move + weight + learn

# Write to file
with open('public/opening-book.bin', 'wb') as f:
    f.write(entry)

print("Created minimal Polyglot book with correct big endian format")
print(f"Size: {len(entry)} bytes")
print(f"Hex: {entry.hex()}")

# Verify by reading back
magic_read = struct.unpack('>I', entry[0:4])[0]
key_read = struct.unpack('>I', entry[4:8])[0]
move_read = struct.unpack('>H', entry[8:10])[0]
weight_read = struct.unpack('>H', entry[10:12])[0]

print(f"\nVerification:")
print(f"Magic: {hex(magic_read)}")
print(f"Key: {key_read}")
print(f"Move: {move_read} (e2e4 = {0x1a02})")
print(f"Weight: {weight_read}")

# Check file size
import os
size = os.path.getsize('public/opening-book.bin')
print(f"\nFile size: {size} bytes")
