import { useState, useCallback } from 'react'
import { useHabitStore }   from './hooks/useHabitStore'
import { useToast }        from './hooks/useToast'
import { useTheme }        from './hooks/useTheme'
import {
  calcTotalPoints, calcTodayPoints,
  overallStreak, multiplier,
  getDone, isAllDone, DEFAULT_HABITS,
} from './utils/logic'
import { today } from './utils/dates'

import Header         from './components/Header'
import TabNav         from './components/TabNav'
import StatsRow       from './components/StatsRow'
import LevelCard      from './components/LevelCard'
import CompleteBanner from './components/CompleteBanner'
import WeeklyOverview from './components/WeeklyOverview'
import HabitList      from './components/HabitList'
import Heatmap        from './components/Heatmap'
import StatsPanel     from './components/StatsPanel'
import DataControls   from './components/DataControls'
import Toast          from './components/Toast'

import styles from './App.module.css'

export default function App() {
  const store              = useHabitStore()
  const { toast, showToast, dismissToast } = useToast()
  const { theme, toggle }  = useTheme()
  const [tab, setTab]      = useState('today')

  const { habits, records } = store
  const td       = today()
  const totalPts = calcTotalPoints(habits, records)
  const todayPts = calcTodayPoints(habits, records)
  const streak   = overallStreak(habits, records)
  const mult     = multiplier(streak)
  const done     = getDone(records, td)
  const allDone  = isAllDone(habits, records, td)

  const handleToggle = useCallback((hid) => {
    // Capture pre-toggle records for undo
    const snapshot = records
    const wasDone  = done.includes(hid)
    store.toggleHabit(hid)

    if (!wasDone) {
      const wouldComplete = habits.every(h => h.id === hid || done.includes(h.id))
      showToast(
        wouldComplete ? '🎉 All done! +50 bonus points!' : '✓ +10 points',
        () => store.restoreRecords(snapshot),
      )
    } else {
      showToast('Habit unchecked', () => store.restoreRecords(snapshot))
    }
  }, [done, habits, records, store, showToast])

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

  const handleImport = useCallback((data) => {
    store.importData(data)
  }, [store])

  const handleReset = useCallback(() => {
    store.importData({ habits: DEFAULT_HABITS, records: {} })
  }, [store])

  return (
    <div className={styles.app}>
      <Header theme={theme} onToggleTheme={toggle} />
      <TabNav active={tab} onChange={setTab} />

      {tab === 'today' && (
        <>
          <StatsRow
            totalPts={totalPts}
            streak={streak}
            todayPts={todayPts}
            habitCount={habits.length}
            doneCount={done.length}
            mult={mult}
          />
          <LevelCard totalPts={totalPts} />
          <CompleteBanner visible={allDone} />
          <WeeklyOverview habits={habits} records={records} />
          <HabitList
            habits={habits}
            records={records}
            onToggle={handleToggle}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onReorder={handleReorder}
          />
        </>
      )}

      {tab === 'insights' && (
        <>
          <Heatmap   habits={habits} records={records} />
          <StatsPanel habits={habits} records={records} />
          <DataControls
            data={{ habits, records }}
            onImport={handleImport}
            onReset={handleReset}
            showToast={showToast}
          />
        </>
      )}

      <Toast
        msg={toast.msg}
        visible={toast.visible}
        onUndo={toast.onUndo}
        onDismiss={dismissToast}
      />
    </div>
  )
}
