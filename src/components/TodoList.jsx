import { useState, useRef } from 'react'
import { useTodoStore } from '../hooks/useTodoStore'
import styles from './TodoList.module.css'

function CheckIcon() {
  return (
    <svg viewBox="0 0 11 11" fill="none" stroke="white" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1,6 4.5,9.5 10,1.5"/>
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="1" y1="1" x2="9" y2="9"/>
      <line x1="9" y1="1" x2="1" y2="9"/>
    </svg>
  )
}

function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div className={`${styles.item} ${todo.done ? styles.itemDone : ''}`}>
      <button
        className={`${styles.check} ${todo.done ? styles.checked : ''}`}
        onClick={() => onToggle(todo.id)}
        aria-label={todo.done ? 'Mark incomplete' : 'Mark complete'}
      >
        {todo.done && <CheckIcon />}
      </button>
      <span className={styles.text}>{todo.text}</span>
      <button
        className={styles.del}
        onClick={() => onDelete(todo.id)}
        aria-label="Delete task"
      >
        <XIcon />
      </button>
    </div>
  )
}

export default function TodoList({ userId }) {
  const { todos, loading, addTodo, toggleTodo, deleteTodo, clearCompleted } = useTodoStore(userId)
  const [text, setText] = useState('')
  const inputRef = useRef(null)

  const active    = todos.filter(t => !t.done)
  const completed = todos.filter(t =>  t.done)

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    addTodo(text)
    setText('')
    inputRef.current?.focus()
  }

  return (
    <div className={styles.wrap}>
      {/* Progress bar */}
      {todos.length > 0 && (
        <div className={styles.progressRow}>
          <span className={styles.progressLabel}>
            {completed.length} / {todos.length} done
          </span>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${(completed.length / todos.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Add form */}
      <form className={styles.addForm} onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className={styles.addInput}
          type="text"
          placeholder="Add a task…"
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={200}
          autoComplete="off"
        />
        <button className={styles.addBtn} type="submit" disabled={!text.trim()}>
          Add
        </button>
      </form>

      {loading ? (
        <div className={styles.empty}>Loading…</div>
      ) : (
        <>
          {/* Active */}
          {active.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>To do · {active.length}</div>
              <div className={styles.list}>
                {active.map(t => (
                  <TodoItem key={t.id} todo={t} onToggle={toggleTodo} onDelete={deleteTodo}/>
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionLabel}>Completed · {completed.length}</div>
                <button className={styles.clearBtn} onClick={clearCompleted}>Clear all</button>
              </div>
              <div className={styles.list}>
                {completed.map(t => (
                  <TodoItem key={t.id} todo={t} onToggle={toggleTodo} onDelete={deleteTodo}/>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {todos.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>✓</div>
              <div className={styles.emptyText}>No tasks yet. Add one above.</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
