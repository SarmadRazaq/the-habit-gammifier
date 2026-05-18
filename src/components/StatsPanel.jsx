import {
  totalDaysTracked,
  bestOverallStreak,
  avgDailyCompletion,
  habitStats,
  habitStreak,
  overallStreak,
} from '../utils/logic'
import styles from './StatsPanel.module.css'

function StatBlock({ label, value, sub }) {
  return (
    <div className={styles.statBlock}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  )
}

function RateBar({ pct }) {
  return (
    <div className={styles.rateTrack}>
      <div
        className={styles.rateFill}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function StatsPanel({ habits, records }) {
  const totalDays  = totalDaysTracked(records)
  const bestStreak = bestOverallStreak(habits, records)
  const curStreak  = overallStreak(habits, records)
  const avgPct     = avgDailyCompletion(habits, records)

  return (
    <div className={styles.card}>
      <div className={styles.head}>All-Time Stats</div>

      <div className={styles.summaryRow}>
        <StatBlock label="Days Tracked"   value={totalDays}           />
        <StatBlock label="Best Streak"    value={`${bestStreak}d`}    />
        <StatBlock label="Current Streak" value={`${curStreak}d`}     />
        <StatBlock label="Avg Completion" value={`${avgPct}%`}        />
      </div>

      {habits.length > 0 && (
        <>
          <div className={styles.tableHead}>Per-Habit Breakdown</div>
          <div className={styles.table}>
            <div className={styles.tableHeaderRow}>
              <div className={styles.thHabit}>Habit</div>
              <div className={styles.thStat}>Rate</div>
              <div className={styles.thStat}>Best</div>
              <div className={styles.thStat}>Now</div>
            </div>
            {habits.map(h => {
              const { rate, bestStreak: hBest } = habitStats(records, h.id)
              const cur = habitStreak(records, h.id)
              return (
                <div key={h.id} className={styles.tableRow}>
                  <div className={styles.tdHabit}>{h.name}</div>
                  <div className={styles.tdStat}>
                    <div className={styles.rateLabel}>{rate}%</div>
                    <RateBar pct={rate} />
                  </div>
                  <div className={styles.tdStatNum}>{hBest}d</div>
                  <div className={`${styles.tdStatNum} ${cur > 0 ? styles.active : ''}`}>
                    {cur > 0 ? `🔥${cur}` : '—'}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
