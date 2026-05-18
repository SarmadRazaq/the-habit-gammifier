export function today() {
  const d = new Date()
  return ymd(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

export function ymd(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function shiftDate(dateStr, delta) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d + delta)
  return ymd(dt.getFullYear(), dt.getMonth() + 1, dt.getDate())
}

export function dow(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(y, m - 1, d).getDay()]
}

export function prettyDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}
