import { Check, Lock } from 'lucide-react'
import type { TaskStatus } from '../../types/journey'

export function HexNode({ status, size = 40 }: { status: TaskStatus; size?: number }) {
  const isDone = status === 'completed' || status === 'verified'
  const isCurrent = status === 'current'
  const isSentBack = status === 'sent_back'
  const isLocked = status === 'locked'

  const fill = isDone
    ? 'var(--color-primary)'
    : isSentBack
    ? 'var(--color-danger)'
    : isCurrent
    ? 'var(--color-primary)'
    : 'var(--color-surface)'

  const stroke = isDone || isCurrent
    ? 'var(--color-primary)'
    : isSentBack
    ? 'var(--color-danger)'
    : 'var(--color-border)'

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      {isCurrent && (
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-40"
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
      )}
      <svg viewBox="0 0 100 100" width={size} height={size} className="relative">
        <polygon
          points="50,3 93,26 93,74 50,97 7,74 7,26"
          fill={isLocked ? 'var(--color-canvas)' : fill}
          stroke={stroke}
          strokeWidth={isCurrent ? 6 : 4}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {isDone && <Check size={size * 0.4} color="white" strokeWidth={3} />}
        {isLocked && <Lock size={size * 0.35} color="var(--color-ink-muted)" />}
      </div>
    </div>
  )
}