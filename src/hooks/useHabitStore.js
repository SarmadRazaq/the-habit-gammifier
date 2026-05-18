import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { DEFAULT_HABITS } from '../utils/logic'
import { today } from '../utils/dates'

function toRecords(rows) {
  const out = {}
  for (const r of rows) {
    if (!out[r.date]) out[r.date] = []
    out[r.date].push(r.habit_id)
  }
  return out
}

function toWaterLog(rows) {
  const out = {}
  for (const r of rows) out[r.date] = r.glasses
  return out
}

export function useHabitStore(userId) {
  const [habits,   setHabits]   = useState([])
  const [records,  setRecords]  = useState({})
  const [waterLog, setWaterLog] = useState({})
  const [loading,  setLoading]  = useState(true)
  const seededRef = useRef(false)

  // ── Load ──────────────────────────────────────────────────────────────

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
    setRecords(prev => {
      const dayIds = prev[td] ? [...prev[td]] : []
      const idx    = dayIds.indexOf(hid)
      if (idx === -1) dayIds.push(hid); else dayIds.splice(idx, 1)
      return { ...prev, [td]: dayIds }
    })

    const { data: existing } = await supabase
      .from('daily_records').select('id')
      .eq('user_id', userId).eq('habit_id', hid).eq('date', td).maybeSingle()

    if (existing) {
      await supabase.from('daily_records').delete().eq('id', existing.id)
    } else {
      await supabase.from('daily_records').insert({ user_id: userId, habit_id: hid, date: td })
    }
  }, [userId])

  const undoToggle = useCallback(async (hid) => toggleHabit(hid), [toggleHabit])

  // ── addHabit ──────────────────────────────────────────────────────────

  const addHabit = useCallback(async ({ name, description = '', time = '' }) => {
    const id  = 'h' + Date.now()
    const pos = habits.length
    setHabits(prev => [...prev, { id, name, description, time, position: pos, user_id: userId }])
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
    await supabase.from('habits').delete().eq('id', hid).eq('user_id', userId)
  }, [userId])

  // ── reorderHabits ─────────────────────────────────────────────────────

  const reorderHabits = useCallback(async (oldIdx, newIdx) => {
    let reordered
    setHabits(prev => {
      const next    = [...prev]
      const [moved] = next.splice(oldIdx, 1)
      next.splice(newIdx, 0, moved)
      reordered = next
      return next
    })
    setTimeout(() => {
      if (!reordered) return
      Promise.all(reordered.map((h, i) =>
        supabase.from('habits').update({ position: i }).eq('id', h.id).eq('user_id', userId)
      ))
    }, 0)
  }, [userId])

  // ── setWater ──────────────────────────────────────────────────────────

  const setWater = useCallback(async (glasses) => {
    const td      = today()
    const clamped = Math.max(0, Math.min(12, glasses))
    setWaterLog(prev => ({ ...prev, [td]: clamped }))
    await supabase.from('water_log').upsert(
      { user_id: userId, date: td, glasses: clamped, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,date' },
    )
  }, [userId])

  // ── importData ────────────────────────────────────────────────────────

  const importData = useCallback(async (data) => {
    const { habits: h = [], records: r = {}, waterLog: w = {} } = data
    setHabits(h); setRecords(r); setWaterLog(w)

    await supabase.from('habits').delete().eq('user_id', userId)
    if (h.length) await supabase.from('habits').insert(
      h.map((habit, i) => ({
        id: habit.id, user_id: userId, name: habit.name,
        description: habit.description || '', time: habit.time || '', position: i,
      }))
    )

    await supabase.from('daily_records').delete().eq('user_id', userId)
    const rows = []
    for (const [date, ids] of Object.entries(r))
      for (const habit_id of ids) rows.push({ user_id: userId, habit_id, date })
    if (rows.length) await supabase.from('daily_records').insert(rows)

    await supabase.from('water_log').delete().eq('user_id', userId)
    const wRows = Object.entries(w).map(([date, glasses]) => ({ user_id: userId, date, glasses }))
    if (wRows.length) await supabase.from('water_log').insert(wRows)
  }, [userId])

  return {
    habits, records, waterLog, loading,
    toggleHabit, undoToggle,
    addHabit, updateHabit, deleteHabit, reorderHabits,
    setWater, importData,
  }
}
