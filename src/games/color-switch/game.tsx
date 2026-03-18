import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TimerBar } from '../../engine/TimerBar'
import { ScoreHUD } from '../../engine/ScoreHUD'
import type { GameComponentProps } from '../../engine/types'

type Rule = 'tap-match' | 'tap-different'

const COLOR_MAP: Record<string, string> = {
  Kırmızı: '#EF4444',
  Mavi: '#3B82F6',
  Yeşil: '#22C55E',
  Sarı: '#F59E0B',
}
const COLORS = Object.keys(COLOR_MAP)

function randomColor(exclude?: string) {
  const pool = exclude ? COLORS.filter(c => c !== exclude) : COLORS
  return pool[Math.floor(Math.random() * pool.length)]
}

function generateRound(rule: Rule) {
  const textColor = randomColor()
  const inkColor = Math.random() > 0.5 ? textColor : randomColor(textColor)
  const isMatch = textColor === inkColor
  const shouldTap = rule === 'tap-match' ? isMatch : !isMatch
  return { textColor, inkColor, shouldTap }
}

export function ColorSwitchGame({ difficulty, onComplete }: GameComponentProps) {
  const totalRounds = 8 + difficulty
  const timeLimit = 3.5 - difficulty * 0.1

  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [rule, setRule] = useState<Rule>('tap-match')
  const [textColor, setTextColor] = useState('')
  const [inkColor, setInkColor] = useState('')
  const [shouldTap, setShouldTap] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null)
  const [timerKey, setTimerKey] = useState(0)
  const [finished, setFinished] = useState(false)
  const responded = useRef(false)

  const switchRule = (currentRound: number) => {
    if (currentRound % 4 === 0) return 'tap-different' as Rule
    return 'tap-match' as Rule
  }

  const startRound = useCallback((rnd: number) => {
    const r = switchRule(rnd)
    setRule(r)
    const { textColor: tc, inkColor: ic, shouldTap: st } = generateRound(r)
    setTextColor(tc)
    setInkColor(ic)
    setShouldTap(st)
    setFeedback(null)
    setTimerKey(k => k + 1)
    responded.current = false
  }, [])

  useEffect(() => { startRound(1) }, [])

  const advance = (fb: 'correct' | 'wrong' | 'timeout') => {
    if (responded.current) return
    responded.current = true
    setFeedback(fb)
    setTimeout(() => {
      if (round >= totalRounds) { setFinished(true) } else { const nr = round + 1; setRound(nr); startRound(nr) }
    }, 700)
  }

  const handleTap = () => {
    if (feedback) return
    const pts = shouldTap ? 100 + combo * 30 : 0
    if (shouldTap) {
      setScore(s => s + pts)
      setCombo(c => c + 1)
      advance('correct')
    } else {
      setCombo(0)
      advance('wrong')
    }
  }

  const handleSkip = () => {
    if (feedback) return
    if (!shouldTap) {
      setScore(s => s + 80)
      setCombo(c => c + 1)
      advance('correct')
    } else {
      setCombo(0)
      advance('wrong')
    }
  }

  const handleExpire = () => {
    if (!shouldTap) {
      setScore(s => s + 60)
      setCombo(c => c + 1)
      advance('correct')
    } else {
      setCombo(0)
      advance('timeout')
    }
  }

  useEffect(() => {
    if (finished) {
      onComplete({ score, normalizedScore: Math.min(1000, score), accuracy: score / (totalRounds * 100), roundsPlayed: totalRounds, duration: totalRounds * 3, difficulty })
    }
  }, [finished])

  return (
    <div className="flex flex-col h-full px-5 pb-8">
      <ScoreHUD score={score} combo={combo} round={round} totalRounds={totalRounds} />
      <div className="px-2 mb-4">
        <TimerBar key={timerKey} duration={timeLimit} onExpire={handleExpire} color="#6C63FF" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        {/* Rule indicator */}
        <div className="bg-surfaceHigh px-4 py-2 rounded-2xl">
          <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">
            {rule === 'tap-match' ? '👆 Renk eşleşiyorsa dokun' : '✋ Renk farklıysa dokun'}
          </span>
        </div>

        {/* Word displayed in ink color */}
        <AnimatePresence mode="wait">
          <motion.div key={`${timerKey}`}
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0 }}
            className="text-6xl font-black"
            style={{ color: COLOR_MAP[inkColor] }}
          >
            {textColor}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {feedback && (
            <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className={`text-lg font-bold ${feedback === 'correct' ? 'text-success' : 'text-error'}`}>
              {feedback === 'correct' ? '✓' : '✗'}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Two action buttons */}
        <div className="flex gap-4 w-full">
          <motion.button whileTap={{ scale: 0.92 }} onClick={handleTap}
            className="flex-1 py-5 rounded-3xl bg-primary text-white font-bold text-lg active:opacity-80">
            👆 Dokun
          </motion.button>
          <motion.button whileTap={{ scale: 0.92 }} onClick={handleSkip}
            className="flex-1 py-5 rounded-3xl bg-surfaceHigh text-textSecondary font-bold text-lg active:opacity-80">
            ⏭ Geç
          </motion.button>
        </div>
      </div>
    </div>
  )
}
