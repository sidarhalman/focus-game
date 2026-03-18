import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { GAMES, SKILL_LABELS } from '../content/gameRegistry'
import type { GameDefinition } from '../engine/types'

interface HomeScreenProps {
  onStartWorkout: () => void
  onSelectGame: (game: GameDefinition) => void
}

export function HomeScreen({ onStartWorkout, onSelectGame }: HomeScreenProps) {
  const { progress } = useGameStore()
  const { streak, level, xp, totalGamesPlayed } = progress
  const xpToNext = 100
  const xpPct = (xp % xpToNext) / xpToNext

  return (
    <div className="flex flex-col min-h-dvh bg-bg pb-24 overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-black text-textPrimary">Focus<span className="text-primary">.</span></h1>
            <p className="text-xs text-textSecondary">Zihnini zirveye taşı</p>
          </div>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-warning/20 px-3 py-1.5 rounded-full">
                <span className="text-base">🔥</span>
                <span className="text-warning font-bold text-sm">{streak}</span>
              </div>
            )}
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
              {level}
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-textDim mb-1">
            <span>Seviye {level}</span>
            <span>{xp % xpToNext}/{xpToNext} XP</span>
          </div>
          <div className="h-1.5 bg-surfaceHigh rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full"
              initial={{ width: 0 }} animate={{ width: `${xpPct * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
          </div>
        </div>
      </div>

      {/* Daily Workout CTA */}
      <div className="px-5 mb-6">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onStartWorkout}
          className="w-full rounded-3xl p-5 text-left relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #4A44CC 100%)' }}
        >
          <div className="relative z-10">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Günlük Antrenman</p>
            <p className="text-white text-xl font-black mb-1">Bugünü kazan 💪</p>
            <p className="text-white/70 text-sm">5 oyun • ~4 dakika</p>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-20">🧠</div>
        </motion.button>
      </div>

      {/* Stats row */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Seri', value: streak, icon: '🔥' },
            { label: 'Oyun', value: totalGamesPlayed, icon: '🎮' },
            { label: 'Seviye', value: level, icon: '⭐' },
          ].map(stat => (
            <div key={stat.label} className="bg-surface rounded-2xl p-3 text-center">
              <p className="text-2xl mb-0.5">{stat.icon}</p>
              <p className="text-xl font-black text-textPrimary">{stat.value}</p>
              <p className="text-xs text-textSecondary">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Games grid */}
      <div className="px-5">
        <h2 className="text-base font-bold text-textPrimary mb-3">Tüm Oyunlar</h2>
        <div className="grid grid-cols-2 gap-3">
          {GAMES.map((game, i) => {
            const best = progress.personalBests[game.id] ?? 0
            return (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectGame(game)}
                className="bg-surface rounded-2xl p-4 text-left active:opacity-80"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2"
                  style={{ backgroundColor: game.color + '33' }}>
                  {game.emoji}
                </div>
                <p className="text-sm font-bold text-textPrimary leading-tight mb-0.5">{game.name}</p>
                <p className="text-xs text-textSecondary leading-tight mb-2">{game.subtitle}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: game.color + '22', color: game.color }}>
                    {SKILL_LABELS[game.primarySkill]}
                  </span>
                  {best > 0 && <span className="text-xs text-textDim">{best}</span>}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
