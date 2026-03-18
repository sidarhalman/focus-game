import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScoreHUD } from '../../engine/ScoreHUD'
import type { GameComponentProps } from '../../engine/types'

const BUTTONS = [
  { color: '#6C63FF', label: '●' },
  { color: '#22C55E', label: '▲' },
  { color: '#F59E0B', label: '■' },
  { color: '#EF4444', label: '◆' },
]

function genSequence(length: number): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * BUTTONS.length))
}

export function SequenceTapGame({ difficulty, onComplete }: GameComponentProps) {
  const seqLength = 3 + Math.floor(difficulty / 2)
  const totalRounds = 5
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [sequence, setSequence] = useState<number[]>([])
  const [phase, setPhase] = useState<'showing' | 'input' | 'feedback'>('showing')
  const [showIndex, setShowIndex] = useState(0)
  const [userInput, setUserInput] = useState<number[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [finished, setFinished] = useState(false)
  const [lit, setLit] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const playSequence = useCallback((seq: number[]) => {
    setPhase('showing')
    setShowIndex(0)
    let i = 0
    const interval = Math.max(600 - difficulty * 30, 350)

    const next = () => {
      if (i < seq.length) {
        setShowIndex(i)
        setLit(seq[i])
        setTimeout(() => setLit(null), interval - 100)
        i++
        timerRef.current = setTimeout(next, interval)
      } else {
        setPhase('input')
        setUserInput([])
      }
    }
    timerRef.current = setTimeout(next, 400)
  }, [difficulty])

  const startRound = useCallback(() => {
    const seq = genSequence(seqLength)
    setSequence(seq)
    setFeedback(null)
    setUserInput([])
    playSequence(seq)
  }, [seqLength, playSequence])

  useEffect(() => {
    startRound()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const handleTap = (idx: number) => {
    if (phase !== 'input') return
    const newInput = [...userInput, idx]
    setUserInput(newInput)

    const expected = sequence[newInput.length - 1]
    if (idx !== expected) {
      setPhase('feedback')
      setFeedback('wrong')
      setCombo(0)
      setTimeout(() => {
        if (round >= totalRounds) { setFinished(true) } else { setRound(r => r + 1); startRound() }
      }, 900)
      return
    }

    if (newInput.length === sequence.length) {
      const newCombo = combo + 1
      const pts = 100 + (newCombo - 1) * 60
      setScore(s => s + pts)
      setCombo(newCombo)
      setPhase('feedback')
      setFeedback('correct')
      setTimeout(() => {
        if (round >= totalRounds) { setFinished(true) } else { setRound(r => r + 1); startRound() }
      }, 900)
    }
  }

  useEffect(() => {
    if (finished) {
      onComplete({ score, normalizedScore: Math.min(1000, score), accuracy: score / (totalRounds * 100), roundsPlayed: totalRounds, duration: totalRounds * 5, difficulty })
    }
  }, [finished])

  return (
    <div className="flex flex-col h-full px-5 pb-8">
      <ScoreHUD score={score} combo={combo} round={round} totalRounds={totalRounds} />

      <div className="flex-1 flex flex-col items-center justify-center gap-10">
        <AnimatePresence mode="wait">
          <motion.p key={phase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`text-sm font-semibold ${phase === 'input' ? 'text-primary' : phase === 'feedback' ? (feedback === 'correct' ? 'text-success' : 'text-error') : 'text-textSecondary'}`}>
            {phase === 'showing' ? 'Sırayı izle...' : phase === 'input' ? `Tekrarla (${userInput.length}/${sequence.length})` : feedback === 'correct' ? '✓ Mükemmel!' : '✗ Yanlış sıra'}
          </motion.p>
        </AnimatePresence>

        {/* Sequence indicator dots */}
        <div className="flex gap-2">
          {sequence.map((btnIdx, i) => (
            <motion.div key={i}
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: i < userInput.length ? BUTTONS[sequence[i]].color : (phase === 'showing' && showIndex === i ? BUTTONS[btnIdx].color : '#252540') }}
              animate={{ scale: phase === 'showing' && showIndex === i ? 1.4 : 1 }}
            />
          ))}
        </div>

        {/* 4 buttons */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          {BUTTONS.map((btn, idx) => (
            <motion.button key={idx}
              className="aspect-square rounded-3xl flex items-center justify-center text-4xl font-bold active:scale-90"
              style={{
                backgroundColor: lit === idx ? btn.color : btn.color + '33',
                color: lit === idx ? '#fff' : btn.color,
                boxShadow: lit === idx ? `0 0 24px ${btn.color}88` : 'none',
              }}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleTap(idx)}
              aria-label={`Button ${idx + 1}`}
            >
              {btn.label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
