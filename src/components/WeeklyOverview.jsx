import { today, shiftDate, dow } from '../utils/dates'
import { getDone } from '../utils/logic'
import styles from './WeeklyOverview.module.css'

export default function WeeklyOverview({ habits, records }) {
  const td = today()

  const days = Array.from({ length: 7 }, (_, i) => {
    const date    = shiftDate(td, -(6 - i))
    const ids     = getDone(records, date)
    const total   = habits.length
    const cnt     = total ? habits.filter(h => ids.includes(h.id)).length : 0
    const isFull  = total > 0 && cnt === total
    const isPart  = cnt > 0 && !isFull
    const isToday = date === td
    const pct     = total ? Math.round((cnt / total) * 100) : 0
    return { date, label: dow(date), isFull, isPart, isToday, pct, cnt, total }
  })

  return (
    <div className={styles.card}>
      <div className={styles.sectionHead}>This Week</div>
      <div className={styles.grid}>
        {days.map(({ date, label, isFull, isPart, isToday, pct, cnt, total }) => {
          const ringClass = [
            styles.ring,
            isFull  ? styles.full    : '',
            isPart  ? styles.partial : '',
            isToday ? styles.today   : '',
          ].filter(Boolean).join(' ')

          const inner = isFull ? '✓' : isPart ? `${pct}%` : isToday ? '·' : ''

          return (
            <div key={date} className={styles.col}>
              <div className={styles.dayLabel}>{label}</div>
              <div className={ringClass} title={`${cnt}/${total} on ${date}`}>
                {inner}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
