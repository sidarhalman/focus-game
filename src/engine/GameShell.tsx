import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GameDefinition, GameResult } from './types'
import { useGameStore } from '../store/gameStore'

interface GameShellProps {
  game: GameDefinition
  onFinish: (result: GameResult) => void
  onExit: () => void
}

export function GameShell({ game, onFinish, onExit }: GameShellProps) {
  const [phase, setPhase] = useState<'tutorial' | 'playing'>('tutorial')
  const { addResult, getDifficultyForGame, updateStreak } = useGameStore()
  const difficulty = getDifficultyForGame(game.id)

  const handleComplete = useCallback(
    (partial: Omit<GameResult, 'gameId' | 'timestamp'>) => {
      const result: GameResult = {
        ...partial,
        gameId: game.id,
        timestamp: Date.now(),
      }
      addResult(result)
      updateStreak()
      onFinish(result)
    },
    [game.id, addResult, updateStreak, onFinish]
  )

  const GameComponent = game.component

  return (
    <div className="fixed inset-0 bg-bg flex flex-col" style={{ maxWidth: '393px', margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button
          onClick={onExit}
          className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-textSecondary active:scale-95 transition-transform"
          aria-label="Exit game"
        >
          ✕
        </button>
        <div className="text-center">
          <div className="text-sm font-semibold text-textPrimary">{game.name}</div>
          <div className="text-xs text-textSecondary">{game.subtitle}</div>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
          style={{ backgroundColor: game.color + '33' }}
        >
          {game.emoji}
        </div>
      </div>

      {/* Game area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {phase === 'tutorial' ? (
            <motion.div
              key="tutorial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col items-center justify-center px-6 gap-8"
            >
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
                style={{ backgroundColor: game.color + '33' }}
              >
                {game.emoji}
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-textPrimary mb-2">{game.name}</h2>
                <p className="text-textSecondary text-base">{game.subtitle}</p>
              </div>
              <button
                onClick={() => setPhase('playing')}
                className="w-full py-4 rounded-2xl font-bold text-lg text-white active:scale-95 transition-transform"
                style={{ backgroundColor: game.color }}
              >
                Başla
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full"
            >
              <GameComponent
                difficulty={difficulty}
                onComplete={handleComplete}
                onExit={onExit}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
