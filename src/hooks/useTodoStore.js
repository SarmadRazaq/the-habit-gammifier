import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTodoStore(userId) {
  const [todos,   setTodos]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('todos').select('*').eq('user_id', userId).order('created_at', { ascending: true })
      if (!cancelled) { setTodos(data ?? []); setLoading(false) }
    }

    load()
    return () => { cancelled = true }
  }, [userId])

  const addTodo = useCallback(async (text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const tempId  = 'tmp_' + Date.now()
    setTodos(prev => [...prev, { id: tempId, text: trimmed, done: false, created_at: new Date().toISOString() }])
    const { data } = await supabase
      .from('todos').insert({ user_id: userId, text: trimmed, done: false }).select().single()
    if (data) setTodos(prev => prev.map(t => t.id === tempId ? data : t))
  }, [userId])

  const toggleTodo = useCallback(async (id) => {
    let nextDone
    setTodos(prev => prev.map(t => {
      if (t.id !== id) return t
      nextDone = !t.done
      return { ...t, done: nextDone }
    }))
    await supabase.from('todos').update({ done: nextDone }).eq('id', id).eq('user_id', userId)
  }, [userId])

  const deleteTodo = useCallback(async (id) => {
    setTodos(prev => prev.filter(t => t.id !== id))
    await supabase.from('todos').delete().eq('id', id).eq('user_id', userId)
  }, [userId])

  const clearCompleted = useCallback(async () => {
    const ids = []
    setTodos(prev => { prev.forEach(t => { if (t.done) ids.push(t.id) }); return prev.filter(t => !t.done) })
    if (ids.length) await supabase.from('todos').delete().in('id', ids).eq('user_id', userId)
  }, [userId])

  return { todos, loading, addTodo, toggleTodo, deleteTodo, clearCompleted }
}
