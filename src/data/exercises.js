// Push / Pull / Legs split — 6 days on, 1 rest
// A sessions = strength focus (heavy, low reps)
// B sessions = volume focus (moderate, higher reps)

export const CARDIO = {
  title: 'Morning Cardio',
  time: '6:00 – 7:00 AM',
  duration: '20–30 min',
  zone: 'Zone 2 — conversational pace, 60–70% max HR',
  why: 'Fasted Zone 2 training maximises fat oxidation, builds aerobic base, and floods your brain with BDNF before your workday starts.',
  options: [
    { name: 'Outdoor Run',     icon: '🏃', tip: 'Slow enough to hold a conversation. If you\'re panting, slow down.' },
    { name: 'Cycling',         icon: '🚴', tip: 'Steady state on flat roads or trainer. Easy gear, high cadence.' },
    { name: 'Jump Rope',       icon: '🪢', tip: '5 × 3 min rounds with 1 min rest. Builds coordination + cardio.' },
    { name: 'Rowing Machine',  icon: '🚣', tip: 'Focus on leg drive. Track 500m split — keep it consistent.' },
    { name: 'Brisk Walk',      icon: '🚶', tip: 'On rest days. 20–30 min, good posture, arms swinging.' },
  ],
}

export const PPL = {
  Push: {
    A: {
      subtitle: 'Strength Focus',
      tip: 'Go heavy. These sets should feel like a 7–8/10 effort. Rest fully between compound lifts.',
      exercises: [
        { id: 'bp',  name: 'Barbell Bench Press',     sets: 4, reps: '5',     muscle: 'Chest',       tip: 'Arch slightly, feet flat. Tuck elbows at 45°. Rest 3–4 min.' },
        { id: 'ohp', name: 'Overhead Press',          sets: 4, reps: '5',     muscle: 'Shoulders',   tip: 'Standing, strict — no leg drive. Bar travels in a straight line. Rest 3 min.' },
        { id: 'idp', name: 'Incline DB Press',        sets: 3, reps: '8–10',  muscle: 'Upper Chest', tip: '30–45° incline. Full stretch at bottom, squeeze at top. Rest 90 s.' },
        { id: 'lr',  name: 'Lateral Raises',          sets: 4, reps: '12–15', muscle: 'Side Delts',  tip: 'Lead with elbows, slight forward lean. Slow 3s negative. Rest 60 s.' },
        { id: 'burp', name: 'Burpees',                 sets: 3, reps: '10–12', muscle: 'Full Body',   tip: 'Chest to floor on the way down, full lock-out press-up, then explosive jump and clap overhead. Scale with half-burpees (no jump) if needed.' },
        { id: 'ote', name: 'Overhead Tricep Extension', sets: 3, reps: '12', muscle: 'Long Head',   tip: 'Cable or EZ bar. Full stretch at bottom for long-head recruitment.' },
      ],
    },
    B: {
      subtitle: 'Volume Focus',
      tip: 'Moderate weight, higher reps. Chase the pump. Mind-muscle connection over ego.',
      exercises: [
        { id: 'dbp', name: 'DB Bench Press',          sets: 4, reps: '10–12', muscle: 'Chest',       tip: 'Wider ROM than barbell. Slow negative, explosive press.' },
        { id: 'arp', name: 'Arnold Press',            sets: 3, reps: '10–12', muscle: 'Shoulders',   tip: 'Rotate through full ROM. Hits all three delt heads.' },
        { id: 'fly', name: 'Cable Chest Fly',         sets: 3, reps: '12–15', muscle: 'Chest',       tip: 'Cross hands at peak. Constant cable tension beats dumbbells here.' },
        { id: 'lr2', name: 'Lateral Raises',          sets: 4, reps: '15–20', muscle: 'Side Delts',  tip: 'Drop set on last set — do 20, drop weight, do 15 more without rest.' },
        { id: 'tpd', name: 'Tricep Pushdowns',        sets: 4, reps: '15',    muscle: 'Triceps',     tip: 'Straight bar cable. Keep elbows pinned to sides. Full extension.' },
        { id: 'cgb', name: 'Close-Grip Bench Press',  sets: 3, reps: '12',    muscle: 'Triceps',     tip: 'Elbows tucked in. This is a tricep exercise, not a chest one.' },
      ],
    },
  },

  Pull: {
    A: {
      subtitle: 'Strength Focus',
      tip: 'Brace your core on every lift. Deadlift is the priority — treat everything after as accessory work.',
      exercises: [
        { id: 'dl',  name: 'Deadlift',                sets: 4, reps: '5',     muscle: 'Full Back',   tip: 'Bar over mid-foot, hinge don\'t squat. Drive floor away. Rest 4 min.' },
        { id: 'wpu', name: 'Weighted Pull-Ups',       sets: 4, reps: '6–8',   muscle: 'Lats',        tip: 'Use dip belt if bodyweight is easy. Full hang at bottom. Rest 3 min.' },
        { id: 'bbr', name: 'Barbell Bent-Over Row',   sets: 4, reps: '6–8',   muscle: 'Mid Back',    tip: 'Overhand grip, 45° torso. Pull to lower chest. Rest 2 min.' },
        { id: 'fp',  name: 'Face Pulls',              sets: 3, reps: '15',    muscle: 'Rear Delts',  tip: 'Cable at face height. Externally rotate at peak. Crucial for shoulder health.' },
        { id: 'bc',  name: 'Barbell Curl',            sets: 3, reps: '8–10',  muscle: 'Biceps',      tip: 'Slow 3s eccentric. No swinging. Supinate at top.' },
        { id: 'hc',  name: 'Hammer Curl',             sets: 3, reps: '10–12', muscle: 'Brachialis',  tip: 'Neutral grip. Targets brachialis — adds thickness under biceps.' },
      ],
    },
    B: {
      subtitle: 'Volume Focus',
      tip: 'Focus on lat stretch and contraction. Squeeze every rep at peak. Chase the back pump.',
      exercises: [
        { id: 'rdl', name: 'Romanian Deadlift',       sets: 4, reps: '10–12', muscle: 'Hamstrings',  tip: 'Hip hinge. Feel the stretch in hamstrings. Keep back flat. Slow negative.' },
        { id: 'lpd', name: 'Lat Pulldown',            sets: 4, reps: '12',    muscle: 'Lats',        tip: 'Full stretch at top — let the bar pull you up. Pull to upper chest.' },
        { id: 'scr', name: 'Seated Cable Row',        sets: 4, reps: '12–15', muscle: 'Mid Back',    tip: 'Chest out, slight arch. Drive elbows back, not biceps.' },
        { id: 'sdr', name: 'Single-Arm DB Row',       sets: 3, reps: '12 ea', muscle: 'Lats',        tip: 'Brace on bench. Let weight drop fully. Row to hip, not armpit.' },
        { id: 'rf',  name: 'Reverse Pec Deck',        sets: 3, reps: '15',    muscle: 'Rear Delts',  tip: 'Light weight, squeeze hard at peak. Neglected muscle that matters a lot.' },
        { id: 'idc', name: 'Incline DB Curl',         sets: 3, reps: '12–15', muscle: 'Biceps',      tip: 'Elbows behind body = maximum long-head stretch. Full ROM.' },
      ],
    },
  },

  Legs: {
    A: {
      subtitle: 'Strength Focus',
      tip: 'Squats first, always. Everything after is to reinforce the squat pattern and hit what squats miss.',
      exercises: [
        { id: 'sq',  name: 'Back Squat',              sets: 5, reps: '5',     muscle: 'Quads/Glutes', tip: 'Depth: hip crease below knee. Brace 360°, drive knees out. Rest 4 min.' },
        { id: 'rdl2',name: 'Romanian Deadlift',       sets: 4, reps: '8',     muscle: 'Hamstrings',   tip: 'Hip hinge. Feel the stretch. Lighter than Pull day RDL — quality over weight.' },
        { id: 'lp',  name: 'Leg Press',               sets: 3, reps: '10–12', muscle: 'Quads',        tip: 'High foot placement = more glutes. Don\'t lock out at top.' },
        { id: 'wl',  name: 'Walking Lunges',          sets: 3, reps: '12 ea', muscle: 'Glutes/Quads', tip: 'Knee touches floor. Step through, don\'t rock back. Add DBs when easy.' },
        { id: 'lc',  name: 'Leg Curl',                sets: 3, reps: '12–15', muscle: 'Hamstrings',   tip: 'Machine. Controlled negative. Toes pointed slightly in for more biceps femoris.' },
        { id: 'cr',  name: 'Standing Calf Raise',     sets: 4, reps: '15–20', muscle: 'Calves',       tip: '3s hold at top. Full stretch at bottom. Calves need volume and range.' },
      ],
    },
    B: {
      subtitle: 'Volume Focus',
      tip: 'Quad-dominant today. Bulgarian split squats will humble you. Do them anyway.',
      exercises: [
        { id: 'hsq', name: 'Hack Squat / Front Squat', sets: 4, reps: '10–12', muscle: 'Quads',      tip: 'Upright torso = more quad. Hack squat machine or goblet squat works too.' },
        { id: 'bss', name: 'Bulgarian Split Squat',   sets: 3, reps: '10 ea',  muscle: 'Glutes',      tip: 'Rear foot elevated. Front foot out. Most hated, most effective glute exercise.' },
        { id: 'le',  name: 'Leg Extension',           sets: 4, reps: '15',     muscle: 'Quads',       tip: 'Machine. Slow 3s negative. 1s hold at peak. Don\'t slam the weight down.' },
        { id: 'llc', name: 'Lying Leg Curl',          sets: 4, reps: '12–15',  muscle: 'Hamstrings',  tip: 'Toes slightly pointed. Full ROM — don\'t cheat the stretch.' },
        { id: 'ht',  name: 'Hip Thrust',              sets: 3, reps: '15',     muscle: 'Glutes',      tip: 'Barbell across hips. Drive through heels. 2s squeeze at full extension.' },
        { id: 'scr2',name: 'Seated Calf Raise',       sets: 4, reps: '20',     muscle: 'Soleus',      tip: '2s hold at top. Soleus (seated) responds better to higher reps than gastrocnemius.' },
      ],
    },
  },
}

// Monday=1, Tuesday=2, ... Sunday=0
export const WEEKLY_SCHEDULE = {
  1: { type: 'Push', variant: 'A' },
  2: { type: 'Pull', variant: 'A' },
  3: { type: 'Legs', variant: 'A' },
  4: { type: 'Push', variant: 'B' },
  5: { type: 'Pull', variant: 'B' },
  6: { type: 'Legs', variant: 'B' },
  0: { type: 'Rest', variant: null },
}

export const TYPE_COLORS = {
  Push: { accent: '#f97316', dim: 'rgba(249,115,22,.12)', border: 'rgba(249,115,22,.25)' },
  Pull: { accent: '#a78bfa', dim: 'rgba(167,139,250,.12)', border: 'rgba(167,139,250,.25)' },
  Legs: { accent: '#22c55e', dim: 'rgba(34,197,94,.12)',   border: 'rgba(34,197,94,.25)'   },
  Rest: { accent: '#8b8ba8', dim: 'rgba(139,139,168,.08)', border: 'rgba(139,139,168,.2)'  },
}
