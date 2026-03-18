import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameResult, CognitiveSkill } from '../engine/types'

interface SkillScore {
  skill: CognitiveSkill
  score: number
  trend: number
}

interface UserProgress {
  level: number
  xp: number
  streak: number
  lastPlayedDate: string | null
  totalGamesPlayed: number
  skillScores: Record<CognitiveSkill, number>
  gameHistory: GameResult[]
  personalBests: Record<string, number>
  achievements: string[]
}

interface GameStore {
  progress: UserProgress
  currentDifficulty: Record<string, number>
  addResult: (result: GameResult) => void
  updateStreak: () => void
  getSkillScores: () => SkillScore[]
  getDifficultyForGame: (gameId: string) => number
  resetProgress: () => void
}

const DEFAULT_PROGRESS: UserProgress = {
  level: 1,
  xp: 0,
  streak: 0,
  lastPlayedDate: null,
  totalGamesPlayed: 0,
  skillScores: {
    memory: 0,
    attention: 0,
    speed: 0,
    logic: 0,
    flexibility: 0,
    language: 0,
    math: 0,
    precision: 0,
  },
  gameHistory: [],
  personalBests: {},
  achievements: [],
}

const today = () => new Date().toISOString().split('T')[0]

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      progress: DEFAULT_PROGRESS,
      currentDifficulty: {},

      addResult: (result: GameResult) => {
        set((state) => {
          const prev = state.progress
          const xpGained = Math.floor(result.normalizedScore / 10)
          const newXp = prev.xp + xpGained
          const newLevel = Math.floor(newXp / 100) + 1

          const prevBest = prev.personalBests[result.gameId] ?? 0
          const newBests = result.score > prevBest
            ? { ...prev.personalBests, [result.gameId]: result.score }
            : prev.personalBests

          const history = [result, ...prev.gameHistory].slice(0, 200)

          // Adaptive difficulty
          const currentDiff = state.currentDifficulty[result.gameId] ?? 1
          let newDiff = currentDiff
          if (result.normalizedScore > 750 && currentDiff < 10) newDiff = Math.min(10, currentDiff + 1)
          else if (result.normalizedScore < 300 && currentDiff > 1) newDiff = Math.max(1, currentDiff - 1)

          return {
            progress: {
              ...prev,
              xp: newXp,
              level: newLevel,
              totalGamesPlayed: prev.totalGamesPlayed + 1,
              personalBests: newBests,
              gameHistory: history,
            },
            currentDifficulty: { ...state.currentDifficulty, [result.gameId]: newDiff },
          }
        })
      },

      updateStreak: () => {
        set((state) => {
          const todayStr = today()
          const last = state.progress.lastPlayedDate
          const isYesterday = last === new Date(Date.now() - 86400000).toISOString().split('T')[0]
          const isToday = last === todayStr

          const newStreak = isToday
            ? state.progress.streak
            : isYesterday || last === null
            ? state.progress.streak + 1
            : 1

          return {
            progress: {
              ...state.progress,
              streak: newStreak,
              lastPlayedDate: todayStr,
            },
          }
        })
      },

      getSkillScores: () => {
        const { skillScores } = get().progress
        return (Object.entries(skillScores) as [CognitiveSkill, number][]).map(([skill, score]) => ({
          skill,
          score,
          trend: 0,
        }))
      },

      getDifficultyForGame: (gameId: string) => {
        return get().currentDifficulty[gameId] ?? 1
      },

      resetProgress: () => {
        set({ progress: DEFAULT_PROGRESS, currentDifficulty: {} })
      },
    }),
    { name: 'focus-game-progress' }
  )
)
