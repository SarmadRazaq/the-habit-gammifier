import styles from './TabNav.module.css'

const TABS = [
  { id: 'today',   label: 'Today'   },
  { id: 'tasks',   label: 'Tasks'   },
  { id: 'workout', label: 'Workout' },
  { id: 'insights',label: 'Insights'},
]

export default function TabNav({ active, onChange }) {
  return (
    <nav className={styles.nav}>
      {TABS.map(t => (
        <button
          key={t.id}
          className={`${styles.tab} ${active === t.id ? styles.active : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {active === t.id && <span className={styles.indicator} />}
        </button>
      ))}
    </nav>
  )
}
