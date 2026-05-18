import { today, shiftDate } from './dates'

export const LEVELS = [
  { n: 1, name: 'Novice',     min: 0,    max: 500  },
  { n: 2, name: 'Apprentice', min: 500,  max: 1500 },
  { n: 3, name: 'Adept',      min: 1500, max: 3000 },
  { n: 4, name: 'Expert',     min: 3000, max: 5000 },
  { n: 5, name: 'Master',     min: 5000, max: null  },
]

export const DEFAULT_HABITS = [
  { id: 'exercise',   name: 'Exercise',                     description: '', time: '' },
  { id: 'reading',    name: 'Reading',                      description: '', time: '' },
  { id: 'deep_work',  name: 'Deep Work',                    description: '', time: '' },
  { id: 'meditation', name: 'Meditation',                   description: '', time: '' },
  { id: 'journaling', name: 'Journaling',                   description: '', time: '' },
  { id: 'no_social',  name: 'No Social Media Before Noon',  description: '', time: '' },
  { id: 'sleep',      name: '8 Hours Sleep',                description: '', time: '' },
  { id: 'eating',     name: 'Healthy Eating',               description: '', time: '' },
]

// ── Core helpers ──────────────────────────────────────

export function getDone(records, date) {
  return records[date] || []
}

export function isAllDone(habits, records, date) {
  if (!habits.length) return false
  const done = getDone(records, date)
  return habits.every(h => done.includes(h.id))
}

export function overallStreak(habits, records) {
  const td = today()
  let streak = 0
  let cur = isAllDone(habits, records, td) ? td : shiftDate(td, -1)
  for (let i = 0; i < 9999; i++) {
    if (isAllDone(habits, records, cur)) { streak++; cur = shiftDate(cur, -1) }
    else break
  }
  return streak
}

export function habitStreak(records, hid) {
  const td = today()
  const todayDone = getDone(records, td).includes(hid)
  let streak = 0, cur

  if (todayDone) {
    streak = 1; cur = shiftDate(td, -1)
  } else {
    const yest = shiftDate(td, -1)
    if (!getDone(records, yest).includes(hid)) return 0
    streak = 1; cur = shiftDate(yest, -1)
  }

  for (let i = 0; i < 9999; i++) {
    if (getDone(records, cur).includes(hid)) { streak++; cur = shiftDate(cur, -1) }
    else break
  }
  return streak
}

export function streakOnDate(habits, records, date) {
  let streak = 0, cur = date
  for (let i = 0; i < 9999; i++) {
    if (isAllDone(habits, records, cur)) { streak++; cur = shiftDate(cur, -1) }
    else break
  }
  return streak
}

export function multiplier(streak) {
  if (streak >= 30) return 2.0
  if (streak >= 7)  return 1.5
  return 1.0
}

export function calcTotalPoints(habits, records) {
  let total = 0
  for (const [date, ids] of Object.entries(records)) {
    if (!ids?.length) continue
    const base  = ids.length * 10
    const bonus = habits.length && habits.every(h => ids.includes(h.id)) ? 50 : 0
    const mult  = multiplier(streakOnDate(habits, records, date))
    total += Math.round((base + bonus) * mult)
  }
  return total
}

export function calcTodayPoints(habits, records) {
  const td   = today()
  const ids  = getDone(records, td)
  const base  = ids.length * 10
  const bonus = habits.length && habits.every(h => ids.includes(h.id)) ? 50 : 0
  const mult  = multiplier(overallStreak(habits, records))
  return Math.round((base + bonus) * mult)
}

export function getLevel(pts) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (pts >= LEVELS[i].min) return LEVELS[i]
  }
  return LEVELS[0]
}

// ── Stats ─────────────────────────────────────────────

export function totalDaysTracked(records) {
  return Object.values(records).filter(ids => ids?.length > 0).length
}

export function bestOverallStreak(habits, records) {
  if (!habits.length) return 0
  const recordDates = Object.keys(records).sort()
  if (!recordDates.length) return 0

  const minDate = recordDates[0]
  const maxDate = today()
  let best = 0, current = 0, d = minDate

  while (d <= maxDate) {
    if (isAllDone(habits, records, d)) {
      current++
      if (current > best) best = current
    } else {
      current = 0
    }
    d = shiftDate(d, 1)
  }
  return best
}

export function avgDailyCompletion(habits, records) {
  if (!habits.length) return 0
  const activeDates = Object.keys(records).filter(d => records[d]?.length > 0)
  if (!activeDates.length) return 0
  const sum = activeDates.reduce((acc, d) => {
    const cnt = habits.filter(h => records[d].includes(h.id)).length
    return acc + (cnt / habits.length) * 100
  }, 0)
  return Math.round(sum / activeDates.length)
}

// Per-habit: completion rate and best streak across all tracked days
export function habitStats(records, hid) {
  const dates = Object.keys(records).sort()
  if (!dates.length) return { rate: 0, bestStreak: 0 }

  const doneDays  = dates.filter(d => records[d]?.includes(hid)).length
  const rate      = Math.round((doneDays / dates.length) * 100)

  let best = 0, current = 0, prev = null
  for (const date of dates) {
    // Reset streak if there's a gap between days
    if (prev && date !== shiftDate(prev, 1)) current = 0
    if (records[date]?.includes(hid)) {
      current++
      if (current > best) best = current
    } else {
      current = 0
    }
    prev = date
  }

  return { rate, bestStreak: best }
}

// Build heatmap grid: numWeeks columns × 7 rows, Mon → Sun
export function buildHeatmap(habits, records, numWeeks = 16) {
  const td = today()

  // Find Monday of current week
  const [y, m, d] = td.split('-').map(Number)
  const jsDay = new Date(y, m - 1, d).getDay() // 0=Sun
  const daysToMonday = jsDay === 0 ? 6 : jsDay - 1
  const thisMonday = shiftDate(td, -daysToMonday)
  const startDate  = shiftDate(thisMonday, -(numWeeks - 1) * 7)

  const grid = [] // grid[col][row]
  for (let col = 0; col < numWeeks; col++) {
    const week = []
    for (let row = 0; row < 7; row++) {
      const date     = shiftDate(startDate, col * 7 + row)
      const isFuture = date > td
      const ids      = isFuture ? [] : getDone(records, date)
      const total    = habits.length
      const cnt      = total ? habits.filter(h => ids.includes(h.id)).length : 0
      const pct      = total && !isFuture ? (cnt / total) * 100 : 0
      week.push({ date, pct, isFuture, cnt, total })
    }
    grid.push(week)
  }

  return { grid, startDate }
}
