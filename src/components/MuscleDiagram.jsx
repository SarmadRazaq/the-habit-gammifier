import styles from './MuscleDiagram.module.css'

// Maps the exercise `muscle` field → which SVG regions to highlight
const MUSCLE_MAP = {
  'Chest':         { front: ['chest'] },
  'Upper Chest':   { front: ['chest', 'shoulders'] },
  'Shoulders':     { front: ['shoulders'] },
  'Side Delts':    { front: ['shoulders'] },
  'Triceps':       { back: ['triceps'] },
  'Long Head':     { back: ['triceps'] },
  'Full Back':     { back: ['traps', 'lats'] },
  'Lats':          { back: ['lats'] },
  'Mid Back':      { back: ['traps', 'lats'] },
  'Rear Delts':    { back: ['rear_delts'] },
  'Biceps':        { front: ['biceps'] },
  'Brachialis':    { front: ['biceps'] },
  'Hamstrings':    { back: ['hamstrings'] },
  'Quads/Glutes':  { front: ['quads'], back: ['glutes'] },
  'Quads':         { front: ['quads'] },
  'Glutes':        { back: ['glutes'] },
  'Glutes/Quads':  { front: ['quads'], back: ['glutes'] },
  'Calves':        { front: ['calves'] },
  'Soleus':        { front: ['calves'] },
  'Full Body':     { front: ['chest', 'shoulders', 'abs', 'quads'], back: ['glutes', 'hamstrings'] },
}

function FrontSVG({ highlights, color }) {
  const H = (id) => highlights.includes(id) ? color : 'var(--s4)'
  const mid = 'var(--s3)'

  return (
    <svg viewBox="0 0 56 130" className={styles.svg} aria-hidden="true">
      {/* Head */}
      <ellipse cx="28" cy="9" rx="8" ry="9" fill="var(--s4)"/>
      {/* Neck */}
      <rect x="25" y="17" width="6" height="8" rx="2" fill={mid}/>
      {/* Left shoulder */}
      <ellipse cx="12" cy="29" rx="9" ry="7" fill={H('shoulders')}/>
      {/* Right shoulder */}
      <ellipse cx="44" cy="29" rx="9" ry="7" fill={H('shoulders')}/>
      {/* Chest */}
      <rect x="19" y="23" width="18" height="19" rx="3" fill={H('chest')}/>
      {/* Abs */}
      <rect x="20" y="42" width="16" height="22" rx="3" fill={H('abs')}/>
      {/* Left bicep */}
      <rect x="6" y="24" width="8" height="28" rx="4" fill={H('biceps')}/>
      {/* Right bicep */}
      <rect x="42" y="24" width="8" height="28" rx="4" fill={H('biceps')}/>
      {/* Left forearm */}
      <rect x="4" y="54" width="7" height="20" rx="3" fill={mid}/>
      {/* Right forearm */}
      <rect x="45" y="54" width="7" height="20" rx="3" fill={mid}/>
      {/* Hips */}
      <rect x="18" y="64" width="20" height="13" rx="4" fill={mid}/>
      {/* Left quad */}
      <rect x="18" y="76" width="9" height="34" rx="4" fill={H('quads')}/>
      {/* Right quad */}
      <rect x="29" y="76" width="9" height="34" rx="4" fill={H('quads')}/>
      {/* Knees */}
      <ellipse cx="22" cy="113" rx="5" ry="3.5" fill={mid}/>
      <ellipse cx="34" cy="113" rx="5" ry="3.5" fill={mid}/>
      {/* Left calf */}
      <rect x="18" y="116" width="8" height="13" rx="3" fill={H('calves')}/>
      {/* Right calf */}
      <rect x="29" y="116" width="8" height="13" rx="3" fill={H('calves')}/>
    </svg>
  )
}

function BackSVG({ highlights, color }) {
  const H = (id) => highlights.includes(id) ? color : 'var(--s4)'
  const mid = 'var(--s3)'

  return (
    <svg viewBox="0 0 56 130" className={styles.svg} aria-hidden="true">
      {/* Head */}
      <ellipse cx="28" cy="9" rx="8" ry="9" fill="var(--s4)"/>
      {/* Neck */}
      <rect x="25" y="17" width="6" height="8" rx="2" fill={mid}/>
      {/* Left rear delt */}
      <ellipse cx="12" cy="30" rx="9" ry="7" fill={H('rear_delts')}/>
      {/* Right rear delt */}
      <ellipse cx="44" cy="30" rx="9" ry="7" fill={H('rear_delts')}/>
      {/* Traps */}
      <path d="M22 23 L34 23 L40 37 L16 37 Z" fill={H('traps')}/>
      {/* Lats */}
      <path d="M16 37 L40 37 L36 64 L20 64 Z" fill={H('lats')}/>
      {/* Left tricep */}
      <rect x="6" y="24" width="8" height="30" rx="4" fill={H('triceps')}/>
      {/* Right tricep */}
      <rect x="42" y="24" width="8" height="30" rx="4" fill={H('triceps')}/>
      {/* Left forearm */}
      <rect x="4" y="56" width="7" height="20" rx="3" fill={mid}/>
      {/* Right forearm */}
      <rect x="45" y="56" width="7" height="20" rx="3" fill={mid}/>
      {/* Lower back */}
      <rect x="20" y="64" width="16" height="12" rx="3" fill={mid}/>
      {/* Glutes */}
      <rect x="17" y="75" width="22" height="16" rx="5" fill={H('glutes')}/>
      {/* Left hamstring */}
      <rect x="18" y="90" width="9" height="34" rx="4" fill={H('hamstrings')}/>
      {/* Right hamstring */}
      <rect x="29" y="90" width="9" height="34" rx="4" fill={H('hamstrings')}/>
      {/* Knee backs */}
      <ellipse cx="22" cy="126" rx="5" ry="3.5" fill={mid}/>
      <ellipse cx="34" cy="126" rx="5" ry="3.5" fill={mid}/>
    </svg>
  )
}

export default function MuscleDiagram({ muscle, color = 'var(--accent)' }) {
  const mapping = MUSCLE_MAP[muscle] ?? {}
  const front = mapping.front ?? []
  const back  = mapping.back  ?? []
  if (!front.length && !back.length) return null

  return (
    <div className={styles.wrap}>
      {front.length > 0 && (
        <div className={styles.view}>
          <FrontSVG highlights={front} color={color}/>
          <span className={styles.label}>Front</span>
        </div>
      )}
      {back.length > 0 && (
        <div className={styles.view}>
          <BackSVG highlights={back} color={color}/>
          <span className={styles.label}>Back</span>
        </div>
      )}
    </div>
  )
}
