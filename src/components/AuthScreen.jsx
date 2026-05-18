import { useState } from 'react'
import styles from './AuthScreen.module.css'

export default function AuthScreen({ onSignIn, onSignUp }) {
  const [mode, setMode]       = useState('signin') // 'signin' | 'signup'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)   // signup confirmation

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        await onSignUp(email, password)
        setDone(true)
      } else {
        await onSignIn(email, password)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.logo}>⚡</div>
          <h1 className={styles.title}>Check your email</h1>
          <p className={styles.sub}>
            We sent a confirmation link to <strong>{email}</strong>.
            Click it to activate your account, then sign in.
          </p>
          <button className={styles.switchBtn} onClick={() => { setDone(false); setMode('signin') }}>
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.logo}>⚡</div>
        <h1 className={styles.title}>HabitFlow</h1>
        <p className={styles.sub}>
          {mode === 'signin' ? 'Sign in to sync your habits across devices.' : 'Create an account to get started.'}
        </p>

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              className={styles.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              className={styles.input}
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className={styles.switchRow}>
          {mode === 'signin' ? (
            <>No account? <button className={styles.switchBtn} onClick={() => { setMode('signup'); setError('') }}>Sign up</button></>
          ) : (
            <>Already have one? <button className={styles.switchBtn} onClick={() => { setMode('signin'); setError('') }}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  )
}
