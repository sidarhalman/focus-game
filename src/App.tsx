import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HomeScreen } from './screens/HomeScreen'
import { WorkoutScreen } from './screens/WorkoutScreen'
import { GameShell } from './engine/GameShell'
import type { GameDefinition, GameResult } from './engine/types'
import { ResultScreen } from './screens/ResultScreen'

type View = 'home' | 'workout' | 'game' | 'result'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [activeGame, setActiveGame] = useState<GameDefinition | null>(null)
  const [lastResult, setLastResult] = useState<GameResult | null>(null)

  const handleSelectGame = useCallback((game: GameDefinition) => {
    setActiveGame(game)
    setView('game')
  }, [])

  const handleGameFinish = useCallback((result: GameResult) => {
    setLastResult(result)
    setView('result')
  }, [])

  const handleBackToHome = useCallback(() => {
    setView('home')
    setActiveGame(null)
    setLastResult(null)
  }, [])

  return (
    <div className="min-h-dvh bg-bg flex justify-center">
      <div className="w-full" style={{ maxWidth: '393px', position: 'relative' }}>
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HomeScreen
                onStartWorkout={() => setView('workout')}
                onSelectGame={handleSelectGame}
              />
            </motion.div>
          )}

          {view === 'workout' && (
            <motion.div key="workout"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <WorkoutScreen onFinish={handleBackToHome} />
            </motion.div>
          )}

          {view === 'game' && activeGame && (
            <motion.div key="game"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <GameShell
                game={activeGame}
                onFinish={handleGameFinish}
                onExit={handleBackToHome}
              />
            </motion.div>
          )}

          {view === 'result' && lastResult && activeGame && (
            <motion.div key="result"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
              <ResultScreen
                result={lastResult}
                game={activeGame}
                onNext={handleBackToHome}
                isLastGame
                gamesLeft={0}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
