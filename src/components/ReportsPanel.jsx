import { useState } from 'react'
import { getWeeklyData, getMonthlyData, habitStats, multiplier, streakOnDate, isSunday } from '../utils/logic'
import { shiftDate } from '../utils/dates'
import styles from './ReportsPanel.module.css'

// ── Bar chart (weekly) ────────────────────────────────────────────────────────

function BarChart({ data }) {
  const maxPts = Math.max(...data.map(d => d.pts), 1)

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>Daily Points — Last 7 Days</div>
      <div className={styles.barChart}>
        {data.map(d => {
          const heightPct = d.isSunday ? 0 : Math.max((d.pts / maxPts) * 100, d.pts > 0 ? 4 : 0)
          return (
            <div
              key={d.date}
              className={`${styles.barWrap} ${d.isToday ? styles.barToday : ''} ${d.isSunday ? styles.barSunday : ''}`}
              title={d.isSunday ? 'Rest day' : `${d.pts} pts — ${d.done}/${d.total} habits`}
            >
              <div className={styles.barOuter}>
                <div
                  className={styles.bar}
                  style={{
                    height: `${heightPct}%`,
                    background: d.isToday ? 'var(--accent)' : d.isSunday ? 'var(--s3)' : 'var(--accent)',
                    opacity: d.isToday ? 1 : d.isSunday ? 0.3 : 0.65,
                  }}
                />
              </div>
              <span className={styles.barLabel} style={{ fontWeight: d.isToday ? 700 : 400 }}>
                {d.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Line chart (monthly, SVG) ─────────────────────────────────────────────────

function LineChart({ data }) {
  const W = 560, H = 120, PADX = 8, PADY = 10

  // Filter out nulls (Sundays) for line segments
  const nonNull = data.filter(d => d.pct !== null)
  if (nonNull.length === 0) return null

  const xScale = i => PADX + (i / (data.length - 1)) * (W - PADX * 2)
  const yScale = pct => PADY + (1 - pct / 100) * (H - PADY * 2)

  // Build path segments (skip Sundays)
  const segments = []
  let seg = []
  for (let i = 0; i < data.length; i++) {
    const d = data[i]
    if (d.pct === null) {
      if (seg.length > 1) segments.push(seg)
      seg = []
    } else {
      seg.push({ x: xScale(i), y: yScale(d.pct), ...d })
    }
  }
  if (seg.length > 1) segments.push(seg)

  const dots = nonNull.map((d, i) => {
    const globalIdx = data.findIndex(x => x.date === d.date)
    return { x: xScale(globalIdx), y: yScale(d.pct), ...d }
  })

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>Daily Completion % — Last 30 Days</div>
      <div className={styles.lineChartWrap}>
        <svg
          className={styles.lineChart}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          style={{ height: 130 }}
        >
          {/* Gridlines */}
          {[0, 50, 100].map(pct => (
            <line
              key={pct}
              x1={PADX} y1={yScale(pct)}
              x2={W - PADX} y2={yScale(pct)}
              stroke="var(--s3)" strokeWidth="1" strokeDasharray="3,3"
            />
          ))}
          {/* Y labels */}
          {[0, 50, 100].map(pct => (
            <text key={pct} x={PADX} y={yScale(pct) - 3} fontSize="7" fill="var(--text3)">{pct}%</text>
          ))}

          {/* Line segments */}
          {segments.map((seg, si) => (
            <polyline
              key={si}
              points={seg.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          ))}

          {/* Area fill per segment */}
          {segments.map((seg, si) => {
            const pts = [
              ...seg.map(p => `${p.x},${p.y}`),
              `${seg[seg.length-1].x},${H-PADY}`,
              `${seg[0].x},${H-PADY}`,
            ].join(' ')
            return (
              <polygon
                key={'fill'+si}
                points={pts}
                fill="var(--accent)"
                fillOpacity="0.12"
              />
            )
          })}

          {/* Dots for today */}
          {dots.filter(d => d.isToday).map(d => (
            <circle key={d.date} cx={d.x} cy={d.y} r="4" fill="var(--accent)" />
          ))}
        </svg>
      </div>
    </div>
  )
}

// ── Per-habit completion bar ───────────────────────────────────────────────────

function HabitBreakdown({ habits, records, period }) {
  if (!habits.length) return null

  const today = new Date().toISOString().slice(0, 10)
  const days  = period === 'week' ? 7 : 30
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (days - 1) + i)
    return d.toISOString().slice(0, 10)
  }).filter(d => !isSunday(d))

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>Habit Completion ({period === 'week' ? '7' : '30'} days)</div>
      {habits.map(h => {
        const done = dates.filter(d => (records[d] ?? []).includes(h.id)).length
        const pct  = dates.length ? Math.round((done / dates.length) * 100) : 0
        return (
          <div key={h.id} className={styles.habitRow}>
            <span className={styles.habitName}>{h.name}</span>
            <div className={styles.habitBar}>
              <div className={styles.habitBarFill} style={{ width: `${pct}%` }} />
            </div>
            <span className={styles.habitPct}>{pct}%</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Summary stats ─────────────────────────────────────────────────────────────

function SummaryStats({ habits, records, period }) {
  const today  = new Date().toISOString().slice(0, 10)
  const days   = period === 'week' ? 7 : 30
  const dates  = Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (days - 1) + i)
    return d.toISOString().slice(0, 10)
  }).filter(d => !isSunday(d))

  const totalPts = dates.reduce((acc, d) => {
    const ids   = records[d] ?? []
    const base  = ids.length * 10
    const bonus = habits.length && habits.every(h => ids.includes(h.id)) ? 50 : 0
    const mult  = multiplier(streakOnDate(habits, records, d))
    return acc + Math.round((base + bonus) * mult)
  }, 0)

  const perfectDays = dates.filter(d => {
    const ids = records[d] ?? []
    return habits.length > 0 && habits.every(h => ids.includes(h.id))
  }).length

  const avgCompletion = dates.length
    ? Math.round(dates.reduce((acc, d) => {
        const cnt = (records[d] ?? []).filter(id => habits.find(h => h.id === id)).length
        return acc + (habits.length ? cnt / habits.length : 0)
      }, 0) / dates.length * 100)
    : 0

  const activeDays = dates.filter(d => (records[d] ?? []).length > 0).length

  return (
    <div className={styles.statGrid}>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Total Points</span>
        <span className={styles.statValue}>{totalPts.toLocaleString()}</span>
        <span className={styles.statSub}>last {days} days (excl. Sundays)</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Perfect Days</span>
        <span className={styles.statValue}>{perfectDays}</span>
        <span className={styles.statSub}>all habits completed</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Avg Completion</span>
        <span className={styles.statValue}>{avgCompletion}%</span>
        <span className={styles.statSub}>per active day</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Active Days</span>
        <span className={styles.statValue}>{activeDays}</span>
        <span className={styles.statSub}>tracked at least 1 habit</span>
      </div>
    </div>
  )
}

// ── ReportsPanel root ─────────────────────────────────────────────────────────

export default function ReportsPanel({ habits, records }) {
  const [period, setPeriod] = useState('week')

  const weeklyData  = getWeeklyData(habits, records)
  const monthlyData = getMonthlyData(habits, records)

  return (
    <div className={styles.panel}>
      <div className={styles.periodRow}>
        {['week', 'month'].map(p => (
          <button
            key={p}
            className={`${styles.periodBtn} ${period === p ? styles.periodBtnActive : ''}`}
            onClick={() => setPeriod(p)}
          >
            {p === 'week' ? 'Weekly' : 'Monthly'}
          </button>
        ))}
      </div>

      <SummaryStats habits={habits} records={records} period={period} />

      {period === 'week'  && <BarChart  data={weeklyData} />}
      {period === 'month' && <LineChart data={monthlyData} />}

      <HabitBreakdown habits={habits} records={records} period={period} />
    </div>
  )
}
