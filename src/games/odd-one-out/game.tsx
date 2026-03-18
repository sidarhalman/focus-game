import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TimerBar } from '../../engine/TimerBar'
import { ScoreHUD } from '../../engine/ScoreHUD'
import type { GameComponentProps } from '../../engine/types'

const EMOJIS_BY_CATEGORY: Record<string, string[]> = {
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁'],
  fruits: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🍑', '🥭', '🍍', '🥝'],
  shapes: ['🔵', '🔴', '🟡', '🟢', '🟣', '🟠', '⚫', '⚪', '🔶', '🔷'],
  sports: ['⚽', '🏀', '🏈', '⚾', '🥎', '🏐', '🏉', '🎾', '🏸', '🥊'],
}

const CATEGORIES = Object.keys(EMOJIS_BY_CATEGORY)

function generateRound(gridSize: number) {
  const mainCat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
  const altCats = CATEGORIES.filter(c => c !== mainCat)
  const altCat = altCats[Math.floor(Math.random() * altCats.length)]

  const mainEmojis = [...EMOJIS_BY_CATEGORY[mainCat]].sort(() => Math.random() - 0.5).slice(0, gridSize - 1)
  const oddEmoji = EMOJIS_BY_CATEGORY[altCat][Math.floor(Math.random() * EMOJIS_BY_CATEGORY[altCat].length)]
  const oddIndex = Math.floor(Math.random() * gridSize)

  const items = [...mainEmojis]
  items.splice(oddIndex, 0, oddEmoji)
  return { items, oddIndex }
}

export function OddOneOutGame({ difficulty, onComplete }: GameComponentProps) {
  const gridSize = difficulty < 3 ? 6 : difficulty < 6 ? 9 : 12
  const timeLimit = Math.max(20 - difficulty, 10)
  const totalRounds = 6

  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [items, setItems] = useState<string[]>([])
  const [oddIndex, setOddIndex] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [timerKey, setTimerKey] = useState(0)
  const [finished, setFinished] = useState(false)
  const [totalTime, setTotalTime] = useState(0)
  const startRef = { current: Date.now() }

  const startRound = useCallback(() => {
    const { items: newItems, oddIndex: ni } = generateRound(gridSize)
    setItems(newItems)
    setOddIndex(ni)
    setFeedback(null)
    setTimerKey(k => k + 1)
    startRef.current = Date.now()
  }, [gridSize])

  useEffect(() => { startRound() }, [])

  const handleTap = (idx: number) => {
    if (feedback) return
    const elapsed = (Date.now() - startRef.current) / 1000
    const isCorrect = idx === oddIndex

    if (isCorrect) {
      const newCombo = combo + 1
      const speed = Math.max(0, timeLimit - elapsed)
      const pts = Math.round(80 + speed * 10 + (newCombo - 1) * 40)
      setScore(s => s + pts)
      setCombo(newCombo)
      setFeedback('correct')
    } else {
      setCombo(0)
      setFeedback('wrong')
    }

    setTotalTime(t => t + elapsed)

    setTimeout(() => {
      if (round >= totalRounds) { setFinished(true) } else { setRound(r => r + 1); startRound() }
    }, 600)
  }

  const handleExpire = () => {
    setCombo(0)
    setFeedback('wrong')
    setTimeout(() => {
      if (round >= totalRounds) { setFinished(true) } else { setRound(r => r + 1); startRound() }
    }, 600)
  }

  useEffect(() => {
    if (finished) {
      onComplete({ score, normalizedScore: Math.min(1000, score), accuracy: score / (totalRounds * 80), roundsPlayed: totalRounds, duration: Math.round(totalTime), difficulty })
    }
  }, [finished])

  const cols = gridSize === 6 ? 3 : gridSize === 9 ? 3 : 4

  return (
    <div className="flex flex-col h-full px-5 pb-8">
      <ScoreHUD score={score} combo={combo} round={round} totalRounds={totalRounds} />
      <div className="px-2 mb-4">
        <TimerBar key={timerKey} duration={timeLimit} onExpire={handleExpire} color="#6C63FF" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <AnimatePresence mode="wait">
          <motion.p key={feedback ?? 'q'} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`text-sm font-semibold ${feedback === 'correct' ? 'text-success' : feedback === 'wrong' ? 'text-error' : 'text-textSecondary'}`}>
            {feedback === 'correct' ? '✓ Buldu!' : feedback === 'wrong' ? '✗ Yanlış!' : 'Farklı olanı bul'}
          </motion.p>
        </AnimatePresence>

        <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, width: '100%', maxWidth: '340px' }}>
          {items.map((emoji, i) => (
            <motion.button key={`${timerKey}-${i}`}
              className="aspect-square rounded-2xl bg-surface flex items-center justify-center text-3xl active:scale-90"
              style={{
                opacity: feedback && i !== oddIndex ? 0.4 : 1,
                backgroundColor: feedback && i === oddIndex ? (feedback === 'correct' ? '#22C55E33' : '#EF444433') : '#1A1A2E',
              }}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleTap(i)}
              aria-label={emoji}
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
