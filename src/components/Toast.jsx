import styles from './Toast.module.css'

export default function Toast({ msg, visible, onUndo, onDismiss }) {
  function handleUndo() {
    onUndo?.()
    onDismiss?.()
  }

  return (
    <div className={`${styles.toast} ${visible ? styles.show : ''}`}>
      <span className={styles.msg}>{msg}</span>
      {onUndo && (
        <button className={styles.undoBtn} onClick={handleUndo}>
          Undo
        </button>
      )}
    </div>
  )
}
