import { useRef } from 'react'
import { today } from '../utils/dates'
import styles from './DataControls.module.css'

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

export default function DataControls({ data, onImport, onReset, showToast }) {
  const fileRef = useRef(null)

  function handleExport() {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `habitflow-backup-${today()}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Backup downloaded')
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        if (!Array.isArray(parsed.habits) || typeof parsed.records !== 'object') {
          showToast('Invalid backup file')
          return
        }
        if (!window.confirm('Import this backup? Your current data will be replaced.')) return
        onImport(parsed)
        showToast('Data imported successfully!')
      } catch {
        showToast('Could not read file')
      }
    }
    reader.readAsText(file)
    // Reset so same file can be re-selected
    e.target.value = ''
  }

  function handleReset() {
    if (!window.confirm('Reset ALL data? This cannot be undone.')) return
    onReset()
    showToast('Data cleared')
  }

  return (
    <div className={styles.card}>
      <div className={styles.head}>Data</div>
      <div className={styles.row}>
        <div className={styles.item}>
          <div className={styles.itemTitle}>Export backup</div>
          <div className={styles.itemSub}>Download your habits and history as JSON</div>
          <button className={styles.btn} onClick={handleExport}>
            <DownloadIcon /> Export
          </button>
        </div>

        <div className={styles.divider} />

        <div className={styles.item}>
          <div className={styles.itemTitle}>Import backup</div>
          <div className={styles.itemSub}>Restore from a previously exported JSON file</div>
          <button className={styles.btn} onClick={() => fileRef.current?.click()}>
            <UploadIcon /> Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        <div className={styles.divider} />

        <div className={styles.item}>
          <div className={styles.itemTitle}>Reset all data</div>
          <div className={styles.itemSub}>Clear everything and start fresh</div>
          <button className={`${styles.btn} ${styles.danger}`} onClick={handleReset}>
            <TrashIcon /> Reset
          </button>
        </div>
      </div>
    </div>
  )
}
