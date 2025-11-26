import { useMemo } from 'react'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  strokeColor?: string
  fillColor?: string
  strokeWidth?: number
  className?: string
}

export default function Sparkline({
  data,
  width = 80,
  height = 24,
  strokeColor = 'currentColor',
  fillColor,
  strokeWidth = 1.5,
  className = ''
}: SparklineProps) {
  const path = useMemo(() => {
    if (!data || data.length === 0) return ''

    const max = Math.max(...data, 1) // Ensure at least 1 to avoid division by zero
    const min = Math.min(...data, 0)
    const range = max - min || 1

    const padding = 2
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * chartWidth
      const y = padding + chartHeight - ((value - min) / range) * chartHeight
      return { x, y }
    })

    // Create the line path
    const linePath = points.map((point, index) => (index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`)).join(' ')

    return linePath
  }, [data, width, height])

  const areaPath = useMemo(() => {
    if (!fillColor || !data || data.length === 0) return ''

    const max = Math.max(...data, 1)
    const min = Math.min(...data, 0)
    const range = max - min || 1

    const padding = 2
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * chartWidth
      const y = padding + chartHeight - ((value - min) / range) * chartHeight
      return { x, y }
    })

    const linePath = points.map((point, index) => (index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`)).join(' ')

    // Close the path for fill
    const lastPoint = points[points.length - 1]
    const firstPoint = points[0]
    const closePath = `L ${lastPoint.x} ${height - padding} L ${firstPoint.x} ${height - padding} Z`

    return linePath + closePath
  }, [data, width, height, fillColor])

  if (!data || data.length === 0) {
    return (
      <svg width={width} height={height} className={className}>
        <line x1={2} y1={height / 2} x2={width - 2} y2={height / 2} stroke={strokeColor} strokeWidth={1} opacity={0.3} />
      </svg>
    )
  }

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      {fillColor && areaPath && <path d={areaPath} fill={fillColor} opacity={0.2} />}
      <path d={path} fill='none' stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}
