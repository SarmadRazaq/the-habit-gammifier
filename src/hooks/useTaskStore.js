import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTaskStore(userId) {
  const [tasks,   setTasks]   = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      const [{ data: tData }, { data: hData }] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', userId).order('scope').order('position'),
        supabase.from('task_history').select('*').eq('user_id', userId).order('completed_at', { ascending: false }),
      ])
      if (!cancelled) {
        setTasks(tData ?? [])
        setHistory(hData ?? [])
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [userId])

  const addTask = useCallback(async ({ title, description = '', links = [], scope = 'short_term', type = 'one_time', recur_freq = null }) => {
    const scopeTasks = tasks.filter(t => t.scope === scope)
    const position   = scopeTasks.length
    const tempId     = 'tmp_' + Date.now()
    const optimistic = { id: tempId, user_id: userId, title, description, links, scope, type, recur_freq, status: 'pending', position, completed_at: null, created_at: new Date().toISOString() }
    setTasks(prev => [...prev, optimistic])
    const { data } = await supabase
      .from('tasks')
      .insert({ user_id: userId, title, description, links, scope, type, recur_freq, status: 'pending', position })
      .select().single()
    if (data) setTasks(prev => prev.map(t => t.id === tempId ? data : t))
  }, [tasks, userId])

  const updateTask = useCallback(async (id, fields) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...fields } : t))
    await supabase.from('tasks').update(fields).eq('id', id).eq('user_id', userId)
  }, [userId])

  const deleteTask = useCallback(async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId)
  }, [userId])

  const setStatus = useCallback(async (id, newStatus) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    if (newStatus === 'completed') {
      const now = new Date().toISOString()
      const today = now.slice(0, 10)

      if (task.type === 'recurring') {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'pending' } : t))
        const histEntry = { user_id: userId, task_id: id, title: task.title, scope: task.scope, completed_at: today }
        const { data } = await supabase.from('task_history').insert(histEntry).select().single()
        if (data) setHistory(prev => [data, ...prev])
        await supabase.from('tasks').update({ status: 'pending' }).eq('id', id).eq('user_id', userId)
      } else {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed', completed_at: now } : t))
        const histEntry = { user_id: userId, task_id: id, title: task.title, scope: task.scope, completed_at: today }
        const { data } = await supabase.from('task_history').insert(histEntry).select().single()
        if (data) setHistory(prev => [data, ...prev])
        await supabase.from('tasks').update({ status: 'completed', completed_at: now }).eq('id', id).eq('user_id', userId)
      }
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus, completed_at: null } : t))
      await supabase.from('tasks').update({ status: newStatus, completed_at: null }).eq('id', id).eq('user_id', userId)
    }
  }, [tasks, userId])

  const reorderTasks = useCallback((scope, oldIdx, newIdx) => {
    let reordered
    setTasks(prev => {
      const scopeItems   = prev.filter(t => t.scope === scope && t.status !== 'completed')
      const others       = prev.filter(t => t.scope !== scope || t.status === 'completed')
      const [moved]      = scopeItems.splice(oldIdx, 1)
      scopeItems.splice(newIdx, 0, moved)
      const updated      = scopeItems.map((t, i) => ({ ...t, position: i }))
      reordered          = updated
      return [...others, ...updated].sort((a, b) => {
        if (a.scope !== b.scope) return a.scope.localeCompare(b.scope)
        return a.position - b.position
      })
    })
    setTimeout(() => {
      if (!reordered) return
      Promise.all(reordered.map(t =>
        supabase.from('tasks').update({ position: t.position }).eq('id', t.id).eq('user_id', userId)
      ))
    }, 0)
  }, [userId])

  const addLink = useCallback(async (id, url) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const links = [...(task.links ?? []), url]
    setTasks(prev => prev.map(t => t.id === id ? { ...t, links } : t))
    await supabase.from('tasks').update({ links }).eq('id', id).eq('user_id', userId)
  }, [tasks, userId])

  const removeLink = useCallback(async (id, url) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const links = (task.links ?? []).filter(l => l !== url)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, links } : t))
    await supabase.from('tasks').update({ links }).eq('id', id).eq('user_id', userId)
  }, [tasks, userId])

  return { tasks, history, loading, addTask, updateTask, deleteTask, setStatus, reorderTasks, addLink, removeLink }
}
