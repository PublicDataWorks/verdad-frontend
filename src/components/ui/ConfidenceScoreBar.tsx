type Level = 'low' | 'medium' | 'high'

const CHART_CONFIGS: Record<Level, { filledBars: number; color: string }> = {
  low: { filledBars: 3, color: '#005EF4' },
  medium: { filledBars: 4, color: '#005EF4' },
  high: { filledBars: 5, color: '#005EF4' }
}

// `level` comes from the unvalidated `confidence_scores` jsonb, so an unexpected value
// still has to render as "low" rather than crash.
const isLevel = (value: string): value is Level => value in CHART_CONFIGS

export function ConfidenceChart({ level }: { level: Level }) {
  const totalBars = 5
  const { filledBars, color } = CHART_CONFIGS[isLevel(level) ? level : 'low']

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
