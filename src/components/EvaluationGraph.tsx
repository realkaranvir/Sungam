import { useMemo } from 'react'

interface EvaluationGraphProps {
  evaluations: number[]  // cpBefore values for each move
  moveNumbers: number[]  // move numbers for each evaluation
  currentMoveIndex?: number
  height?: number
}

export function EvaluationGraph({
  evaluations,
  moveNumbers,
  currentMoveIndex = -1,
  height = 200
}: EvaluationGraphProps) {
  const graphData = useMemo(() => {
    if (evaluations.length === 0) return { points: [], maxEval: 0, minEval: 0 }

    const maxEval = Math.max(...evaluations)
    const minEval = Math.min(...evaluations)

    // Add start point (before any moves)
    const points = [[0, evaluations[0]] as [number, number], ...evaluations.map((cp, i) => [moveNumbers[i], cp])]

    return { points, maxEval, minEval }
  }, [evaluations, moveNumbers])

  const { points, maxEval, minEval } = graphData

  // Calculate SVG dimensions and scaling
  const graphWidth = 1000
  const graphHeight = height
  const paddingBottom = 30
  const paddingTop = 20
  const graphEffectiveHeight = graphHeight - paddingBottom - paddingTop

  // Calculate scales
  const range = maxEval - minEval
  const yScale = range > 0 ? graphEffectiveHeight / range : 1

  // Convert data points to SVG coordinates
  const svgPoints = points.map(([x, y]) => {
    const svgX = (x / (moveNumbers[moveNumbers.length - 1] || 1)) * graphWidth
    const svgY = paddingTop + graphEffectiveHeight - ((y - minEval) * yScale)
    return `${svgX},${svgY}`
  }).join(' ')

  // Calculate current position
  const currentX = currentMoveIndex >= 0 && currentMoveIndex < moveNumbers.length
    ? (moveNumbers[currentMoveIndex] / (moveNumbers[moveNumbers.length - 1] || 1)) * graphWidth
    : graphWidth

  const currentY = currentMoveIndex >= 0 && currentMoveIndex < evaluations.length
    ? paddingTop + graphEffectiveHeight - ((evaluations[currentMoveIndex] - minEval) * yScale)
    : paddingTop + graphEffectiveHeight - ((evaluations[evaluations.length - 1] - minEval) * yScale)

  // Calculate Y position for 0 evaluation line
  const zeroY = paddingTop + graphEffectiveHeight - ((0 - minEval) * yScale)

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Graph */}
      <div className="relative w-full" style={{ height }}>
        <svg
          viewBox={`0 0 ${graphWidth} ${graphHeight}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Background */}
          <rect
            width={graphWidth}
            height={graphHeight}
            fill="#18181b"
            rx="4"
          />

          {/* Threshold line at 0 */}
          <line
            x1={0}
            y1={zeroY}
            x2={graphWidth}
            y2={zeroY}
            stroke="#3f3f46"
            strokeWidth={2}
            strokeDasharray="4 4"
          />

          {/* Evaluation line */}
          <polyline
            points={svgPoints}
            fill="none"
            stroke="#a1a1aa"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Current position indicator */}
          {currentMoveIndex >= 0 && (
            <>
              <line
                x1={currentX}
                y1={paddingTop}
                x2={currentX}
                y2={paddingTop + graphEffectiveHeight}
                stroke="#fff"
                strokeWidth={2}
                strokeOpacity={0.5}
              />
              <circle
                cx={currentX}
                cy={currentY}
                r={6}
                fill="#fff"
              />
            </>
          )}
        </svg>

        {/* X-axis labels (move numbers) */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
          {moveNumbers.slice(0, Math.ceil(moveNumbers.length / 5)).map((num, i) => {
            const index = Math.floor((moveNumbers.length - 1) / 4) * i
            const actualNum = moveNumbers[index]
            return (
              <span
                key={num}
                className="text-xs text-zinc-500"
                style={{
                  left: `${(actualNum / (moveNumbers[moveNumbers.length - 1] || 1)) * 100}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                {actualNum}
              </span>
            )
          })}
        </div>
      </div>

      {/* Current evaluation */}
      {currentMoveIndex >= 0 && evaluations[currentMoveIndex] !== undefined && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">Evaluation:</span>
          <span className={`font-mono font-medium ${
            evaluations[currentMoveIndex] > 0 ? 'text-emerald-400' :
            evaluations[currentMoveIndex] < 0 ? 'text-red-400' :
            'text-zinc-300'
          }`}>
            {(evaluations[currentMoveIndex] / 100).toFixed(2)} pawns
          </span>
        </div>
      )}
    </div>
  )
}