import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TimerBar } from '../../engine/TimerBar'
import { ScoreHUD } from '../../engine/ScoreHUD'
import type { GameComponentProps } from '../../engine/types'

function generateNumbers(count: number): { value: number; x: number; y: number }[] {
  const nums: { value: number; x: number; y: number }[] = []
  const used: Array<{ x: number; y: number }> = []

  for (let i = 1; i <= count; i++) {
    let x: number, y: number, tries = 0
    do {
      x = 10 + Math.random() * 76
      y = 10 + Math.random() * 76
      tries++
    } while (used.some(u => Math.hypot(u.x - x, u.y - y) < 18) && tries < 50)

    used.push({ x, y })
    nums.push({ value: i, x, y })
  }
  return nums
}

export function NumberTrailGame({ difficulty, onComplete }: GameComponentProps) {
  const count = 5 + Math.floor(difficulty / 2)
  const timeLimit = Math.max(30 - difficulty * 2, 15)
  const totalRounds = 3

  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [numbers, setNumbers] = useState<{ value: number; x: number; y: number }[]>([])
  const [next, setNext] = useState(1)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [timerKey, setTimerKey] = useState(0)
  const [finished, setFinished] = useState(false)
  const startRef = { current: Date.now() }

  const startRound = useCallback(() => {
    setNumbers(generateNumbers(count))
    setNext(1)
    setFeedback(null)
    setTimerKey(k => k + 1)
    startRef.current = Date.now()
  }, [count])

  useEffect(() => { startRound() }, [])

  const handleTap = (value: number) => {
    if (value === next) {
      setFeedback('correct')
      setTimeout(() => setFeedback(null), 200)

      if (value === count) {
        const elapsed = (Date.now() - startRef.current) / 1000
        const timeBonus = Math.round((timeLimit - elapsed) * 20)
        setScore(s => s + 200 + Math.max(0, timeBonus))

        setTimeout(() => {
          if (round >= totalRounds) { setFinished(true) } else { setRound(r => r + 1); startRound() }
        }, 600)
      } else {
        setNext(n => n + 1)
      }
    } else {
      setFeedback('wrong')
      setScore(s => Math.max(0, s - 20))
      setTimeout(() => setFeedback(null), 300)
    }
  }

  const handleExpire = () => {
    if (round >= totalRounds) { setFinished(true) } else { setRound(r => r + 1); startRound() }
  }

  useEffect(() => {
    if (finished) {
      onComplete({ score, normalizedScore: Math.min(1000, score), accuracy: score / (totalRounds * 200), roundsPlayed: totalRounds, duration: totalRounds * timeLimit, difficulty })
    }
  }, [finished])

  return (
    <div className="flex flex-col h-full px-5 pb-8">
      <ScoreHUD score={score} round={round} totalRounds={totalRounds} />
      <div className="px-2 mb-4">
        <TimerBar key={timerKey} duration={timeLimit} onExpire={handleExpire} color="#22C55E" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-textSecondary text-sm font-medium">
          Sırayla dokun: <span className="text-primary font-bold">{next}</span>
        </p>

        {/* Relative positioned game area */}
        <div className="relative w-full" style={{ height: '380px', maxWidth: '360px', background: '#1A1A2E', borderRadius: '24px' }}>
          {numbers.map(({ value, x, y }) => {
            const isTapped = value < next
            const isNext = value === next

            return (
              <motion.button
                key={value}
                style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                className="w-12 h-12 rounded-full font-bold text-lg flex items-center justify-center active:scale-90"
                animate={{
                  scale: isNext ? [1, 1.15, 1] : 1,
                  backgroundColor: isTapped ? '#252540' : isNext ? '#6C63FF' : '#252540',
                  color: isTapped ? '#5A5A7A' : isNext ? '#fff' : '#9090B0',
                  boxShadow: isNext ? '0 0 20px #6C63FF88' : 'none',
                }}
                transition={{ repeat: isNext ? Infinity : 0, duration: 1 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => !isTapped && handleTap(value)}
                aria-label={`Number ${value}`}
              >
                {value}
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.p key={feedback} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`text-sm font-bold ${feedback === 'correct' ? 'text-success' : 'text-error'}`}>
              {feedback === 'correct' ? '✓' : '✗ -20'}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
