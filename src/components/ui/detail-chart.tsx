import { useState, useMemo, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface DetailChartProps {
  data: number[]
  labels?: string[]
  width?: number
  height?: number
  strokeColor?: string
  fillColor?: string
  className?: string
}

export default function DetailChart({
  data,
  labels = [],
  width: propWidth,
  height = 100,
  strokeColor = '#ea580c',
  fillColor = '#ea580c',
  className = ''
}: DetailChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [containerWidth, setContainerWidth] = useState(propWidth || 300)
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Measure container width for responsive sizing
  useEffect(() => {
    if (propWidth) {
      setContainerWidth(propWidth)
      return
    }

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth)
      }
    }

    updateWidth()

    const resizeObserver = new ResizeObserver(updateWidth)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [propWidth])

  const width = containerWidth

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null

    const max = Math.max(...data, 1)
    const min = 0 // Always start from 0 for better context
    const range = max - min || 1

    const paddingLeft = 35
    const paddingRight = 10
    const paddingTop = 15
    const paddingBottom = 25

    const chartWidth = width - paddingLeft - paddingRight
    const chartHeight = height - paddingTop - paddingBottom

    const points = data.map((value, index) => {
      const x = paddingLeft + (index / (data.length - 1 || 1)) * chartWidth
      const y = paddingTop + chartHeight - ((value - min) / range) * chartHeight
      return { x, y, value }
    })

    // Create smooth curve using cardinal spline
    const linePath = points.map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`

      // Use quadratic bezier for smoother curves
      const prev = points[index - 1]
      const cpx = (prev.x + point.x) / 2
      return `Q ${cpx} ${prev.y} ${point.x} ${point.y}`
    }).join(' ')

    // Area path for gradient fill
    const firstPoint = points[0]
    const lastPoint = points[points.length - 1]
    const areaPath = linePath +
      ` L ${lastPoint.x} ${paddingTop + chartHeight}` +
      ` L ${firstPoint.x} ${paddingTop + chartHeight} Z`

    // Y-axis grid lines (3-4 lines)
    const gridLines = []
    const numGridLines = 4
    for (let i = 0; i <= numGridLines; i++) {
      const value = Math.round(min + (range * i) / numGridLines)
      const y = paddingTop + chartHeight - ((value - min) / range) * chartHeight
      gridLines.push({ y, value })
    }

    return {
      points,
      linePath,
      areaPath,
      gridLines,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      chartWidth,
      chartHeight,
      max,
      min
    }
  }, [data, width, height])

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartData || !svgRef.current) return

    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left

    // Find the closest point
    let closestIndex = 0
    let closestDist = Infinity

    chartData.points.forEach((point, index) => {
      const dist = Math.abs(point.x - x)
      if (dist < closestDist) {
        closestDist = dist
        closestIndex = index
      }
    })

    setHoveredIndex(closestIndex)
  }

  const handleMouseLeave = () => {
    setHoveredIndex(null)
  }

  if (!data || data.length === 0 || !chartData) {
    return (
      <div
        ref={containerRef}
        className={cn('flex items-center justify-center bg-orange-50/50 dark:bg-orange-900/20 rounded', className)}
        style={{ height }}
      >
        <span className='text-xs text-orange-400'>No data</span>
      </div>
    )
  }

  const { points, linePath, areaPath, gridLines, paddingLeft, paddingTop, chartHeight } = chartData

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className='cursor-crosshair'
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id='areaGradient' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor={fillColor} stopOpacity='0.3' />
            <stop offset='100%' stopColor={fillColor} stopOpacity='0.05' />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map((line, i) => (
          <g key={i}>
            <line
              x1={paddingLeft}
              y1={line.y}
              x2={width - 10}
              y2={line.y}
              stroke='currentColor'
              strokeOpacity={0.1}
              strokeDasharray={i === 0 ? 'none' : '2,2'}
            />
            <text
              x={paddingLeft - 5}
              y={line.y + 4}
              textAnchor='end'
              className='fill-orange-500/60 dark:fill-orange-400/60'
              fontSize={10}
            >
              {line.value.toLocaleString()}
            </text>
          </g>
        ))}

        {/* X-axis labels (show first, middle, last) */}
        {labels.length > 0 && [0, Math.floor(labels.length / 2), labels.length - 1].map((i) => {
          if (!points[i]) return null
          return (
            <text
              key={i}
              x={points[i].x}
              y={height - 5}
              textAnchor={i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'}
              className='fill-orange-500/60 dark:fill-orange-400/60'
              fontSize={10}
            >
              {labels[i]}
            </text>
          )
        })}

        {/* Area fill */}
        <path d={areaPath} fill='url(#areaGradient)' />

        {/* Line */}
        <path
          d={linePath}
          fill='none'
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinecap='round'
          strokeLinejoin='round'
        />

        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={hoveredIndex === index ? 5 : 3}
            fill={hoveredIndex === index ? strokeColor : 'white'}
            stroke={strokeColor}
            strokeWidth={2}
            className='transition-all duration-150'
          />
        ))}

        {/* Hover indicator line */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <line
            x1={points[hoveredIndex].x}
            y1={paddingTop}
            x2={points[hoveredIndex].x}
            y2={paddingTop + chartHeight}
            stroke={strokeColor}
            strokeWidth={1}
            strokeDasharray='3,3'
            opacity={0.5}
          />
        )}
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div
          className='absolute pointer-events-none bg-orange-900 dark:bg-orange-100 text-white dark:text-orange-900 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10'
          style={{
            left: Math.min(Math.max(points[hoveredIndex].x, 40), width - 60),
            top: Math.max(points[hoveredIndex].y - 35, 5),
            transform: 'translateX(-50%)'
          }}
        >
          <div className='font-semibold'>{points[hoveredIndex].value.toLocaleString()} snippets</div>
          {labels[hoveredIndex] && (
            <div className='opacity-75'>{labels[hoveredIndex]}</div>
          )}
        </div>
      )}
    </div>
  )
}
