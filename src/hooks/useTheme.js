import { useState, useEffect } from 'react'

const THEME_KEY = 'habitflow_theme'

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY)
    return saved === 'light' ? 'light' : 'dark'
  })

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  // Apply on first paint before any render
  useEffect(() => { applyTheme(theme) }, [])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return { theme, toggle }
}
