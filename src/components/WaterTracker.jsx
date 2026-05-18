import styles from './WaterTracker.module.css'

const TARGET = 8 // glasses
const ML_PER_GLASS = 250

function DropIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C12 2 3 13 3 19a9 9 0 0 0 18 0C21 13 12 2 12 2z"
        fill={filled ? 'var(--water)' : 'var(--s3)'}
        stroke={filled ? 'var(--water-border)' : 'var(--s4)'}
        strokeWidth="1"
        style={{ transition: 'fill .25s, stroke .25s' }}
      />
      {filled && (
        <path
          d="M8 19 Q10 16 12 19 Q14 22 16 19"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  )
}

export default function WaterTracker({ glasses, onSet }) {
  const ml    = glasses * ML_PER_GLASS
  const pct   = Math.min(100, (glasses / TARGET) * 100)
  const done  = glasses >= TARGET

  function handleDropClick(idx) {
    // Click filled → set to idx, click unfilled → set to idx+1
    onSet(glasses === idx + 1 ? idx : idx + 1)
  }

  return (
    <div className={`${styles.card} ${done ? styles.done : ''}`}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.sectionHead}>Water Intake</div>
          <div className={styles.amount}>
            <span className={styles.amountNum}>{glasses}</span>
            <span className={styles.amountDen}> / {TARGET} glasses</span>
            <span className={styles.amountMl}>· {ml} ml</span>
          </div>
        </div>
        <div className={styles.controls}>
          <button className={styles.ctrl} onClick={() => onSet(glasses - 1)} disabled={glasses === 0} aria-label="Remove glass">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>
          <button className={styles.ctrl} onClick={() => onSet(glasses + 1)} disabled={glasses >= 12} aria-label="Add glass">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
              <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Drop icons */}
      <div className={styles.drops}>
        {Array.from({ length: TARGET }, (_, i) => (
          <button
            key={i}
            className={styles.drop}
            onClick={() => handleDropClick(i)}
            aria-label={`Set to ${i + 1} glasses`}
          >
            <DropIcon filled={i < glasses} />
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>

      {done && (
        <div className={styles.badge}>💧 Daily goal reached!</div>
      )}
    </div>
  )
}
