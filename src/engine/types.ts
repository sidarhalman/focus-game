export type CognitiveSkill =
  | 'memory'
  | 'attention'
  | 'speed'
  | 'logic'
  | 'flexibility'
  | 'language'
  | 'math'
  | 'precision'

export type GameStatus = 'idle' | 'tutorial' | 'playing' | 'paused' | 'finished'

export interface DifficultyProfile {
  level: number
  label: string
  params: Record<string, number | string | boolean>
}

export interface GameResult {
  gameId: string
  score: number
  normalizedScore: number
  accuracy: number
  roundsPlayed: number
  duration: number
  difficulty: number
  timestamp: number
}

export interface GameDefinition {
  id: string
  name: string
  subtitle: string
  primarySkill: CognitiveSkill
  secondarySkills: CognitiveSkill[]
  emoji: string
  color: string
  sessionDuration: number
  difficultyProfiles: DifficultyProfile[]
  component: React.ComponentType<GameComponentProps>
}

export interface GameComponentProps {
  difficulty: number
  onComplete: (result: Omit<GameResult, 'gameId' | 'timestamp'>) => void
  onExit: () => void
}
