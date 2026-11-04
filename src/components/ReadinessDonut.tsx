import { CircleCheck } from 'lucide-react'

type ReadinessDonutProps = {
  percent: number
  size?: number
  className?: string
}

// A ring that fills in orange as the calendar gets ready. At 100% it becomes a green check.
export function ReadinessDonut({ percent, size = 24, className }: ReadinessDonutProps) {
  if (percent >= 100) {
    return <CircleCheck size={size} className={className} style={{ color: 'var(--positive-color)' }} aria-hidden="true" />
  }
  const stroke = 2
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--ui-background-color)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--content-color-working-orange)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${(circumference * percent) / 100} ${circumference}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  )
}
