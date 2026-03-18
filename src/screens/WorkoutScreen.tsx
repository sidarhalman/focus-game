import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GAMES } from '../content/gameRegistry'
import { GameShell } from '../engine/GameShell'
import type { GameDefinition, GameResult } from '../engine/types'
import { ResultScreen } from './ResultScreen'

const WORKOUT_GAME_COUNT = 5

function pickWorkoutGames(): GameDefinition[] {
  const shuffled = [...GAMES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(WORKOUT_GAME_COUNT, shuffled.length))
}

interface WorkoutScreenProps {
  onFinish: () => void
}

export function WorkoutScreen({ onFinish }: WorkoutScreenProps) {
  const [games] = useState<GameDefinition[]>(pickWorkoutGames)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<GameResult[]>([])
  const [showResult, setShowResult] = useState<GameResult | null>(null)
  const [workoutDone, setWorkoutDone] = useState(false)

  const currentGame = games[currentIndex]

  const handleGameFinish = useCallback((result: GameResult) => {
    const newResults = [...results, result]
    setResults(newResults)
    setShowResult(result)
  }, [results])

  const handleNextGame = useCallback(() => {
    setShowResult(null)
    if (currentIndex + 1 >= games.length) {
      setWorkoutDone(true)
    } else {
      setCurrentIndex(i => i + 1)
    }
  }, [currentIndex, games.length])

  if (workoutDone) {
    const totalScore = results.reduce((s, r) => s + r.score, 0)
    const avgScore = results.length > 0 ? Math.round(totalScore / results.length) : 0
    return (
      <div className="fixed inset-0 bg-bg flex flex-col items-center justify-center px-6" style={{ maxWidth: '393px', margin: '0 auto' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-center w-full">
          <div className="text-7xl mb-6">🏆</div>
          <h2 className="text-3xl font-black text-textPrimary mb-2">Antrenman Bitti!</h2>
          <p className="text-textSecondary mb-8">Harika iş çıkardın</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-surface rounded-2xl p-4">
              <p className="text-3xl font-black text-primary">{totalScore}</p>
              <p className="text-xs text-textSecondary">Toplam Puan</p>
            </div>
            <div className="bg-surface rounded-2xl p-4">
              <p className="text-3xl font-black text-success">{avgScore}</p>
              <p className="text-xs text-textSecondary">Ortalama</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-8">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between bg-surface rounded-xl px-4 py-3">
                <span className="text-sm text-textSecondary">{games[i]?.name ?? 'Oyun'}</span>
                <span className="text-sm font-bold text-textPrimary">{r.score}</span>
              </div>
            ))}
          </div>

          <button onClick={onFinish}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg active:opacity-80">
            Ana Sayfaya Dön
          </button>
        </motion.div>
      </div>
    )
  }

  if (showResult) {
    return (
      <ResultScreen
        result={showResult}
        game={games[currentIndex]}
        onNext={handleNextGame}
        isLastGame={currentIndex + 1 >= games.length}
        gamesLeft={games.length - currentIndex - 1}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-bg" style={{ maxWidth: '393px', margin: '0 auto' }}>
      {/* Progress dots */}
      <div className="absolute top-4 left-0 right-0 flex justify-center gap-2 z-10 pt-safe-top" style={{ paddingTop: '44px' }}>
        {games.map((_, i) => (
          <div key={i} className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === currentIndex ? '24px' : '8px',
              backgroundColor: i < currentIndex ? '#22C55E' : i === currentIndex ? '#6C63FF' : '#252540',
            }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentGame.id}
          initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
          className="h-full">
          <GameShell
            game={currentGame}
            onFinish={handleGameFinish}
            onExit={onFinish}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
