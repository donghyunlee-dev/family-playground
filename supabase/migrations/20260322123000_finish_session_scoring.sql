drop function if exists public.finish_game_room_session(uuid, uuid);

create or replace function public.finish_game_room_session(
  p_room_id uuid,
  p_host_user_id uuid,
  p_session_id uuid,
  p_result_payload jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_host_user_id uuid;
  v_current_session_id uuid;
  v_game_id uuid;
  v_session_status text;
  v_session_result_payload jsonb;
  v_player_count integer;
  v_result record;
  v_running_total integer;
begin
  if p_result_payload is null or jsonb_typeof(p_result_payload) <> 'object' then
    raise exception 'missing result payload';
  end if;

  if coalesce(jsonb_typeof(p_result_payload->'results'), 'null') <> 'array' then
    raise exception 'missing result rows';
  end if;

  select host_user_id, current_session_id
  into v_host_user_id, v_current_session_id
  from public.game_rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'room not found';
  end if;

  if v_host_user_id <> p_host_user_id then
    raise exception 'only the host can finish the session';
  end if;

  select game_id, status, result_payload
  into v_game_id, v_session_status, v_session_result_payload
  from public.game_sessions
  where id = p_session_id
    and room_id = p_room_id
  for update;

  if not found then
    raise exception 'session not found';
  end if;

  if v_session_status = 'completed' and v_session_result_payload is not null then
    return p_session_id;
  end if;

  if v_current_session_id is distinct from p_session_id then
    raise exception 'session is not active for room';
  end if;

  if v_session_status <> 'in_progress' then
    raise exception 'session is not in progress';
  end if;

  if not exists (
    select 1
    from jsonb_array_elements(p_result_payload->'results')
  ) then
    raise exception 'missing result rows';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_result_payload->'results') result
    group by result->>'player_id'
    having count(*) > 1
  ) then
    raise exception 'duplicate player results';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_result_payload->'results') result
    left join public.room_players player
      on player.room_id = p_room_id
     and player.user_id = (result->>'player_id')::uuid
    where player.id is null
  ) then
    raise exception 'result contains invalid player';
  end if;

  update public.game_sessions
  set result_payload =
        p_result_payload ||
        jsonb_build_object('persisted_at', timezone('utc', now())),
      status = 'completed',
      ended_at = timezone('utc', now())
  where id = p_session_id;

  insert into public.game_scores (
    session_id,
    user_id,
    score,
    rank,
    awarded_points
  )
  select
    p_session_id,
    (result->>'player_id')::uuid,
    (result->>'score')::integer,
    (result->>'rank')::integer,
    coalesce((result->>'awarded_points')::integer, 0)
  from jsonb_array_elements(p_result_payload->'results') result;

  for v_result in
    select
      (result->>'player_id')::uuid as user_id,
      (result->>'score')::integer as score,
      (result->>'rank')::integer as rank,
      coalesce((result->>'awarded_points')::integer, 0) as awarded_points
    from jsonb_array_elements(p_result_payload->'results') result
    order by
      (result->>'rank')::integer asc,
      (result->>'score')::integer desc,
      (result->>'player_id') asc
  loop
    select total_score + v_result.awarded_points
    into v_running_total
    from public.profiles
    where id = v_result.user_id
    for update;

    if v_running_total is null then
      raise exception 'profile not found for result player';
    end if;

    insert into public.score_history (
      user_id,
      game_id,
      score_delta,
      reason,
      session_id,
      running_total
    )
    values (
      v_result.user_id,
      v_game_id,
      v_result.awarded_points,
      'session_completed',
      p_session_id,
      v_running_total
    );

    update public.profiles
    set total_score = v_running_total,
        games_played = games_played + 1
    where id = v_result.user_id;
  end loop;

  select count(*)
  into v_player_count
  from public.room_players
  where room_id = p_room_id
    and left_at is null;

  update public.game_rooms
  set status = case when v_player_count > 0 then 'waiting' else 'finished' end,
      current_session_id = null
  where id = p_room_id;

  return p_session_id;
end;
$$;

grant execute on function public.finish_game_room_session(uuid, uuid, uuid, jsonb) to authenticated, service_role;
