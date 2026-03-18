import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScoreHUD } from '../../engine/ScoreHUD'
import type { GameComponentProps } from '../../engine/types'

interface Target {
  id: number
  x: number
  y: number
  size: number
  color: string
  born: number
  lifetime: number
}

const COLORS = ['#6C63FF', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6']
let idCounter = 0

export function PrecisionTapGame({ difficulty, onComplete }: GameComponentProps) {
  const baseSize = Math.max(52 - difficulty * 3, 36)
  const spawnInterval = Math.max(1800 - difficulty * 100, 700)
  const lifetime = Math.max(3000 - difficulty * 150, 1200)
  const totalTargets = 15 + difficulty * 2

  const [targets, setTargets] = useState<Target[]>([])
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [tapped, setTapped] = useState(0)
  const [missed, setMissed] = useState(0)
  const [finished, setFinished] = useState(false)
  const [spawned, setSpawned] = useState(0)
  const spawnedRef = useRef(0)
  const comboRef = useRef(0)

  const spawnTarget = useCallback(() => {
    if (spawnedRef.current >= totalTargets) return

    const size = baseSize + Math.random() * 16 - 8
    const margin = size / 2
    const x = margin + Math.random() * (100 - (size / 3.93))
    const y = margin + Math.random() * (100 - (size / 8.52))
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    const id = ++idCounter
    const born = Date.now()

    setTargets(ts => [...ts, { id, x, y, size, color, born, lifetime }])
    spawnedRef.current++
    setSpawned(spawnedRef.current)
  }, [baseSize, lifetime, totalTargets])

  useEffect(() => {
    const interval = setInterval(() => {
      spawnTarget()
      if (spawnedRef.current >= totalTargets) clearInterval(interval)
    }, spawnInterval)

    spawnTarget()

    return () => clearInterval(interval)
  }, [spawnTarget, spawnInterval, totalTargets])

  // Remove expired targets
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setTargets(ts => {
        const expired = ts.filter(t => now - t.born >= t.lifetime)
        if (expired.length > 0) {
          setMissed(m => m + expired.length)
          comboRef.current = 0
          setCombo(0)
        }
        return ts.filter(t => now - t.born < t.lifetime)
      })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (tapped + missed >= totalTargets && spawned >= totalTargets) {
      setFinished(true)
    }
  }, [tapped, missed, totalTargets, spawned])

  const handleTap = (id: number, e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation()
    setTargets(ts => ts.filter(t => t.id !== id))
    comboRef.current++
    const newCombo = comboRef.current
    setCombo(newCombo)
    const pts = 50 + (newCombo - 1) * 20
    setScore(s => s + pts)
    setTapped(t => t + 1)
  }

  useEffect(() => {
    if (finished) {
      const accuracy = totalTargets > 0 ? tapped / totalTargets : 0
      onComplete({ score, normalizedScore: Math.min(1000, score), accuracy, roundsPlayed: totalTargets, duration: (totalTargets * spawnInterval) / 1000, difficulty })
    }
  }, [finished])

  const progress = Math.min(1, (tapped + missed) / totalTargets)

  return (
    <div className="flex flex-col h-full pb-8">
      <div className="px-5">
        <ScoreHUD score={score} combo={combo} />
        <div className="w-full h-2 bg-surfaceHigh rounded-full overflow-hidden mb-3">
          <motion.div className="h-full bg-primary rounded-full" style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="text-center text-xs text-textSecondary mb-2">{tapped}/{totalTargets} hedef</p>
      </div>

      {/* Game area */}
      <div className="flex-1 relative mx-3 rounded-3xl overflow-hidden" style={{ background: '#1A1A2E' }}>
        <AnimatePresence>
          {targets.map(target => (
            <motion.button
              key={target.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{
                position: 'absolute',
                left: `${target.x}%`,
                top: `${target.y}%`,
                width: target.size,
                height: target.size,
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                backgroundColor: target.color,
                boxShadow: `0 0 20px ${target.color}66`,
              }}
              onClick={(e) => handleTap(target.id, e)}
              onTouchEnd={(e) => handleTap(target.id, e)}
              aria-label="Tap target"
            />
          ))}
        </AnimatePresence>

        {finished && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-bg/80">
            <div className="text-center">
              <p className="text-4xl font-black text-textPrimary">{score}</p>
              <p className="text-textSecondary">puan</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
