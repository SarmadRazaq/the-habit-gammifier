import { useState, useCallback } from 'react'
import { DEFAULT_HABITS } from '../utils/logic'
import { today } from '../utils/dates'

const STORAGE_KEY = 'habitflow_v2'

const DEFAULTS = { habits: DEFAULT_HABITS, records: {}, waterLog: {} }

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch (_) {}
  return { ...DEFAULTS }
}

function persist(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch (_) {}
}

export function useHabitStore() {
  const [state, setState] = useState(loadFromStorage)

  const update = useCallback((updater) => {
    setState(prev => {
      const next = updater(prev)
      persist(next)
      return next
    })
  }, [])

  const toggleHabit = useCallback((hid) => {
    const td = today()
    update(prev => {
      const dayIds = prev.records[td] ? [...prev.records[td]] : []
      const idx = dayIds.indexOf(hid)
      if (idx === -1) dayIds.push(hid)
      else dayIds.splice(idx, 1)
      return { ...prev, records: { ...prev.records, [td]: dayIds } }
    })
  }, [update])

  const restoreRecords = useCallback((records) => {
    update(prev => ({ ...prev, records }))
  }, [update])

  const addHabit = useCallback(({ name, description = '', time = '' }) => {
    const id = 'h' + Date.now()
    update(prev => ({ ...prev, habits: [...prev.habits, { id, name, description, time }] }))
  }, [update])

  const updateHabit = useCallback((hid, fields) => {
    update(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === hid ? { ...h, ...fields } : h),
    }))
  }, [update])

  const deleteHabit = useCallback((hid) => {
    update(prev => {
      const habits = prev.habits.filter(h => h.id !== hid)
      const records = {}
      for (const [date, ids] of Object.entries(prev.records)) {
        const filtered = ids.filter(id => id !== hid)
        if (filtered.length) records[date] = filtered
      }
      return { ...prev, habits, records }
    })
  }, [update])

  const reorderHabits = useCallback((oldIdx, newIdx) => {
    update(prev => {
      const habits = [...prev.habits]
      const [moved] = habits.splice(oldIdx, 1)
      habits.splice(newIdx, 0, moved)
      return { ...prev, habits }
    })
  }, [update])

  const setWater = useCallback((glasses) => {
    const td = today()
    update(prev => ({
      ...prev,
      waterLog: { ...prev.waterLog, [td]: Math.max(0, Math.min(12, glasses)) },
    }))
  }, [update])

  const importData = useCallback((data) => {
    update(() => ({ ...DEFAULTS, ...data }))
  }, [update])

  return {
    ...state,
    toggleHabit, restoreRecords,
    addHabit, updateHabit, deleteHabit, reorderHabits,
    setWater,
    importData,
  }
}
