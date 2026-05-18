import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { DEFAULT_HABITS } from '../utils/logic'
import { today } from '../utils/dates'

// ── Helpers ────────────────────────────────────────────────────────────────

function toRecords(rows) {
  // rows: [{ habit_id, date }] → { 'YYYY-MM-DD': ['h1','h2'], … }
  const out = {}
  for (const r of rows) {
    const d = r.date
    if (!out[d]) out[d] = []
    out[d].push(r.habit_id)
  }
  return out
}

function toWaterLog(rows) {
  // rows: [{ date, glasses }] → { 'YYYY-MM-DD': n }
  const out = {}
  for (const r of rows) out[r.date] = r.glasses
  return out
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useHabitStore(userId) {
  const [habits,   setHabits]   = useState([])
  const [records,  setRecords]  = useState({})
  const [waterLog, setWaterLog] = useState({})
  const [loading,  setLoading]  = useState(true)
  const seededRef = useRef(false)

  // ── Initial load ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      const [habitsRes, recordsRes, waterRes] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', userId).order('position'),
        supabase.from('daily_records').select('habit_id, date').eq('user_id', userId),
        supabase.from('water_log').select('date, glasses').eq('user_id', userId),
      ])
      if (cancelled) return

      const loadedHabits = habitsRes.data ?? []

      // Seed default habits for brand-new accounts
      if (loadedHabits.length === 0 && !seededRef.current) {
        seededRef.current = true
        const toInsert = DEFAULT_HABITS.map((h, i) => ({
          id: h.id, user_id: userId, name: h.name,
          description: h.description || '', time: h.time || '', position: i,
        }))
        const { data: seeded } = await supabase.from('habits').insert(toInsert).select()
        if (!cancelled) setHabits(seeded ?? DEFAULT_HABITS)
      } else {
        if (!cancelled) setHabits(loadedHabits)
      }

      if (!cancelled) {
        setRecords(toRecords(recordsRes.data ?? []))
        setWaterLog(toWaterLog(waterRes.data ?? []))
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [userId])

  // ── toggleHabit ───────────────────────────────────────────────────────

  const toggleHabit = useCallback(async (hid) => {
    const td = today()

    // Optimistic update
    setRecords(prev => {
      const dayIds = prev[td] ? [...prev[td]] : []
      const idx = dayIds.indexOf(hid)
      if (idx === -1) dayIds.push(hid)
      else dayIds.splice(idx, 1)
      return { ...prev, [td]: dayIds }
    })

    // Sync — check current DB state to decide insert vs delete
    const { data: existing } = await supabase
      .from('daily_records')
      .select('id')
      .eq('user_id', userId)
      .eq('habit_id', hid)
      .eq('date', td)
      .maybeSingle()

    if (existing) {
      await supabase.from('daily_records').delete().eq('id', existing.id)
    } else {
      await supabase.from('daily_records').insert({ user_id: userId, habit_id: hid, date: td })
    }
  }, [userId])

  // ── undoToggle (replaces restoreRecords) ─────────────────────────────

  const undoToggle = useCallback(async (hid) => {
    // Simply re-toggle: if we just checked it off, uncheck it; vice-versa.
    await toggleHabit(hid)
  }, [toggleHabit])

  // ── addHabit ──────────────────────────────────────────────────────────

  const addHabit = useCallback(async ({ name, description = '', time = '' }) => {
    const id  = 'h' + Date.now()
    const pos = habits.length

    // Optimistic update
    const newHabit = { id, user_id: userId, name, description, time, position: pos }
    setHabits(prev => [...prev, newHabit])

    await supabase.from('habits').insert({ id, user_id: userId, name, description, time, position: pos })
  }, [habits.length, userId])

  // ── updateHabit ───────────────────────────────────────────────────────

  const updateHabit = useCallback(async (hid, fields) => {
    setHabits(prev => prev.map(h => h.id === hid ? { ...h, ...fields } : h))
    await supabase.from('habits').update(fields).eq('id', hid).eq('user_id', userId)
  }, [userId])

  // ── deleteHabit ───────────────────────────────────────────────────────

  const deleteHabit = useCallback(async (hid) => {
    setHabits(prev => prev.filter(h => h.id !== hid))
    setRecords(prev => {
      const next = {}
      for (const [date, ids] of Object.entries(prev)) {
        const filtered = ids.filter(id => id !== hid)
        if (filtered.length) next[date] = filtered
      }
      return next
    })
    // daily_records cascade-deletes via FK
    await supabase.from('habits').delete().eq('id', hid).eq('user_id', userId)
  }, [userId])

  // ── reorderHabits ─────────────────────────────────────────────────────

  const reorderHabits = useCallback(async (oldIdx, newIdx) => {
    let reordered
    setHabits(prev => {
      const next = [...prev]
      const [moved] = next.splice(oldIdx, 1)
      next.splice(newIdx, 0, moved)
      reordered = next
      return next
    })

    // Persist after a tick so reordered is populated
    setTimeout(() => {
      if (!reordered) return
      Promise.all(reordered.map((h, i) =>
        supabase.from('habits').update({ position: i }).eq('id', h.id).eq('user_id', userId)
      ))
    }, 0)
  }, [userId])

  // ── setWater ──────────────────────────────────────────────────────────

  const setWater = useCallback(async (glasses) => {
    const td = today()
    const clamped = Math.max(0, Math.min(12, glasses))

    setWaterLog(prev => ({ ...prev, [td]: clamped }))

    await supabase.from('water_log').upsert(
      { user_id: userId, date: td, glasses: clamped, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,date' },
    )
  }, [userId])

  // ── importData ────────────────────────────────────────────────────────

  const importData = useCallback(async (data) => {
    const { habits: importedHabits = [], records: importedRecords = {}, waterLog: importedWater = {} } = data

    // Optimistic
    setHabits(importedHabits)
    setRecords(importedRecords)
    setWaterLog(importedWater)

    // Replace all habits
    await supabase.from('habits').delete().eq('user_id', userId)
    if (importedHabits.length) {
      await supabase.from('habits').insert(
        importedHabits.map((h, i) => ({
          id: h.id, user_id: userId, name: h.name,
          description: h.description || '', time: h.time || '', position: i,
        }))
      )
    }

    // Replace all records
    await supabase.from('daily_records').delete().eq('user_id', userId)
    const recordRows = []
    for (const [date, ids] of Object.entries(importedRecords)) {
      for (const habit_id of ids) recordRows.push({ user_id: userId, habit_id, date })
    }
    if (recordRows.length) await supabase.from('daily_records').insert(recordRows)

    // Replace water log
    await supabase.from('water_log').delete().eq('user_id', userId)
    const waterRows = Object.entries(importedWater).map(([date, glasses]) => ({
      user_id: userId, date, glasses,
    }))
    if (waterRows.length) await supabase.from('water_log').insert(waterRows)
  }, [userId])

  return {
    habits, records, waterLog, loading,
    toggleHabit, undoToggle,
    addHabit, updateHabit, deleteHabit, reorderHabits,
    setWater,
    importData,
  }
}
