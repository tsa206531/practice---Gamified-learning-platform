// Level calculation utilities based on PRD thresholds
// Levels 1-36 with cumulative XP and XP needed to reach next level

export type LevelInfo = {
  level: number
  currentLevelStartXp: number
  nextLevelStartXp: number | null // null means max level reached
  needForNext: number | null
  progressInLevel: number // 0-1
  remainingToNext: number | null
}

// [level, cumulativeXp, needXp]
const RAW_THRESHOLDS: Array<[number, number, number | null]> = [
  [1, 0, 200],
  [2, 200, 300],
  [3, 500, 1000],
  [4, 1500, 1500],
  [5, 3000, 2000],
  [6, 5000, 2000],
  [7, 7000, 2000],
  [8, 9000, 2000],
  [9, 11000, 2000],
  [10, 13000, 2000],
  [11, 15000, 2000],
  [12, 17000, 2000],
  [13, 19000, 2000],
  [14, 21000, 2000],
  [15, 23000, 2000],
  [16, 25000, 2000],
  [17, 27000, 2000],
  [18, 29000, 2000],
  [19, 31000, 2000],
  [20, 33000, 2000],
  [21, 35000, 2000],
  [22, 37000, 2000],
  [23, 39000, 2000],
  [24, 41000, 2000],
  [25, 43000, 2000],
  [26, 45000, 2000],
  [27, 47000, 2000],
  [28, 49000, 2000],
  [29, 51000, 2000],
  [30, 53000, 2000],
  [31, 55000, 2000],
  [32, 57000, 2000],
  [33, 59000, 2000],
  [34, 61000, 2000],
  [35, 63000, 2000],
  [36, 65000, null],
]

const LEVELS = RAW_THRESHOLDS.map(([level, cumulative, need], idx) => ({
  level,
  cumulative,
  nextCumulative: RAW_THRESHOLDS[idx + 1]?.[1] ?? null,
  need: need ?? null,
}))

export function getLevelInfo(totalXp: number): LevelInfo {
  const xp = Math.max(0, Math.floor(Number(totalXp) || 0))
  // Find highest level whose cumulative <= xp
  let curr = LEVELS[0]
  for (const lv of LEVELS) {
    if (xp >= lv.cumulative) curr = lv
    else break
  }
  const nextStart = curr.nextCumulative
  if (nextStart == null) {
    return {
      level: curr.level,
      currentLevelStartXp: curr.cumulative,
      nextLevelStartXp: null,
      needForNext: null,
      progressInLevel: 1,
      remainingToNext: null,
    }
  }
  const span = Math.max(1, nextStart - curr.cumulative)
  const gained = Math.max(0, xp - curr.cumulative)
  const progressInLevel = Math.min(1, gained / span)
  const remainingToNext = Math.max(0, nextStart - xp)
  return {
    level: curr.level,
    currentLevelStartXp: curr.cumulative,
    nextLevelStartXp: nextStart,
    needForNext: span,
    progressInLevel,
    remainingToNext,
  }
}

export function formatXp(xp: number) {
  return Number(xp || 0).toLocaleString()
}

// Helper to read combined XP from backend user exp + session XP
export function readCombinedXp(backendExp?: number | null) {
  let session = 0
  try {
    if (typeof window !== 'undefined') {
      session = Number(sessionStorage.getItem('lp:xp_total') || 0)
    }
  } catch {}
  return (Number(backendExp || 0) + session)
}

export function listenXpUpdates(callback: (total: number) => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.storageArea === sessionStorage && e.key === 'lp:xp_total') {
      callback(Number(e.newValue || 0))
    }
  }
  const onCustom = (e: Event) => {
    const total = (e as CustomEvent)?.detail?.total
    if (typeof total === 'number') callback(total)
  }
  window.addEventListener('storage', onStorage)
  window.addEventListener('xp-update', onCustom as EventListener)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('xp-update', onCustom as EventListener)
  }
}
