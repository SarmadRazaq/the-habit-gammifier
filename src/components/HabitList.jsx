import { useState, useRef, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { today } from '../utils/dates'
import { getDone, habitStreak } from '../utils/logic'
import styles from './HabitList.module.css'

// ── Icons ─────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg viewBox="0 0 11 11" fill="none" stroke="white" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1,6 4.5,9.5 10,1.5" />
    </svg>
  )
}
function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M8 2l2 2-6 6H2v-2L8 2z" />
    </svg>
  )
}
function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="1" y1="1" x2="9" y2="9" />
      <line x1="9" y1="1" x2="1" y2="9" />
    </svg>
  )
}
function SaveIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1,6 4.5,9.5 10,1.5" />
    </svg>
  )
}
function DragIcon() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
      <circle cx="4" cy="3"  r="1.5"/>
      <circle cx="4" cy="8"  r="1.5"/>
      <circle cx="4" cy="13" r="1.5"/>
      <circle cx="9" cy="3"  r="1.5"/>
      <circle cx="9" cy="8"  r="1.5"/>
      <circle cx="9" cy="13" r="1.5"/>
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/>
      <polyline points="12,7 12,12 15,15"/>
    </svg>
  )
}

// ── Helpers ───────────────────────────────────────────

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

// ── Edit Panel ────────────────────────────────────────

function EditPanel({ habit, onSave, onCancel }) {
  const [name,        setName]        = useState(habit.name)
  const [description, setDescription] = useState(habit.description || '')
  const [time,        setTime]        = useState(habit.time || '')
  const nameRef = useRef(null)
  useEffect(() => { nameRef.current?.focus() }, [])

  function commit() {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave({ name: trimmed, description: description.trim(), time })
  }

  return (
    <div className={styles.editPanel}>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Habit name</label>
        <input ref={nameRef} className={styles.fieldInput} value={name} maxLength={60}
          placeholder="Habit name" onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') onCancel() }}
        />
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Scheduled time <span className={styles.optional}>(optional)</span>
        </label>
        <input type="time" className={`${styles.fieldInput} ${styles.timeInput}`}
          value={time} onChange={e => setTime(e.target.value)} />
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Description <span className={styles.optional}>(optional)</span>
        </label>
        <textarea className={styles.fieldTextarea} value={description} maxLength={200} rows={2}
          placeholder="What does this habit involve?" onChange={e => setDescription(e.target.value)} />
      </div>
      <div className={styles.editActions}>
        <button className={styles.btnConfirm} onClick={commit}><SaveIcon /> Save</button>
        <button className={styles.btnDismiss} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

// ── Sortable Habit Item ───────────────────────────────

function SortableHabitItem({ habit, done, streak, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [popping, setPopping] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: habit.id })

  const itemStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.75 : 1,
  }

  function handleToggle() {
    if (!done) { setPopping(true); setTimeout(() => setPopping(false), 260) }
    onToggle(habit.id)
  }

  function handleSave(fields) {
    onUpdate(habit.id, fields)
    setEditing(false)
  }

  const streakTxt = streak > 0 ? `🔥 ${streak} day${streak !== 1 ? 's' : ''}` : 'No streak yet'
  const displayTime = formatTime(habit.time)

  return (
    <li
      ref={setNodeRef}
      style={itemStyle}
      className={`${styles.item} ${done ? styles.done : ''} ${isDragging ? styles.dragging : ''}`}
    >
      {editing ? (
        <EditPanel habit={habit} onSave={handleSave} onCancel={() => setEditing(false)} />
      ) : (
        <>
          <div
            className={styles.dragHandle}
            {...attributes}
            {...listeners}
            title="Drag to reorder"
          >
            <DragIcon />
          </div>

          <button
            className={`${styles.check} ${done ? styles.checked : ''} ${popping ? styles.pop : ''}`}
            onClick={handleToggle}
            aria-label={done ? 'Uncheck' : 'Check'}
          >
            {done && <CheckIcon />}
          </button>

          <div className={styles.info} onClick={handleToggle}>
            <div className={styles.nameRow}>
              <span className={styles.name}>{habit.name}</span>
              {displayTime && (
                <span className={styles.timeBadge}><ClockIcon /> {displayTime}</span>
              )}
            </div>
            {habit.description && (
              <div className={styles.description}>{habit.description}</div>
            )}
            <div className={`${styles.streakLine} ${streak > 0 ? styles.lit : ''}`}>
              {streakTxt}
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.actBtn} onClick={() => setEditing(true)} title="Edit">
              <EditIcon />
            </button>
            <button className={`${styles.actBtn} ${styles.danger}`}
              onClick={() => onDelete(habit.id)} title="Delete">
              <CloseIcon />
            </button>
          </div>
        </>
      )}
    </li>
  )
}

// ── Add Habit Form ────────────────────────────────────

function AddHabitForm({ onAdd, onCancel }) {
  const [name,        setName]        = useState('')
  const [description, setDescription] = useState('')
  const [time,        setTime]        = useState('')
  const nameRef = useRef(null)
  useEffect(() => { nameRef.current?.focus() }, [])

  function submit() {
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd({ name: trimmed, description: description.trim(), time })
  }

  return (
    <div className={styles.addForm}>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Habit name</label>
        <input ref={nameRef} className={styles.fieldInput} placeholder="e.g. Morning run"
          value={name} maxLength={60} onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel() }}
        />
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Scheduled time <span className={styles.optional}>(optional)</span>
        </label>
        <input type="time" className={`${styles.fieldInput} ${styles.timeInput}`}
          value={time} onChange={e => setTime(e.target.value)} />
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Description <span className={styles.optional}>(optional)</span>
        </label>
        <textarea className={styles.fieldTextarea} placeholder="Any notes or details…"
          value={description} maxLength={200} rows={2}
          onChange={e => setDescription(e.target.value)} />
      </div>
      <div className={styles.editActions}>
        <button className={styles.btnConfirm} onClick={submit}>Add Habit</button>
        <button className={styles.btnDismiss} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────

export default function HabitList({ habits, records, onToggle, onAdd, onUpdate, onDelete, onReorder }) {
  const [showAdd, setShowAdd] = useState(false)
  const td   = today()
  const done = getDone(records, td)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd({ active, over }) {
    if (over && active.id !== over.id) {
      const oldIdx = habits.findIndex(h => h.id === active.id)
      const newIdx = habits.findIndex(h => h.id === over.id)
      onReorder(oldIdx, newIdx)
    }
  }

  function handleAdd(fields) {
    onAdd(fields)
    setShowAdd(false)
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>Today's Habits</div>
        <button className={styles.btnAdd} onClick={() => setShowAdd(v => !v)}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <line x1="5.5" y1="1" x2="5.5" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="1" y1="5.5" x2="10" y2="5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add Habit
        </button>
      </div>

      {habits.length === 0 && !showAdd ? (
        <div className={styles.empty}>No habits yet — add one above.</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={habits.map(h => h.id)} strategy={verticalListSortingStrategy}>
            <ul className={styles.list}>
              {habits.map(h => (
                <SortableHabitItem
                  key={h.id}
                  habit={h}
                  done={done.includes(h.id)}
                  streak={habitStreak(records, h.id)}
                  onToggle={onToggle}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {showAdd && (
        <AddHabitForm onAdd={handleAdd} onCancel={() => setShowAdd(false)} />
      )}
    </div>
  )
}
