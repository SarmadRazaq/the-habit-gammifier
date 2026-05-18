import { useState, useCallback, useRef } from 'react'

export function useToast() {
  const [toast, setToast] = useState({ msg: '', visible: false, onUndo: null })
  const timer = useRef(null)

  const showToast = useCallback((msg, onUndo = null) => {
    clearTimeout(timer.current)
    setToast({ msg, visible: true, onUndo })
    // Give more time when there's an undo action
    timer.current = setTimeout(
      () => setToast(t => ({ ...t, visible: false, onUndo: null })),
      onUndo ? 5000 : 2400,
    )
  }, [])

  const dismissToast = useCallback(() => {
    clearTimeout(timer.current)
    setToast(t => ({ ...t, visible: false, onUndo: null }))
  }, [])

  return { toast, showToast, dismissToast }
}
