import { useState } from 'react'
import { CARDIO, PPL, WEEKLY_SCHEDULE, TYPE_COLORS } from '../data/exercises'
import MuscleDiagram from './MuscleDiagram'
import styles from './ExerciseGuide.module.css'

// ── Icons ─────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg viewBox="0 0 11 11" fill="none" stroke="white" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1,6 4.5,9.5 10,1.5" />
    </svg>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }}>
      <polyline points="2,5 7,10 12,5" />
    </svg>
  )
}

// ── Exercise Row ──────────────────────────────────────

function ExerciseRow({ ex, checked, onToggle, accentColor }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`${styles.exRow} ${checked ? styles.exDone : ''}`}>
      <div className={styles.exMain}>
        <button
          className={`${styles.exCheck} ${checked ? styles.exChecked : ''}`}
          style={checked ? { background: accentColor, borderColor: accentColor } : {}}
          onClick={() => onToggle(ex.id)}
          aria-label={checked ? 'Uncheck' : 'Check'}
        >
          {checked && <CheckIcon />}
        </button>

        <div className={styles.exInfo} onClick={() => setExpanded(v => !v)}>
          <div className={styles.exName}>{ex.name}</div>
          <div className={styles.exMeta}>
            <span className={styles.exSets}>{ex.sets}×{ex.reps}</span>
            <span className={styles.exMuscle}>{ex.muscle}</span>
          </div>
        </div>

        <button className={styles.exExpand} onClick={() => setExpanded(v => !v)} aria-label="Show tip">
          <ChevronIcon open={expanded} />
        </button>
      </div>

      {expanded && (
        <div className={styles.exTip}>
          <MuscleDiagram muscle={ex.muscle} color={accentColor}/>
          <p className={styles.exTipText}>{ex.tip}</p>
        </div>
      )}
    </div>
  )
}

// ── Cardio Section ────────────────────────────────────

function CardioSection({ isRestDay }) {
  const [cardioChecked, setCardioChecked] = useState(false)
  const [expanded, setExpanded]           = useState(false)

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} style={{ borderColor: 'rgba(56,189,248,.25)' }}>
        <div className={styles.sectionBadge} style={{ background: 'rgba(56,189,248,.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,.25)' }}>
          {isRestDay ? 'Active Recovery' : 'Morning Cardio'}
        </div>
        <div className={styles.sectionTime}>{isRestDay ? 'Any time' : CARDIO.time}</div>
      </div>

      <div className={styles.cardioBlock}>
        <div className={styles.cardioHeader}>
          <div>
            <div className={styles.cardioTitle}>{isRestDay ? 'Brisk Walk / Mobility' : CARDIO.duration}</div>
            <div className={styles.cardioZone}>{isRestDay ? '15–20 min walk + 10 min stretching' : CARDIO.zone}</div>
          </div>
          <button
            className={`${styles.cardioDone} ${cardioChecked ? styles.cardioDoneActive : ''}`}
            onClick={() => setCardioChecked(v => !v)}
          >
            {cardioChecked ? '✓ Done' : 'Mark done'}
          </button>
        </div>

        {!isRestDay && (
          <>
            <div className={styles.cardioWhy}>{CARDIO.why}</div>
            <button className={styles.optionsToggle} onClick={() => setExpanded(v => !v)}>
              Cardio options <ChevronIcon open={expanded} />
            </button>
            {expanded && (
              <div className={styles.cardioOptions}>
                {CARDIO.options.filter(o => o.name !== 'Brisk Walk').map(opt => (
                  <div key={opt.name} className={styles.cardioOption}>
                    <span className={styles.optIcon}>{opt.icon}</span>
                    <div>
                      <div className={styles.optName}>{opt.name}</div>
                      <div className={styles.optTip}>{opt.tip}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Weights Section ───────────────────────────────────

function WeightsSection({ session, colors }) {
  const [checked, setChecked] = useState({})

  function toggle(id) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const doneCount = session.exercises.filter(e => checked[e.id]).length
  const total     = session.exercises.length

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} style={{ borderColor: colors.border }}>
        <div className={styles.sectionBadge}
          style={{ background: colors.dim, color: colors.accent, border: `1px solid ${colors.border}` }}>
          Evening Weights
        </div>
        <div className={styles.sectionProgress} style={{ color: colors.accent }}>
          {doneCount}/{total} done
        </div>
      </div>

      <div className={styles.sessionInfo}>
        <span className={styles.sessionSub}>{session.subtitle}</span>
        <span className={styles.sessionTip}>{session.tip}</span>
      </div>

      <div className={styles.exList}>
        {session.exercises.map(ex => (
          <ExerciseRow
            key={ex.id}
            ex={ex}
            checked={!!checked[ex.id]}
            onToggle={toggle}
            accentColor={colors.accent}
          />
        ))}
      </div>

      {doneCount === total && (
        <div className={styles.allDoneBadge} style={{ color: colors.accent }}>
          🎯 Session complete!
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function ExerciseGuide() {
  const dayOfWeek = new Date().getDay()
  const schedule  = WEEKLY_SCHEDULE[dayOfWeek]
  const colors    = TYPE_COLORS[schedule.type]
  const isRest    = schedule.type === 'Rest'

  const session = !isRest ? PPL[schedule.type][schedule.variant] : null

  return (
    <div className={styles.wrap}>
      {/* Today's workout header */}
      <div className={styles.todayCard} style={{ borderColor: colors.border, background: colors.dim }}>
        <div className={styles.todayLeft}>
          <div className={styles.todayLabel}>Today — {DAY_NAMES[dayOfWeek]}</div>
          <div className={styles.todayType} style={{ color: colors.accent }}>
            {isRest ? 'Rest Day' : `${schedule.type} ${schedule.variant} · ${session?.subtitle}`}
          </div>
        </div>
        <div className={styles.todayTag} style={{ background: colors.dim, color: colors.accent, borderColor: colors.border }}>
          {isRest ? '😴' : schedule.type === 'Push' ? '🔺' : schedule.type === 'Pull' ? '🔻' : '🦵'}
          {isRest ? 'Rest' : schedule.type}
        </div>
      </div>

      {/* Weekly schedule strip */}
      <div className={styles.weekStrip}>
        {[1,2,3,4,5,6,0].map(d => {
          const s = WEEKLY_SCHEDULE[d]
          const c = TYPE_COLORS[s.type]
          const isToday = d === dayOfWeek
          return (
            <div
              key={d}
              className={`${styles.stripDay} ${isToday ? styles.stripToday : ''}`}
              style={isToday ? { borderColor: c.accent, background: c.dim } : {}}
            >
              <div className={styles.stripLabel}>{DAY_NAMES[d].slice(0, 3)}</div>
              <div className={styles.stripType} style={{ color: c.accent }}>
                {s.type === 'Rest' ? '—' : `${s.type[0]}${s.variant}`}
              </div>
            </div>
          )
        })}
      </div>

      {/* PPL split legend */}
      <div className={styles.legend}>
        {['Push', 'Pull', 'Legs'].map(t => (
          <div key={t} className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: TYPE_COLORS[t].accent }} />
            <div>
              <div className={styles.legendType} style={{ color: TYPE_COLORS[t].accent }}>{t}</div>
              <div className={styles.legendMuscles}>
                {t === 'Push' && 'Chest · Shoulders · Triceps'}
                {t === 'Pull' && 'Back · Rear Delts · Biceps'}
                {t === 'Legs' && 'Quads · Hamstrings · Glutes · Calves'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Workout sections */}
      <CardioSection isRestDay={isRest} />
      {!isRest && session && <WeightsSection session={session} colors={colors} />}

      {isRest && (
        <div className={styles.restNote}>
          <div className={styles.restTitle}>Why rest days matter</div>
          <div className={styles.restBody}>
            Muscle grows during recovery, not during the workout. Today's growth stimulus was delivered — now let it absorb.
            Stay active with a walk, do mobility work, and prioritise sleep and protein intake.
          </div>
        </div>
      )}
    </div>
  )
}
