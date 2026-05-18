-- HabitFlow schema
-- Run this in your Supabase SQL editor (Dashboard > SQL Editor > New query)

-- ── Tables ──────────────────────────────────────────────────────────────────

create table public.habits (
  id          text        primary key,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null,
  description text        not null default '',
  time        text        not null default '',
  position    integer     not null default 0,
  created_at  timestamptz not null default now()
);

create table public.daily_records (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  habit_id   text        not null references public.habits(id) on delete cascade,
  date       date        not null,
  created_at timestamptz not null default now(),
  unique (user_id, habit_id, date)
);

create table public.todos (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  text       text        not null,
  done       boolean     not null default false,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  title        text        not null,
  description  text        not null default '',
  links        jsonb       not null default '[]',
  scope        text        not null default 'short_term',
  type         text        not null default 'one_time',
  recur_freq   text,
  status       text        not null default 'pending',
  position     integer     not null default 0,
  completed_at timestamptz,
  created_at   timestamptz not null default now()
);

create table public.task_history (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  task_id      uuid        references public.tasks(id) on delete set null,
  title        text        not null,
  scope        text        not null,
  completed_at date        not null,
  created_at   timestamptz not null default now()
);

create table public.water_log (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  date       date        not null,
  glasses    integer     not null default 0 check (glasses >= 0 and glasses <= 12),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index todos_user_id_idx         on public.todos(user_id, created_at);
create index tasks_user_scope_idx      on public.tasks(user_id, scope, position);
create index task_history_user_idx     on public.task_history(user_id, completed_at desc);
create index habits_user_id_idx        on public.habits(user_id);
create index daily_records_user_idx    on public.daily_records(user_id, date);
create index daily_records_habit_idx   on public.daily_records(habit_id);
create index water_log_user_date_idx   on public.water_log(user_id, date);

-- ── Row Level Security ───────────────────────────────────────────────────────

alter table public.todos         enable row level security;
alter table public.tasks         enable row level security;
alter table public.task_history  enable row level security;
alter table public.habits       enable row level security;
alter table public.daily_records enable row level security;
alter table public.water_log    enable row level security;

-- todos
create policy "todos: own rows only"
  on public.todos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- tasks
create policy "tasks: own rows only"
  on public.tasks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "task_history: own rows only"
  on public.task_history for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- habits
create policy "habits: own rows only"
  on public.habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- daily_records
create policy "daily_records: own rows only"
  on public.daily_records for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- water_log
create policy "water_log: own rows only"
  on public.water_log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
