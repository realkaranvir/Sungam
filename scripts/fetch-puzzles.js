#!/usr/bin/env node

import { writeFileSync, existsSync, statSync } from 'fs'
import { createWriteStream } from 'fs'
import https from 'https'

const PGN_URL = 'https://raw.githubusercontent.com/xinyangz/chess-tactics-pgn/master/tactics.pgn'
const OUTPUT_PATH = 'public/puzzles.pgn'

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest)
    const request = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close()
        // Clean up partial file
        try {
          import('fs').then(({ unlinkSync }) => unlinkSync(dest))
        } catch (e) {}
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`))
        return
      }

      response.pipe(file)

      file.on('finish', () => {
        file.close()
        resolve()
      })
    })

    request.on('error', (err) => {
      file.close()
      reject(err)
    })

    request.on('timeout', () => {
      file.close()
      request.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

async function main() {
  console.log('📥 Checking for existing puzzles.pgn...\n')

  if (existsSync(OUTPUT_PATH)) {
    const stats = statSync(OUTPUT_PATH)
    console.log(`✅ File already exists: ${OUTPUT_PATH}`)
    console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
    console.log('\nSkipping download. To fetch fresh puzzles, delete the file and run this script again.')
    return
  }

  console.log('📥 Downloading puzzles from GitHub...\n')
  console.log(`URL: ${PGN_URL}`)
  console.log(`Output: ${OUTPUT_PATH}\n`)

  try {
    await downloadFile(PGN_URL, OUTPUT_PATH)

    const stats = statSync(OUTPUT_PATH)
    console.log(`\n✅ Successfully downloaded ${OUTPUT_PATH}`)
    console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)

    // Check if file is not empty
    if (stats.size === 0) {
      throw new Error('Downloaded file is empty')
    }

    console.log('\nDone! Next steps:')
    console.log('  1. Run "node scripts/convert-puzzles.js" to convert to JSON')
    console.log('  2. Add puzzles route to your app')
  } catch (err) {
    console.error('\n❌ Error:', err.message || String(err))
    process.exit(1)
  }
}

main()