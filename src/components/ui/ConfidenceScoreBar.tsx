type Level = 'low' | 'medium' | 'high'

export function ConfidenceChart({ level }: { level: Level }) {
  const getChartConfig = (level: Level) => {
    const configs = {
      low: { filledBars: 3, color: '#005EF4' },
      medium: { filledBars: 4, color: '#005EF4' },
      high: { filledBars: 5, color: '#005EF4' }
    }
    return configs[level] || configs.low // Default to low if invalid level
  }

  const totalBars = 5
  const { filledBars, color } = getChartConfig(level)

  return (
    <div className='flex h-3 items-end gap-0.5'>
      {Array.from({ length: totalBars }).map((_, i) => (
        <div
          key={i}
          className={`w-0.5 rounded-sm ${i < filledBars ? `bg-[${color}]` : 'bg-muted'}`}
          style={{ height: `${((i + 1) / totalBars) * 100}%` }}
        />
      ))}
    </div>
  )
}
