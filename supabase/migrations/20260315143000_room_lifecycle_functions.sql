create or replace function public.create_game_room(
  p_game_id uuid,
  p_host_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room_id uuid;
begin
  if exists (
    select 1
    from public.room_players
    where user_id = p_host_user_id
      and left_at is null
  ) then
    raise exception 'user already has an active room';
  end if;

  if exists (
    select 1
    from public.game_rooms
    where game_id = p_game_id
      and status in ('waiting', 'playing')
  ) then
    raise exception 'game already has an active room';
  end if;

  if not exists (
    select 1
    from public.games
    where id = p_game_id
      and enabled = true
  ) then
    raise exception 'game is not enabled';
  end if;

  insert into public.game_rooms (game_id, host_user_id, status)
  values (p_game_id, p_host_user_id, 'waiting')
  returning id into v_room_id;

  insert into public.room_players (room_id, user_id, is_host, presence_status)
  values (v_room_id, p_host_user_id, true, 'online');

  return v_room_id;
end;
$$;

create or replace function public.join_game_room(
  p_room_id uuid,
  p_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_max_players integer;
  v_player_count integer;
begin
  select r.status, g.max_players
  into v_status, v_max_players
  from public.game_rooms r
  join public.games g on g.id = r.game_id
  where r.id = p_room_id
  for update;

  if not found then
    raise exception 'room not found';
  end if;

  if v_status <> 'waiting' then
    raise exception 'only waiting rooms can be joined';
  end if;

  if exists (
    select 1
    from public.room_players
    where room_id = p_room_id
      and user_id = p_user_id
      and left_at is null
  ) then
    return p_room_id;
  end if;

  if exists (
    select 1
    from public.room_players
    where user_id = p_user_id
      and left_at is null
      and room_id <> p_room_id
  ) then
    raise exception 'user already has another active room';
  end if;

  select count(*)
  into v_player_count
  from public.room_players
  where room_id = p_room_id
    and left_at is null;

  if v_player_count >= v_max_players then
    raise exception 'room is full';
  end if;

  insert into public.room_players (room_id, user_id, is_host, presence_status)
  values (p_room_id, p_user_id, false, 'online');

  return p_room_id;
end;
$$;

create or replace function public.start_game_room_session(
  p_room_id uuid,
  p_host_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_host_user_id uuid;
  v_status text;
  v_min_players integer;
  v_game_id uuid;
  v_player_count integer;
  v_session_id uuid;
begin
  select r.host_user_id, r.status, r.game_id, g.min_players
  into v_host_user_id, v_status, v_game_id, v_min_players
  from public.game_rooms r
  join public.games g on g.id = r.game_id
  where r.id = p_room_id
  for update;

  if not found then
    raise exception 'room not found';
  end if;

  if v_host_user_id <> p_host_user_id then
    raise exception 'only the host can start the game';
  end if;

  if v_status <> 'waiting' then
    raise exception 'room is not waiting';
  end if;

  select count(*)
  into v_player_count
  from public.room_players
  where room_id = p_room_id
    and left_at is null;

  if v_player_count < v_min_players then
    raise exception 'not enough players to start';
  end if;

  insert into public.game_sessions (room_id, game_id, status)
  values (p_room_id, v_game_id, 'in_progress')
  returning id into v_session_id;

  update public.game_rooms
  set status = 'playing',
      current_session_id = v_session_id
  where id = p_room_id;

  return v_session_id;
end;
$$;

create or replace function public.finish_game_room_session(
  p_room_id uuid,
  p_host_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_host_user_id uuid;
  v_session_id uuid;
  v_player_count integer;
begin
  select host_user_id, current_session_id
  into v_host_user_id, v_session_id
  from public.game_rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'room not found';
  end if;

  if v_host_user_id <> p_host_user_id then
    raise exception 'only the host can finish the session';
  end if;

  if v_session_id is null then
    raise exception 'room does not have an active session';
  end if;

  update public.game_sessions
  set status = 'completed',
      ended_at = timezone('utc', now())
  where id = v_session_id;

  select count(*)
  into v_player_count
  from public.room_players
  where room_id = p_room_id
    and left_at is null;

  update public.game_rooms
  set status = case when v_player_count > 0 then 'waiting' else 'finished' end,
      current_session_id = null
  where id = p_room_id;

  return v_session_id;
end;
$$;

create or replace function public.leave_game_room(
  p_room_id uuid,
  p_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player_id uuid;
  v_host_user_id uuid;
  v_current_session_id uuid;
  v_next_host_user_id uuid;
  v_next_host_player_id uuid;
  v_remaining_count integer;
begin
  select host_user_id, current_session_id
  into v_host_user_id, v_current_session_id
  from public.game_rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'room not found';
  end if;

  select id
  into v_player_id
  from public.room_players
  where room_id = p_room_id
    and user_id = p_user_id
    and left_at is null
  for update;

  if not found then
    return p_room_id;
  end if;

  update public.room_players
  set left_at = timezone('utc', now()),
      presence_status = 'offline',
      is_host = false
  where id = v_player_id;

  select count(*)
  into v_remaining_count
  from public.room_players
  where room_id = p_room_id
    and left_at is null;

  if v_remaining_count = 0 then
    if v_current_session_id is not null then
      update public.game_sessions
      set status = case when status = 'completed' then status else 'abandoned' end,
          ended_at = coalesce(ended_at, timezone('utc', now()))
      where id = v_current_session_id;
    end if;

    update public.game_rooms
    set status = 'finished',
        current_session_id = null
    where id = p_room_id;

    return p_room_id;
  end if;

  if v_host_user_id = p_user_id then
    select id, user_id
    into v_next_host_player_id, v_next_host_user_id
    from public.room_players
    where room_id = p_room_id
      and left_at is null
    order by joined_at asc
    limit 1;

    update public.room_players
    set is_host = true
    where id = v_next_host_player_id;

    update public.game_rooms
    set host_user_id = v_next_host_user_id
    where id = p_room_id;
  end if;

  if v_current_session_id is null then
    update public.game_rooms
    set status = 'waiting'
    where id = p_room_id;
  end if;

  return p_room_id;
end;
$$;

grant execute on function public.create_game_room(uuid, uuid) to authenticated, service_role;
grant execute on function public.join_game_room(uuid, uuid) to authenticated, service_role;
grant execute on function public.start_game_room_session(uuid, uuid) to authenticated, service_role;
grant execute on function public.finish_game_room_session(uuid, uuid) to authenticated, service_role;
grant execute on function public.leave_game_room(uuid, uuid) to authenticated, service_role;
