import styles from './CompleteBanner.module.css'

export default function CompleteBanner({ visible }) {
  if (!visible) return null
  return (
    <div className={styles.banner}>
      <div className={styles.icon}>🎉</div>
      <div>
        <div className={styles.title}>All habits complete!</div>
        <div className={styles.sub}>+50 bonus points earned for today</div>
      </div>
    </div>
  )
}
