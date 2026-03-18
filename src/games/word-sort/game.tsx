import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TimerBar } from '../../engine/TimerBar'
import { ScoreHUD } from '../../engine/ScoreHUD'
import type { GameComponentProps } from '../../engine/types'

const WORD_SETS: Record<string, string[]> = {
  Hayvanlar: ['köpek', 'kedi', 'aslan', 'fil', 'kartal', 'ördek', 'timsah'],
  Meyveler: ['elma', 'muz', 'portakal', 'kiraz', 'çilek', 'kavun', 'üzüm'],
  'Taşıtlar': ['araba', 'uçak', 'gemi', 'tren', 'bisiklet', 'kamyon', 'helikopter'],
  Renkler: ['kırmızı', 'mavi', 'yeşil', 'sarı', 'mor', 'turuncu', 'pembe'],
  Meslekler: ['doktor', 'öğretmen', 'mühendis', 'aşçı', 'pilot', 'avukat', 'ressam'],
}

const CATEGORIES = Object.keys(WORD_SETS)

function generateRound(wordCount: number) {
  const catA = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
  let catB = catA
  while (catB === catA) catB = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]

  const wordsA = [...WORD_SETS[catA]].sort(() => Math.random() - 0.5).slice(0, Math.ceil(wordCount / 2))
  const wordsB = [...WORD_SETS[catB]].sort(() => Math.random() - 0.5).slice(0, Math.floor(wordCount / 2))

  const allWords = [...wordsA.map(w => ({ word: w, cat: catA })), ...wordsB.map(w => ({ word: w, cat: catB }))]
  allWords.sort(() => Math.random() - 0.5)

  return { catA, catB, words: allWords }
}

export function WordSortGame({ difficulty, onComplete }: GameComponentProps) {
  const wordCount = 4 + Math.floor(difficulty / 2)
  const timeLimit = Math.max(25 - difficulty, 12)
  const totalRounds = 4

  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [catA, setCatA] = useState('')
  const [catB, setCatB] = useState('')
  const [words, setWords] = useState<{ word: string; cat: string }[]>([])
  const [sorted, setSorted] = useState<Record<string, string[]>>({ a: [], b: [] })
  const [timerKey, setTimerKey] = useState(0)
  const [finished, setFinished] = useState(false)
  const [roundDone, setRoundDone] = useState(false)

  const startRound = useCallback(() => {
    const { catA: ca, catB: cb, words: w } = generateRound(wordCount)
    setCatA(ca)
    setCatB(cb)
    setWords(w)
    setSorted({ a: [], b: [] })
    setTimerKey(k => k + 1)
    setRoundDone(false)
  }, [wordCount])

  useEffect(() => { startRound() }, [])

  const handleDrop = (word: string, cat: string, bucket: 'a' | 'b') => {
    const isA = catA === cat
    const correctBucket = isA ? 'a' : 'b'
    const correct = bucket === correctBucket

    setSorted(s => ({ ...s, [bucket]: [...s[bucket], word] }))
    setWords(w => w.filter(item => item.word !== word))

    if (!correct) setScore(sc => Math.max(0, sc - 15))
  }

  const handleWordTap = (wordObj: { word: string; cat: string }) => {
    const isA = catA === wordObj.cat
    const bucket: 'a' | 'b' = isA ? 'a' : 'b'
    handleDrop(wordObj.word, wordObj.cat, bucket)
  }

  useEffect(() => {
    if (words.length === 0 && !roundDone && catA) {
      setRoundDone(true)
      const newCombo = combo + 1
      const pts = 150 + (newCombo - 1) * 50
      setScore(s => s + pts)
      setCombo(newCombo)
      setTimeout(() => {
        if (round >= totalRounds) { setFinished(true) } else { setRound(r => r + 1); startRound() }
      }, 1000)
    }
  }, [words, roundDone, catA])

  const handleExpire = () => {
    if (round >= totalRounds) { setFinished(true) } else { setRound(r => r + 1); startRound() }
  }

  useEffect(() => {
    if (finished) {
      onComplete({ score, normalizedScore: Math.min(1000, score), accuracy: score / (totalRounds * 150), roundsPlayed: totalRounds, duration: totalRounds * timeLimit, difficulty })
    }
  }, [finished])

  return (
    <div className="flex flex-col h-full px-5 pb-8">
      <ScoreHUD score={score} combo={combo} round={round} totalRounds={totalRounds} />
      <div className="px-2 mb-4">
        <TimerBar key={timerKey} duration={timeLimit} onExpire={handleExpire} color="#3B82F6" />
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <p className="text-center text-textSecondary text-xs">Kelimeye dokun → doğru kategoriye gider</p>

        {/* Word pool */}
        <div className="flex flex-wrap gap-2 justify-center min-h-16 p-3 rounded-2xl bg-surfaceHigh">
          <AnimatePresence>
            {words.map(w => (
              <motion.button key={w.word}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleWordTap(w)}
                className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm active:bg-primaryDim">
                {w.word}
              </motion.button>
            ))}
          </AnimatePresence>
          {words.length === 0 && !roundDone && <p className="text-textDim text-sm self-center">Bitti!</p>}
        </div>

        {/* Two category buckets */}
        <div className="flex gap-3 flex-1">
          {(['a', 'b'] as const).map(bucket => (
            <div key={bucket} className="flex-1 rounded-2xl p-3 flex flex-col gap-2 min-h-32"
              style={{ backgroundColor: bucket === 'a' ? '#6C63FF22' : '#22C55E22', border: `2px solid ${bucket === 'a' ? '#6C63FF44' : '#22C55E44'}` }}>
              <p className="text-center text-xs font-bold" style={{ color: bucket === 'a' ? '#6C63FF' : '#22C55E' }}>
                {bucket === 'a' ? catA : catB}
              </p>
              <div className="flex flex-wrap gap-1 justify-center">
                {sorted[bucket].map(w => (
                  <span key={w} className="px-2 py-1 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: bucket === 'a' ? '#6C63FF33' : '#22C55E33', color: bucket === 'a' ? '#9990FF' : '#66E8A0' }}>
                    {w}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
