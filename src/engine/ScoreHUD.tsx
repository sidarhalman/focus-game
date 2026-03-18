import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface ScoreHUDProps {
  score: number
  combo?: number
  round?: number
  totalRounds?: number
}

export function ScoreHUD({ score, combo = 0, round, totalRounds }: ScoreHUDProps) {
  const [displayScore, setDisplayScore] = useState(score)
  const [showCombo, setShowCombo] = useState(false)

  useEffect(() => {
    setDisplayScore(score)
  }, [score])

  useEffect(() => {
    if (combo >= 2) {
      setShowCombo(true)
      const t = setTimeout(() => setShowCombo(false), 1200)
      return () => clearTimeout(t)
    }
  }, [combo])

  return (
    <div className="flex items-center justify-between px-5 py-3">
      <div className="flex flex-col">
        <span className="text-xs text-textSecondary font-medium uppercase tracking-wide">Puan</span>
        <span className="text-2xl font-bold text-textPrimary tabular-nums">{displayScore}</span>
      </div>

      <AnimatePresence>
        {showCombo && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -10 }}
            className="text-center"
          >
            <span className="text-xl font-black" style={{ color: '#F59E0B' }}>
              🔥 {combo}x COMBO
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {round !== undefined && totalRounds !== undefined && (
        <div className="flex flex-col items-end">
          <span className="text-xs text-textSecondary font-medium uppercase tracking-wide">Tur</span>
          <span className="text-2xl font-bold text-textPrimary tabular-nums">
            {round}/{totalRounds}
          </span>
        </div>
      )}
    </div>
  )
}
