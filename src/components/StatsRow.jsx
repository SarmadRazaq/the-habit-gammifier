import styles from './StatsRow.module.css'

export default function StatsRow({ totalPts, streak, todayPts, habitCount, doneCount, mult }) {
  return (
    <div className={styles.row}>
      <div className={`${styles.card}`}>
        <div className={styles.label}>Total Points</div>
        <div className={`${styles.value} ${styles.accent}`}>{totalPts.toLocaleString()}</div>
        <div className={styles.sub}>lifetime earned</div>
      </div>

      <div className={styles.card}>
        <div className={styles.label}>Daily Streak</div>
        <div className={`${styles.value} ${styles.gold}`}>{streak}</div>
        <div className={styles.sub}>consecutive days</div>
        {mult > 1 && (
          <div className={styles.multBadge}>{mult}× multiplier active</div>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.label}>Today</div>
        <div className={`${styles.value} ${styles.accent}`}>{todayPts}</div>
        <div className={styles.sub}>{doneCount} / {habitCount} habits</div>
      </div>
    </div>
  )
}
