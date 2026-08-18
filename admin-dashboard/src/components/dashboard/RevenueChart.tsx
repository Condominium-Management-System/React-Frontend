import { useState } from 'react'
import type { MonthlyRevenue } from '../../pages/Dashboard/dashboardMockData'

interface RevenueChartProps {
  data: MonthlyRevenue[]
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const width = 800
  const height = 260
  const paddingX = 45
  const paddingTop = 25
  const paddingBottom = 35

  const maxAmount = Math.max(...data.map((d) => d.amount), 140000)

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * (width - paddingX * 2)
    const y =
      height -
      paddingBottom -
      (d.amount / maxAmount) * (height - paddingTop - paddingBottom)
    return { x, y, month: d.month, amount: d.amount }
  })

  // Build SVG path string for area fill and stroke line
  const linePath = points.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`
    const prev = points[index - 1]
    const cp1x = prev.x + (point.x - prev.x) / 2
    const cp1y = prev.y
    const cp2x = prev.x + (point.x - prev.x) / 2
    const cp2y = point.y
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`
  }, '')

  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]
  const areaPath = `${linePath} L ${lastPoint.x} ${height - paddingBottom} L ${firstPoint.x} ${height - paddingBottom} Z`

  // Horizontal grid lines
  const gridYValues = [0, 40000, 80000, 120000]

  return (
    <div className="flex flex-col justify-between rounded-xl border border-gray-800/80 bg-[#0F131C] p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-gray-100">Revenue Performance</h3>
          <p className="text-xs text-gray-400">Monthly revenue overview across network</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#D3AD32]" />
          <span className="text-xs font-semibold text-gray-300">Revenue ($)</span>
        </div>
      </div>

      <div className="relative mt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D3AD32" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#D3AD32" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Lines & Y Axis Labels */}
          {gridYValues.map((val) => {
            const y =
              height -
              paddingBottom -
              (val / maxAmount) * (height - paddingTop - paddingBottom)
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#1F2937"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  fill="#6B7280"
                  fontSize="10"
                  textAnchor="end"
                >
                  ${val / 1000}k
                </text>
              </g>
            )
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#goldGradient)" />

          {/* Curved Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#D3AD32"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Data Points & X Axis Labels */}
          {points.map((point, idx) => {
            const isHovered = hoveredIndex === idx
            return (
              <g
                key={point.month}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* X Axis Label */}
                <text
                  x={point.x}
                  y={height - 10}
                  fill={isHovered ? '#D3AD32' : '#9CA3AF'}
                  fontSize="11"
                  fontWeight={isHovered ? '700' : '500'}
                  textAnchor="middle"
                >
                  {point.month}
                </text>

                {/* Point Circle */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? '6' : '4'}
                  fill="#0F131C"
                  stroke="#D3AD32"
                  strokeWidth="2.5"
                  className="transition-all duration-150"
                />

                {/* Tooltip on Hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={point.x - 45}
                      y={point.y - 38}
                      width="90"
                      height="26"
                      rx="6"
                      fill="#1F2937"
                      stroke="#D3AD32"
                      strokeWidth="1"
                    />
                    <text
                      x={point.x}
                      y={point.y - 21}
                      fill="#F9FAFB"
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      ${point.amount.toLocaleString()}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export default RevenueChart
