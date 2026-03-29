update public.games
set min_players = 1,
    max_players = 4,
    description = 'Turn-based card matching for 1 to 4 players.'
where game_key = 'memory-card';

update public.games
set min_players = 1,
    max_players = 4,
    description = 'Realtime word relay with deterministic event handling for up to 4 players.'
where game_key = 'word-chain';
