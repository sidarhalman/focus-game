import { motion } from 'framer-motion'
import type { GameResult, GameDefinition } from '../engine/types'

interface ResultScreenProps {
  result: GameResult
  game: GameDefinition
  onNext: () => void
  isLastGame: boolean
  gamesLeft: number
}

export function ResultScreen({ result, game, onNext, isLastGame, gamesLeft }: ResultScreenProps) {
  const pct = Math.round(result.accuracy * 100)
  const grade = result.normalizedScore >= 800 ? 'Mükemmel' : result.normalizedScore >= 600 ? 'İyi' : result.normalizedScore >= 400 ? 'Gelişiyor' : 'Devam Et'
  const gradeColor = result.normalizedScore >= 800 ? '#22C55E' : result.normalizedScore >= 600 ? '#6C63FF' : result.normalizedScore >= 400 ? '#F59E0B' : '#9090B0'

  return (
    <div className="fixed inset-0 bg-bg flex flex-col items-center justify-center px-6" style={{ maxWidth: '393px', margin: '0 auto' }}>
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full text-center">

        {/* Game icon */}
        <motion.div initial={{ y: -20 }} animate={{ y: 0 }}
          className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-4"
          style={{ backgroundColor: game.color + '33' }}>
          {game.emoji}
        </motion.div>

        <h2 className="text-xl font-black text-textPrimary mb-1">{game.name}</h2>
        <p className="text-sm font-bold mb-6" style={{ color: gradeColor }}>{grade}</p>

        {/* Score ring */}
        <div className="relative w-36 h-36 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#252540" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="44" fill="none"
              stroke={gradeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - result.normalizedScore / 1000) }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-textPrimary">{result.score}</span>
            <span className="text-xs text-textSecondary">puan</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Doğruluk', value: `${pct}%` },
            { label: 'Tur', value: result.roundsPlayed },
            { label: 'Süre', value: `${result.duration}s` },
          ].map(s => (
            <div key={s.label} className="bg-surface rounded-2xl p-3">
              <p className="text-lg font-black text-textPrimary">{s.value}</p>
              <p className="text-xs text-textSecondary">{s.label}</p>
            </div>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onNext}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white mb-3"
          style={{ backgroundColor: game.color }}
        >
          {isLastGame ? '🏁 Antrenmanı Bitir' : `Devam Et (${gamesLeft} oyun kaldı)`}
        </motion.button>
      </motion.div>
    </div>
  )
}
