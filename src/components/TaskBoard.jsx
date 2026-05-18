import { useState, useRef } from 'react'
import {
  DndContext, PointerSensor, useSensor, useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTaskStore } from '../hooks/useTaskStore'
import { today } from '../utils/dates'
import { isSunday } from '../utils/logic'
import styles from './TaskBoard.module.css'

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_NEXT  = { pending: 'in_progress', in_progress: 'completed', completed: 'pending' }
const STATUS_LABEL = { pending: 'Pending', in_progress: 'In Progress', completed: 'Done' }
const STATUS_CLS   = { pending: styles.badgePending, in_progress: styles.badgeProgress, completed: styles.badgeDone }

function statusBtnStyle(status) {
  if (status === 'pending')     return { background: 'color-mix(in srgb,#f59e0b 15%,transparent)', color: '#f59e0b' }
  if (status === 'in_progress') return { background: 'color-mix(in srgb,#3b82f6 15%,transparent)', color: '#3b82f6' }
  return { background: 'color-mix(in srgb,#22c55e 15%,transparent)', color: '#22c55e' }
}

// ── Sortable task card ────────────────────────────────────────────────────────

function TaskCard({ task, onStatusCycle, onDelete, onUpdate, onAddLink, onRemoveLink }) {
  const [expanded,    setExpanded]    = useState(false)
  const [editing,     setEditing]     = useState(false)
  const [editTitle,   setEditTitle]   = useState(task.title)
  const [editDesc,    setEditDesc]    = useState(task.description || '')
  const [linkInput,   setLinkInput]   = useState('')
  const linkRef = useRef(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, disabled: task.status === 'completed' })

  const style = { transform: CSS.Transform.toString(transform), transition }

  function saveEdit() {
    if (editTitle.trim()) {
      onUpdate(task.id, { title: editTitle.trim(), description: editDesc.trim() })
    }
    setEditing(false)
  }

  function submitLink(e) {
    e.preventDefault()
    const url = linkInput.trim()
    if (!url) return
    onAddLink(task.id, url.startsWith('http') ? url : 'https://' + url)
    setLinkInput('')
  }

  const isDone = task.status === 'completed'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
    >
      <div className={styles.cardRow}>
        {!isDone && (
          <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
        )}
        {isDone && <span style={{ width: 20, flexShrink: 0 }} />}

        <div className={styles.cardBody}>
          {editing ? (
            <>
              <input
                className={styles.formInput}
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
                autoFocus
                style={{ marginBottom: 6 }}
              />
              <textarea
                className={styles.formTextarea}
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                placeholder="Description (optional)"
                style={{ minHeight: 50 }}
              />
              <div className={styles.formButtons} style={{ marginTop: 6 }}>
                <button className={styles.btnSecondary} onClick={() => setEditing(false)}>Cancel</button>
                <button className={styles.btnPrimary}   onClick={saveEdit}>Save</button>
              </div>
            </>
          ) : (
            <span
              className={`${styles.cardTitle} ${isDone ? styles.cardTitleDone : ''}`}
              onClick={() => setExpanded(x => !x)}
              style={{ cursor: 'pointer' }}
            >
              {task.title}
            </span>
          )}

          <div className={styles.cardMeta}>
            <button
              className={styles.statusBtn}
              style={statusBtnStyle(task.status)}
              onClick={() => onStatusCycle(task.id, STATUS_NEXT[task.status])}
              title="Click to advance status"
            >
              {STATUS_LABEL[task.status]}
            </button>
            {task.type === 'recurring' && (
              <span className={`${styles.badge} ${styles.badgeRecurring}`}>
                ↻ {task.recur_freq || 'recurring'}
              </span>
            )}
          </div>
        </div>

        <div className={styles.cardActions}>
          <button className={styles.iconBtn} onClick={() => { setEditing(e => !e); setExpanded(true) }} title="Edit">✎</button>
          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => onDelete(task.id)} title="Delete">✕</button>
          <button className={styles.iconBtn} onClick={() => setExpanded(x => !x)} title={expanded ? 'Collapse' : 'Expand'}>
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {expanded && !editing && (
        <div className={styles.cardExpanded}>
          {task.description && <p className={styles.desc}>{task.description}</p>}

          {(task.links ?? []).length > 0 && (
            <div className={styles.links}>
              {task.links.map(url => (
                <a key={url} href={url} target="_blank" rel="noreferrer" className={styles.linkChip}>
                  🔗 {new URL(url.startsWith('http') ? url : 'https://' + url).hostname}
                  <button className={styles.linkRemove} onClick={e => { e.preventDefault(); onRemoveLink(task.id, url) }}>×</button>
                </a>
              ))}
            </div>
          )}

          <form className={styles.addLinkRow} onSubmit={submitLink}>
            <input
              ref={linkRef}
              className={styles.addLinkInput}
              value={linkInput}
              onChange={e => setLinkInput(e.target.value)}
              placeholder="Add link URL…"
            />
            <button type="submit" className={styles.addLinkBtn}>Add</button>
          </form>
        </div>
      )}
    </div>
  )
}

// ── New task form ─────────────────────────────────────────────────────────────

function NewTaskForm({ scope, onAdd, onCancel }) {
  const [title,     setTitle]     = useState('')
  const [desc,      setDesc]      = useState('')
  const [type,      setType]      = useState('one_time')
  const [recurFreq, setRecurFreq] = useState('daily')

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), description: desc.trim(), scope, type, recur_freq: type === 'recurring' ? recurFreq : null })
    onCancel()
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formRow}>
        <input
          className={styles.formInput}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Task title…"
          autoFocus
        />
      </div>
      <textarea
        className={styles.formTextarea}
        value={desc}
        onChange={e => setDesc(e.target.value)}
        placeholder="Description (optional)"
      />
      <div className={styles.formRow} style={{ marginTop: 8 }}>
        <select className={styles.formSelect} value={type} onChange={e => setType(e.target.value)}>
          <option value="one_time">One-time</option>
          <option value="recurring">Recurring</option>
        </select>
        {type === 'recurring' && (
          <select className={styles.formSelect} value={recurFreq} onChange={e => setRecurFreq(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        )}
      </div>
      <div className={styles.formButtons}>
        <button type="button" className={styles.btnSecondary} onClick={onCancel}>Cancel</button>
        <button type="submit" className={styles.btnPrimary}>Add Task</button>
      </div>
    </form>
  )
}

// ── Scope section (short-term or long-term) ────────────────────────────────────

function ScopeSection({ scope, label, tasks, store }) {
  const [adding,           setAdding]           = useState(false)
  const [showCompleted,    setShowCompleted]     = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const active    = tasks.filter(t => t.status !== 'completed')
  const completed = tasks.filter(t => t.status === 'completed')

  function handleDragEnd({ active: a, over }) {
    if (!over || a.id === over.id) return
    const oldIdx = active.findIndex(t => t.id === a.id)
    const newIdx = active.findIndex(t => t.id === over.id)
    if (oldIdx !== -1 && newIdx !== -1) store.reorderTasks(scope, oldIdx, newIdx)
  }

  return (
    <div>
      <div className={styles.sectionHead}>
        <span className={styles.sectionTitle}>{label}</span>
        <button className={styles.addBtn} onClick={() => setAdding(x => !x)}>+ Add</button>
      </div>

      {adding && (
        <NewTaskForm scope={scope} onAdd={store.addTask} onCancel={() => setAdding(false)} />
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={active.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {active.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusCycle={store.setStatus}
              onDelete={store.deleteTask}
              onUpdate={store.updateTask}
              onAddLink={store.addLink}
              onRemoveLink={store.removeLink}
            />
          ))}
        </SortableContext>
      </DndContext>

      {active.length === 0 && !adding && (
        <p className={styles.empty}>No active tasks — hit + Add to create one.</p>
      )}

      {completed.length > 0 && (
        <>
          <button className={styles.completedToggle} onClick={() => setShowCompleted(x => !x)}>
            {showCompleted ? '▼' : '▶'} Completed ({completed.length})
          </button>
          {showCompleted && completed.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusCycle={store.setStatus}
              onDelete={store.deleteTask}
              onUpdate={store.updateTask}
              onAddLink={store.addLink}
              onRemoveLink={store.removeLink}
            />
          ))}
        </>
      )}
    </div>
  )
}

// ── History view ──────────────────────────────────────────────────────────────

function HistoryView({ history }) {
  const [period, setPeriod] = useState('week')

  const now = today()
  const cutoff = period === 'week'
    ? (() => { const d = new Date(now); d.setDate(d.getDate() - 6); return d.toISOString().slice(0, 10) })()
    : (() => { const d = new Date(now); d.setDate(d.getDate() - 29); return d.toISOString().slice(0, 10) })()

  const filtered = history.filter(h => h.completed_at >= cutoff)

  // Group by date
  const groups = {}
  for (const h of filtered) {
    if (!groups[h.completed_at]) groups[h.completed_at] = []
    groups[h.completed_at].push(h)
  }
  const sortedDates = Object.keys(groups).sort().reverse()

  return (
    <div>
      <div className={styles.sectionHead}>
        <span className={styles.sectionTitle}>Completion History</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {['week', 'month'].map(p => (
            <button
              key={p}
              className={`${styles.subTab} ${period === p ? styles.subTabActive : ''}`}
              onClick={() => setPeriod(p)}
              style={{ padding: '4px 10px', marginBottom: 0 }}
            >
              {p === 'week' ? '7 days' : '30 days'}
            </button>
          ))}
        </div>
      </div>

      {sortedDates.length === 0 && (
        <p className={styles.empty}>No completed tasks in this period.</p>
      )}

      {sortedDates.map(date => (
        <div key={date} className={styles.histGroup}>
          <div className={styles.histGroupTitle}>
            {new Date(date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
          {groups[date].map(h => (
            <div key={h.id} className={styles.histItem}>
              <span className={styles.histTitle}>{h.title}</span>
              <div className={styles.histMeta}>
                <span className={`${styles.badge} ${h.scope === 'short_term' ? '' : styles.badgeRecurring}`}>
                  {h.scope === 'short_term' ? 'Short-term' : 'Long-term'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ── TaskBoard root ────────────────────────────────────────────────────────────

export default function TaskBoard({ userId }) {
  const store = useTaskStore(userId)
  const [subTab, setSubTab] = useState('short')

  const shortTasks = store.tasks.filter(t => t.scope === 'short_term')
  const longTasks  = store.tasks.filter(t => t.scope === 'long_term')

  if (store.loading) return <div className={styles.empty}>Loading tasks…</div>

  return (
    <div className={styles.board}>
      <div className={styles.subTabs}>
        {[
          { id: 'short',   label: 'Short-term' },
          { id: 'long',    label: 'Long-term'  },
          { id: 'history', label: 'History'    },
        ].map(t => (
          <button
            key={t.id}
            className={`${styles.subTab} ${subTab === t.id ? styles.subTabActive : ''}`}
            onClick={() => setSubTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'short' && (
        <ScopeSection scope="short_term" label="Short-term Tasks" tasks={shortTasks} store={store} />
      )}
      {subTab === 'long' && (
        <ScopeSection scope="long_term"  label="Long-term Tasks"  tasks={longTasks}  store={store} />
      )}
      {subTab === 'history' && <HistoryView history={store.history} />}
    </div>
  )
}
