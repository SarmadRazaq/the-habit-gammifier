import { useState, useCallback } from 'react'
import { useAuth }       from './hooks/useAuth'
import { useHabitStore } from './hooks/useHabitStore'
import { useToast }      from './hooks/useToast'
import { useTheme }      from './hooks/useTheme'
import {
  calcTotalPoints, calcTodayPoints,
  overallStreak, multiplier,
  getDone, isAllDone, DEFAULT_HABITS,
} from './utils/logic'
import { today } from './utils/dates'

import AuthScreen    from './components/AuthScreen'
import Header        from './components/Header'
import TabNav        from './components/TabNav'
import StatsRow      from './components/StatsRow'
import LevelCard     from './components/LevelCard'
import CompleteBanner from './components/CompleteBanner'
import WeeklyOverview from './components/WeeklyOverview'
import HabitList     from './components/HabitList'
import WaterTracker  from './components/WaterTracker'
import ExerciseGuide from './components/ExerciseGuide'
import TodoList     from './components/TodoList'
import Heatmap       from './components/Heatmap'
import StatsPanel    from './components/StatsPanel'
import DataControls  from './components/DataControls'
import Toast         from './components/Toast'

import styles from './App.module.css'

// ── Loading spinner ────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text3)', fontSize: '.85rem' }}>Loading…</div>
    </div>
  )
}

// ── Main app ───────────────────────────────────────────────────────────────

function MainApp({ userId, onSignOut, theme, onToggleTheme }) {
  const store              = useHabitStore(userId)
  const { toast, showToast, dismissToast } = useToast()
  const [tab, setTab]      = useState('today')

  const { habits, records, waterLog, loading } = store
  const td       = today()
  const totalPts = calcTotalPoints(habits, records)
  const todayPts = calcTodayPoints(habits, records)
  const streak   = overallStreak(habits, records)
  const mult     = multiplier(streak)
  const done     = getDone(records, td)
  const allDone  = isAllDone(habits, records, td)
  const glasses  = waterLog[td] ?? 0

  const handleToggle = useCallback((hid) => {
    const wasDone = done.includes(hid)
    store.toggleHabit(hid)
    if (!wasDone) {
      const wouldComplete = habits.every(h => h.id === hid || done.includes(h.id))
      showToast(
        wouldComplete ? '🎉 All done! +50 bonus points!' : '✓ +10 points',
        () => store.undoToggle(hid),
      )
    } else {
      showToast('Habit unchecked', () => store.undoToggle(hid))
    }
  }, [done, habits, store, showToast])

  const handleDelete = useCallback((hid) => {
    const habit = habits.find(h => h.id === hid)
    if (!habit) return
    if (!window.confirm(`Remove "${habit.name}"?\n\nYour check history will be removed too.`)) return
    store.deleteHabit(hid)
    showToast('Habit removed')
  }, [habits, store, showToast])

  const handleUpdate = useCallback((hid, fields) => {
    store.updateHabit(hid, fields)
    showToast('Habit updated')
  }, [store, showToast])

  const handleAdd = useCallback((fields) => {
    store.addHabit(fields)
    showToast('Habit added!')
  }, [store, showToast])

  const handleReorder = useCallback((oldIdx, newIdx) => {
    store.reorderHabits(oldIdx, newIdx)
  }, [store])

  const handleWater = useCallback((n) => {
    store.setWater(n)
  }, [store])

  const handleImport = useCallback((data) => {
    store.importData(data)
  }, [store])

  const handleReset = useCallback(() => {
    store.importData({ habits: DEFAULT_HABITS, records: {}, waterLog: {} })
  }, [store])

  if (loading) return <Spinner />

  return (
    <div className={styles.app}>
      <Header theme={theme} onToggleTheme={onToggleTheme} onSignOut={onSignOut} />
      <TabNav active={tab} onChange={setTab} />

      {tab === 'today' && (
        <>
          <StatsRow
            totalPts={totalPts} streak={streak}
            todayPts={todayPts} habitCount={habits.length}
            doneCount={done.length} mult={mult}
          />
          <LevelCard totalPts={totalPts} />
          <CompleteBanner visible={allDone} />
          <WeeklyOverview habits={habits} records={records} />
          <WaterTracker glasses={glasses} onSet={handleWater} />
          <HabitList
            habits={habits} records={records}
            onToggle={handleToggle} onAdd={handleAdd}
            onUpdate={handleUpdate} onDelete={handleDelete}
            onReorder={handleReorder}
          />
        </>
      )}

      {tab === 'tasks'   && <TodoList userId={userId} />}
      {tab === 'workout' && <ExerciseGuide />}

      {tab === 'insights' && (
        <>
          <Heatmap    habits={habits} records={records} />
          <StatsPanel habits={habits} records={records} />
          <DataControls
            data={{ habits, records, waterLog }}
            onImport={handleImport}
            onReset={handleReset}
            showToast={showToast}
          />
        </>
      )}

      <Toast
        msg={toast.msg} visible={toast.visible}
        onUndo={toast.onUndo} onDismiss={dismissToast}
      />
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────

export default function App() {
  const { session, signIn, signUp, signOut } = useAuth()
  const { theme, toggle } = useTheme()

  if (session === undefined) return <Spinner />
  if (!session) return <AuthScreen onSignIn={signIn} onSignUp={signUp} />

  return <MainApp userId={session.user.id} onSignOut={signOut} theme={theme} onToggleTheme={toggle} />
}
