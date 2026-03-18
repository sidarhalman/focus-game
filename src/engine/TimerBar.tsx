import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface TimerBarProps {
  duration: number
  onExpire: () => void
  color?: string
  paused?: boolean
}

export function TimerBar({ duration, onExpire, color = '#6C63FF', paused = false }: TimerBarProps) {
  const [remaining, setRemaining] = useState(duration)
  const startTime = useRef<number | null>(null)
  const rafRef = useRef<number>(0)
  const pausedAt = useRef<number | null>(null)

  useEffect(() => {
    startTime.current = Date.now()

    const tick = () => {
      if (paused) {
        pausedAt.current = pausedAt.current ?? Date.now()
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      if (pausedAt.current && startTime.current) {
        startTime.current += Date.now() - pausedAt.current
        pausedAt.current = null
      }

      const elapsed = (Date.now() - (startTime.current ?? Date.now())) / 1000
      const left = Math.max(0, duration - elapsed)
      setRemaining(left)

      if (left <= 0) {
        onExpire()
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [duration, onExpire, paused])

  const pct = (remaining / duration) * 100
  const isLow = pct < 25

  return (
    <div className="w-full h-2 bg-surfaceHigh rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full transition-colors duration-500"
        style={{
          width: `${pct}%`,
          backgroundColor: isLow ? '#EF4444' : color,
        }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  )
}
