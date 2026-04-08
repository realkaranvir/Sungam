import { analyzeGame, calculateAccuracy } from '@/lib/testAccuracy'

// This is a game from your chess.com history
const gamePgn = `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2026.04.04"]
[Round "-"]
[White "realkaranvir"]
[Black "luvylilac"]
[Result "1-0"]
[WhiteElo "799"]
[BlackElo "780"]
[TimeControl "60+1"]
[UTCDate "2026.04.04"]
[UTCTime "02:28:06"]

1. e4 {[%clk 0:00:59.8]} 1... e5 {[%clk 0:00:59.5]} 2. Nc3 {[%clk 0:00:59.4]} 2... d6 {[%clk 0:00:59.1]} 3. Bc4 {[%clk 0:00:59.1]} 3... Nc6 {[%clk 0:00:57.8]} 4. d3 {[%clk 0:00:58.4]} 4... Nf6 {[%clk 0:00:57]} 5. Nge2 {[%clk 0:00:57.3]} 5... Be7 {[%clk 0:00:56.3]} 6. O-O {[%clk 0:00:57.2]} 6... O-O {[%clk 0:00:55.8]} 7. f4 {[%clk 0:00:56.8]} 7... a6 {[%clk 0:00:55.3]} 8. a4 {[%clk 0:00:52.8]} 8... exf4 {[%clk 0:00:53.3]} 9. Bxf4 {[%clk 0:00:51.6]} 9... Bg4 {[%clk 0:00:51.8]} 10. h3 {[%clk 0:00:49.9]} 10... Bxe2 {[%clk 0:00:51]} 11. Qxe2 {[%clk 0:00:49.1]} 11... h6 {[%clk 0:00:49]} 12. Qf2 {[%clk 0:00:45.7]} 12... Nh7 {[%clk 0:00:45.4]} 13. Qg3 {[%clk 0:00:42.7]} 13... Bh4 {[%clk 0:00:43.8]} 14. Qg4 {[%clk 0:00:41.4]} 14... Bf6 {[%clk 0:00:41.6]} 15. Bxh6 {[%clk 0:00:39.5]} 15... Bxc3 {[%clk 0:00:37.1]} 16. bxc3 {[%clk 0:00:37.1]} 16... Qf6 {[%clk 0:00:35.8]} 17. Rxf6 {[%clk 0:00:35.8]} 17... Nxf6 {[%clk 0:00:34.3]} 18. Qxg7# {[%clk 0:00:34.9]} 1-0
`

async function testAccuracy() {
  console.log('Analyzing game...')
  const { analyzedMoves } = await analyzeGame(gamePgn)

  console.log(`\nTotal moves analyzed: ${analyzedMoves.length}`)
  console.log(`White moves: ${analyzedMoves.filter(m => m.color === 'w').length}`)
  console.log(`Black moves: ${analyzedMoves.filter(m => m.color === 'b').length}`)

  const whiteAccuracy = calculateAccuracy(analyzedMoves, 'w')
  const blackAccuracy = calculateAccuracy(analyzedMoves, 'b')

  console.log(`\nCalculated Accuracy (using sigmoid + weighting):`)
  console.log(`White: ${whiteAccuracy.toFixed(2)}%`)
  console.log(`Black: ${blackAccuracy.toFixed(2)}%`)

  console.log(`\nChess.com Reported Accuracy (from API):`)
  console.log(`White: 94.97%`)
  console.log(`Black: 72.08%`)

  console.log(`\nDifferences:`)
  console.log(`White: ${Math.abs(whiteAccuracy - 94.97).toFixed(2)}%`)
  console.log(`Black: ${Math.abs(blackAccuracy - 72.08).toFixed(2)}%`)

  console.log(`\n--- Sample Moves ---`)
  analyzedMoves.slice(0, 10).forEach((move) => {
    if (move.color === 'w') {
      console.log(`\nMove ${move.moveNumber}. ${move.san}`)
      console.log(`  cpBefore: ${move.cpBefore}`)
      console.log(`  bestMoveSan: ${move.bestMoveSan}`)
      if (move.san === move.bestMoveSan) {
        console.log(`  ✓ Correct!`)
      } else {
        console.log(`  ✗ Wrong`)
      }
    }
  })
}

testAccuracy()