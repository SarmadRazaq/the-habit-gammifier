import { buildHeatmap } from '../utils/logic'
import styles from './Heatmap.module.css'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function cellColor(pct, isFuture) {
  if (isFuture)  return 'var(--s2)'
  if (pct === 0) return 'var(--s3)'
  if (pct < 34)  return 'rgba(34,197,94,.22)'
  if (pct < 67)  return 'rgba(34,197,94,.5)'
  if (pct < 100) return 'rgba(34,197,94,.75)'
  return 'var(--green)'
}

function getMonthLabel(date) {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('en-US', { month: 'short' })
}

export default function Heatmap({ habits, records }) {
  const { grid } = buildHeatmap(habits, records, 16)

  // Build month labels: show label on first column of each new month
  const monthLabels = grid.map((week, col) => {
    const firstDay = week[0].date
    const [, m] = firstDay.split('-').map(Number)
    const prevFirst = col > 0 ? grid[col - 1][0].date : null
    const prevM = prevFirst ? prevFirst.split('-').map(Number)[1] : -1
    return m !== prevM ? { col, label: getMonthLabel(firstDay) } : null
  }).filter(Boolean)

  return (
    <div className={styles.card}>
      <div className={styles.head}>Completion Heatmap</div>
      <div className={styles.wrap}>
        {/* Day labels */}
        <div className={styles.dayLabels}>
          {DAYS.map((d, i) => (
            <div key={d} className={`${styles.dayLabel} ${i % 2 !== 0 ? styles.hidden : ''}`}>{d}</div>
          ))}
        </div>

        <div className={styles.gridWrap}>
          {/* Month labels row */}
          <div className={styles.monthRow}>
            {grid.map((_, col) => {
              const ml = monthLabels.find(m => m.col === col)
              return (
                <div key={col} className={styles.monthCell}>
                  {ml ? ml.label : ''}
                </div>
              )
            })}
          </div>

          {/* Cell grid: columns = weeks, rows = days */}
          <div className={styles.grid}>
            {grid.map((week, col) => (
              <div key={col} className={styles.col}>
                {week.map(({ date, pct, isFuture, cnt, total }) => (
                  <div
                    key={date}
                    className={`${styles.cell} ${pct === 100 && !isFuture ? styles.full : ''}`}
                    style={{ background: cellColor(pct, isFuture) }}
                    title={isFuture ? date : `${date}: ${cnt}/${total} habits`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendLabel}>Less</span>
        {[0, 25, 50, 75, 100].map(p => (
          <div
            key={p}
            className={styles.legendCell}
            style={{ background: cellColor(p, false) }}
          />
        ))}
        <span className={styles.legendLabel}>More</span>
      </div>
    </div>
  )
}
