create unique index if not exists game_rooms_active_game_unique_idx
  on public.game_rooms (game_id)
  where status in ('waiting', 'playing');

create unique index if not exists room_players_active_user_unique_idx
  on public.room_players (user_id)
  where left_at is null;
