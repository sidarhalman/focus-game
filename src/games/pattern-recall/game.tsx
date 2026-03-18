import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScoreHUD } from '../../engine/ScoreHUD'
import type { GameComponentProps } from '../../engine/types'

const GRID = 9
const BASE_SHOW = 3

function getRandomCells(count: number, total: number): number[] {
  const cells = Array.from({ length: total }, (_, i) => i)
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cells[i], cells[j]] = [cells[j], cells[i]]
  }
  return cells.slice(0, count)
}

export function PatternRecallGame({ difficulty, onComplete }: GameComponentProps) {
  const showCount = Math.min(BASE_SHOW + Math.floor(difficulty / 2), 7)
  const showDuration = Math.max(2000 - difficulty * 150, 700)
  const totalRounds = 5

  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [phase, setPhase] = useState<'showing' | 'recall' | 'feedback'>('showing')
  const [pattern, setPattern] = useState<number[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [finished, setFinished] = useState(false)

  const startRound = useCallback(() => {
    const p = getRandomCells(showCount, GRID)
    setPattern(p)
    setSelected([])
    setFeedback(null)
    setPhase('showing')

    setTimeout(() => setPhase('recall'), showDuration)
  }, [showCount, showDuration])

  useEffect(() => {
    startRound()
  }, [])

  const handleCellTap = (i: number) => {
    if (phase !== 'recall' || selected.includes(i)) return

    const newSelected = [...selected, i]
    setSelected(newSelected)

    if (newSelected.length === showCount) {
      const isCorrect =
        newSelected.length === pattern.length &&
        newSelected.every((c) => pattern.includes(c))

      setPhase('feedback')

      if (isCorrect) {
        const newCombo = combo + 1
        const points = 100 + (newCombo - 1) * 50
        setScore((s) => s + points)
        setCombo(newCombo)
        setFeedback('correct')
      } else {
        setCombo(0)
        setFeedback('wrong')
      }

      setTimeout(() => {
        if (round >= totalRounds) {
          setFinished(true)
        } else {
          setRound((r) => r + 1)
          startRound()
        }
      }, 900)
    }
  }

  useEffect(() => {
    if (finished) {
      const accuracy = score / (totalRounds * 100)
      onComplete({
        score,
        normalizedScore: Math.min(1000, score),
        accuracy: Math.min(1, accuracy),
        roundsPlayed: totalRounds,
        duration: totalRounds * 4,
        difficulty,
      })
    }
  }, [finished])

  return (
    <div className="flex flex-col h-full px-5 pb-8">
      <ScoreHUD score={score} combo={combo} round={round} totalRounds={totalRounds} />

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <AnimatePresence mode="wait">
          {phase === 'showing' && (
            <motion.p
              key="showing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-textSecondary text-sm font-medium"
            >
              Deseni ezberle!
            </motion.p>
          )}
          {phase === 'recall' && (
            <motion.p
              key="recall"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-primary text-sm font-semibold"
            >
              Hangi kareler parlıyordu?
            </motion.p>
          )}
          {phase === 'feedback' && (
            <motion.p
              key="feedback"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-lg font-bold ${feedback === 'correct' ? 'text-success' : 'text-error'}`}
            >
              {feedback === 'correct' ? '✓ Doğru!' : '✗ Yanlış'}
            </motion.p>
          )}
        </AnimatePresence>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-3 w-64">
          {Array.from({ length: GRID }, (_, i) => {
            const isPattern = pattern.includes(i)
            const isSelected = selected.includes(i)
            const isCorrectSelected = phase === 'feedback' && isSelected && pattern.includes(i)
            const isWrongSelected = phase === 'feedback' && isSelected && !pattern.includes(i)
            const isMissed = phase === 'feedback' && !isSelected && pattern.includes(i)

            let bg = 'bg-surface'
            if (phase === 'showing' && isPattern) bg = 'bg-primary'
            if (phase === 'recall' && isSelected) bg = 'bg-primary'
            if (isCorrectSelected) bg = 'bg-success'
            if (isWrongSelected) bg = 'bg-error'
            if (isMissed) bg = 'bg-warning'

            return (
              <motion.button
                key={i}
                className={`aspect-square rounded-2xl ${bg} active:scale-90 transition-colors`}
                style={{ minHeight: '72px' }}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleCellTap(i)}
                aria-label={`Cell ${i + 1}`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
