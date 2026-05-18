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

create table public.water_log (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  date       date        not null,
  glasses    integer     not null default 0 check (glasses >= 0 and glasses <= 12),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index habits_user_id_idx        on public.habits(user_id);
create index daily_records_user_idx    on public.daily_records(user_id, date);
create index daily_records_habit_idx   on public.daily_records(habit_id);
create index water_log_user_date_idx   on public.water_log(user_id, date);

-- ── Row Level Security ───────────────────────────────────────────────────────

alter table public.habits       enable row level security;
alter table public.daily_records enable row level security;
alter table public.water_log    enable row level security;

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
