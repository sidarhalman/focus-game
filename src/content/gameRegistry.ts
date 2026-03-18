import type { GameDefinition } from '../engine/types'
import { PatternRecallGame } from '../games/pattern-recall/game'
import { SequenceTapGame } from '../games/sequence-tap/game'
import { OddOneOutGame } from '../games/odd-one-out/game'
import { ColorSwitchGame } from '../games/color-switch/game'
import { QuickCompareGame } from '../games/quick-compare/game'
import { NumberTrailGame } from '../games/number-trail/game'
import { WordSortGame } from '../games/word-sort/game'
import { PrecisionTapGame } from '../games/precision-tap/game'

export const GAMES: GameDefinition[] = [
  {
    id: 'pattern-recall',
    name: 'Desen Hafızası',
    subtitle: 'Işıldayan kareleri ezberle',
    primarySkill: 'memory',
    secondarySkills: ['attention'],
    emoji: '🟣',
    color: '#6C63FF',
    sessionDuration: 60,
    difficultyProfiles: [],
    component: PatternRecallGame,
  },
  {
    id: 'sequence-tap',
    name: 'Sıra Takibi',
    subtitle: 'Renklerin sırasını tekrarla',
    primarySkill: 'memory',
    secondarySkills: ['attention', 'speed'],
    emoji: '🎯',
    color: '#3B82F6',
    sessionDuration: 60,
    difficultyProfiles: [],
    component: SequenceTapGame,
  },
  {
    id: 'odd-one-out',
    name: 'Garip Tekil',
    subtitle: 'Farklı olanı hızla bul',
    primarySkill: 'attention',
    secondarySkills: ['speed'],
    emoji: '🔍',
    color: '#F59E0B',
    sessionDuration: 60,
    difficultyProfiles: [],
    component: OddOneOutGame,
  },
  {
    id: 'color-switch',
    name: 'Renk Kuralı',
    subtitle: 'Kural değişiyor, sen adapte ol',
    primarySkill: 'flexibility',
    secondarySkills: ['attention', 'speed'],
    emoji: '🎨',
    color: '#EC4899',
    sessionDuration: 60,
    difficultyProfiles: [],
    component: ColorSwitchGame,
  },
  {
    id: 'quick-compare',
    name: 'Hızlı Karşılaştır',
    subtitle: 'Hangisi daha büyük?',
    primarySkill: 'math',
    secondarySkills: ['speed'],
    emoji: '⚖️',
    color: '#F59E0B',
    sessionDuration: 60,
    difficultyProfiles: [],
    component: QuickCompareGame,
  },
  {
    id: 'number-trail',
    name: 'Sayı İzi',
    subtitle: 'Sırayla tüm sayılara dokun',
    primarySkill: 'speed',
    secondarySkills: ['attention', 'precision'],
    emoji: '🔢',
    color: '#22C55E',
    sessionDuration: 60,
    difficultyProfiles: [],
    component: NumberTrailGame,
  },
  {
    id: 'word-sort',
    name: 'Kelime Sınıfı',
    subtitle: 'Kelimeleri kategorilere ayır',
    primarySkill: 'language',
    secondarySkills: ['memory', 'speed'],
    emoji: '📚',
    color: '#3B82F6',
    sessionDuration: 60,
    difficultyProfiles: [],
    component: WordSortGame,
  },
  {
    id: 'precision-tap',
    name: 'Hassas Dokunuş',
    subtitle: 'Hedeflere zamanında dokun',
    primarySkill: 'precision',
    secondarySkills: ['attention', 'speed'],
    emoji: '🎯',
    color: '#EF4444',
    sessionDuration: 60,
    difficultyProfiles: [],
    component: PrecisionTapGame,
  },
]

export const GAME_MAP = Object.fromEntries(GAMES.map(g => [g.id, g]))

export const SKILL_LABELS: Record<string, string> = {
  memory: 'Hafıza',
  attention: 'Dikkat',
  speed: 'Hız',
  logic: 'Mantık',
  flexibility: 'Esneklik',
  language: 'Dil',
  math: 'Matematik',
  precision: 'Hassasiyet',
}
