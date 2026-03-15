create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key,
  email text not null unique,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  total_score integer not null default 0,
  games_played integer not null default 0,
  last_seen_at timestamptz,
  is_active boolean not null default true
);

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  user_id uuid unique,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default timezone('utc', now()),
  is_allowed boolean not null default true,
  invited_by uuid
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  game_key text not null unique,
  title text not null,
  description text not null,
  thumbnail_url text,
  min_players integer not null check (min_players > 0),
  max_players integer not null check (max_players >= min_players),
  enabled boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.game_rooms (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  host_user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  current_session_id uuid
);

create table if not exists public.room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default timezone('utc', now()),
  is_host boolean not null default false,
  presence_status text not null default 'online' check (presence_status in ('online', 'away', 'offline')),
  left_at timestamptz
);

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  started_at timestamptz not null default timezone('utc', now()),
  ended_at timestamptz,
  status text not null default 'created' check (status in ('created', 'in_progress', 'completed', 'abandoned')),
  result_payload jsonb
);

alter table public.game_rooms
  add constraint game_rooms_current_session_id_fkey
  foreign key (current_session_id) references public.game_sessions(id) on delete set null;

create table if not exists public.game_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null default 0,
  rank integer,
  awarded_points integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  unique (session_id, user_id)
);

create table if not exists public.score_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  score_delta integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  reason text not null,
  session_id uuid references public.game_sessions(id) on delete set null,
  running_total integer not null
);

create table if not exists public.game_assets (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  asset_type text not null,
  url text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists room_players_active_unique_idx
  on public.room_players (room_id, user_id)
  where left_at is null;

create index if not exists game_rooms_status_idx on public.game_rooms (status);
create index if not exists room_players_room_id_idx on public.room_players (room_id);
create index if not exists game_scores_session_id_idx on public.game_scores (session_id);
create index if not exists score_history_user_created_at_idx on public.score_history (user_id, created_at desc);

drop trigger if exists set_game_rooms_updated_at on public.game_rooms;
create trigger set_game_rooms_updated_at
before update on public.game_rooms
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.family_members enable row level security;
alter table public.games enable row level security;
alter table public.game_rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.game_sessions enable row level security;
alter table public.game_scores enable row level security;
alter table public.score_history enable row level security;
alter table public.game_assets enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "family_members_select_self_or_email" on public.family_members;
create policy "family_members_select_self_or_email"
on public.family_members
for select
to authenticated
using (
  auth.uid() = user_id
  or lower(auth.jwt() ->> 'email') = lower(email)
);

drop policy if exists "games_select_authenticated" on public.games;
create policy "games_select_authenticated"
on public.games
for select
to authenticated
using (true);

drop policy if exists "game_rooms_select_authenticated" on public.game_rooms;
create policy "game_rooms_select_authenticated"
on public.game_rooms
for select
to authenticated
using (true);

drop policy if exists "room_players_select_authenticated" on public.room_players;
create policy "room_players_select_authenticated"
on public.room_players
for select
to authenticated
using (true);

drop policy if exists "game_sessions_select_authenticated" on public.game_sessions;
create policy "game_sessions_select_authenticated"
on public.game_sessions
for select
to authenticated
using (true);

drop policy if exists "game_scores_select_authenticated" on public.game_scores;
create policy "game_scores_select_authenticated"
on public.game_scores
for select
to authenticated
using (true);

drop policy if exists "score_history_select_authenticated" on public.score_history;
create policy "score_history_select_authenticated"
on public.score_history
for select
to authenticated
using (true);

drop policy if exists "game_assets_select_authenticated" on public.game_assets;
create policy "game_assets_select_authenticated"
on public.game_assets
for select
to authenticated
using (true);

insert into public.games (game_key, title, description, min_players, max_players, enabled, sort_order)
values
  ('memory-card', 'Memory Card', 'Turn-based card matching for 2 to 4 players.', 2, 4, true, 10),
  ('word-chain', 'Word Chain', 'Realtime word relay with deterministic event handling.', 2, 8, true, 20),
  ('ladder', 'Ladder', 'Random ladder selection for quick family decisions.', 1, 8, false, 30),
  ('spot-diff', 'Spot the Difference', 'Find visual differences together in timed rounds.', 1, 4, false, 40),
  ('hidden-object', 'Hidden Object', 'Search for hidden items inside a shared scene.', 1, 4, false, 50),
  ('yut', 'Yut', 'Traditional Yut board gameplay for the family.', 2, 4, false, 60)
on conflict (game_key) do update
set
  title = excluded.title,
  description = excluded.description,
  min_players = excluded.min_players,
  max_players = excluded.max_players,
  enabled = excluded.enabled,
  sort_order = excluded.sort_order;
