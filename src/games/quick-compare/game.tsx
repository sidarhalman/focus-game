import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TimerBar } from '../../engine/TimerBar'
import { ScoreHUD } from '../../engine/ScoreHUD'
import type { GameComponentProps } from '../../engine/types'

function genPair(difficulty: number): { a: number; b: number; answer: 'left' | 'right' | 'equal' } {
  const max = 10 + difficulty * 5
  const a = Math.floor(Math.random() * max) + 1
  const offset = Math.floor(Math.random() * Math.max(1, difficulty)) + (difficulty < 3 ? 1 : 0)
  const coin = Math.random()
  let b: number
  if (coin < 0.4) b = a + offset
  else if (coin < 0.8) b = a - offset
  else b = a

  const answer = a > b ? 'left' : a < b ? 'right' : 'equal'
  return { a, b, answer }
}

export function QuickCompareGame({ difficulty, onComplete }: GameComponentProps) {
  const totalRounds = 10
  const timeLimit = Math.max(4 - difficulty * 0.2, 2)

  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [pair, setPair] = useState({ a: 0, b: 0, answer: 'left' as 'left' | 'right' | 'equal' })
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [timerKey, setTimerKey] = useState(0)
  const [finished, setFinished] = useState(false)
  const responded = useRef(false)

  const startRound = useCallback(() => {
    setPair(genPair(difficulty))
    setFeedback(null)
    setTimerKey(k => k + 1)
    responded.current = false
  }, [difficulty])

  useEffect(() => { startRound() }, [])

  const respond = (choice: 'left' | 'right' | 'equal') => {
    if (feedback || responded.current) return
    responded.current = true

    const correct = choice === pair.answer
    if (correct) {
      const newCombo = combo + 1
      setScore(s => s + 80 + (newCombo - 1) * 25)
      setCombo(newCombo)
      setFeedback('correct')
    } else {
      setCombo(0)
      setFeedback('wrong')
    }

    setTimeout(() => {
      if (round >= totalRounds) { setFinished(true) } else { setRound(r => r + 1); startRound() }
    }, 600)
  }

  const handleExpire = () => {
    setCombo(0)
    setFeedback('wrong')
    responded.current = true
    setTimeout(() => {
      if (round >= totalRounds) { setFinished(true) } else { setRound(r => r + 1); startRound() }
    }, 600)
  }

  useEffect(() => {
    if (finished) {
      onComplete({ score, normalizedScore: Math.min(1000, score), accuracy: score / (totalRounds * 80), roundsPlayed: totalRounds, duration: totalRounds * timeLimit, difficulty })
    }
  }, [finished])

  return (
    <div className="flex flex-col h-full px-5 pb-8">
      <ScoreHUD score={score} combo={combo} round={round} totalRounds={totalRounds} />
      <div className="px-2 mb-4">
        <TimerBar key={timerKey} duration={timeLimit} onExpire={handleExpire} color="#F59E0B" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <p className="text-textSecondary text-sm font-medium">Hangisi daha büyük?</p>

        {/* Numbers */}
        <div className="flex items-center gap-6">
          <motion.div key={`a-${timerKey}`} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="w-32 h-32 rounded-3xl bg-surface flex items-center justify-center text-5xl font-black text-textPrimary">
            {pair.a}
          </motion.div>
          <span className="text-3xl text-textDim font-bold">vs</span>
          <motion.div key={`b-${timerKey}`} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="w-32 h-32 rounded-3xl bg-surface flex items-center justify-center text-5xl font-black text-textPrimary">
            {pair.b}
          </motion.div>
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.p initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className={`text-xl font-bold ${feedback === 'correct' ? 'text-success' : 'text-error'}`}>
              {feedback === 'correct' ? `✓ ${pair.answer === 'left' ? pair.a : pair.answer === 'right' ? pair.b : '='} doğru!` : '✗ Yanlış'}
            </motion.p>
          )}
        </AnimatePresence>

        {/* 3 choice buttons */}
        <div className="flex gap-3 w-full">
          {(['left', 'equal', 'right'] as const).map((choice) => (
            <motion.button key={choice} whileTap={{ scale: 0.92 }}
              onClick={() => respond(choice)}
              className="flex-1 py-4 rounded-2xl font-bold text-sm active:opacity-80"
              style={{
                backgroundColor: feedback && choice === pair.answer ? '#22C55E33' :
                  feedback && choice !== pair.answer ? '#EF444433' : '#1A1A2E',
                color: feedback && choice === pair.answer ? '#22C55E' :
                  feedback && choice !== pair.answer ? '#EF4444' : '#9090B0',
                border: '2px solid',
                borderColor: feedback && choice === pair.answer ? '#22C55E' :
                  feedback && choice !== pair.answer ? '#EF4444' : '#252540',
              }}>
              {choice === 'left' ? `◀ Sol` : choice === 'right' ? `Sağ ▶` : `= Eşit`}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
