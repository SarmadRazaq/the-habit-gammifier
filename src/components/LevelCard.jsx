import { getLevel, LEVELS } from '../utils/logic'
import styles from './LevelCard.module.css'

export default function LevelCard({ totalPts }) {
  const lvl = getLevel(totalPts)
  const isMax = lvl.max === null

  const curPts  = totalPts - lvl.min
  const maxPts  = isMax ? null : lvl.max - lvl.min
  const pct     = isMax ? 100 : Math.min(100, (curPts / maxPts) * 100)

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.badge}>
          <div className={styles.num}>{lvl.n}</div>
          <div>
            <div className={styles.title}>{lvl.name}</div>
            <div className={styles.sub}>Current Level</div>
          </div>
        </div>
        <div className={styles.ptslabel}>
          {isMax
            ? <><strong>{totalPts.toLocaleString()}</strong> pts — MAX</>
            : <><strong>{curPts.toLocaleString()}</strong> / {maxPts.toLocaleString()} pts to next</>
          }
        </div>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      <div className={styles.levelDots}>
        {LEVELS.map(l => (
          <div key={l.n} className={`${styles.dot} ${totalPts >= l.min ? styles.reached : ''}`}>
            {l.n}
          </div>
        ))}
      </div>
    </div>
  )
}
