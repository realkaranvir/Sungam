import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const src = path.join(root, 'node_modules', 'stockfish', 'bin')
const dest = path.join(root, 'public')

fs.mkdirSync(dest, { recursive: true })

const files = [
  'stockfish-18-lite-single.js',
  'stockfish-18-lite-single.wasm',
]

for (const file of files) {
  const from = path.join(src, file)
  const to = path.join(dest, file)
  fs.copyFileSync(from, to)
  const size = (fs.statSync(to).size / 1024 / 1024).toFixed(1)
  console.log(`Copied ${file} (${size} MB)`)
}
