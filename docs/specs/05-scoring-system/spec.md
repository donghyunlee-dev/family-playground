# Phase 05 Spec

## Scope

This phase covers score persistence and family ranking.

## Functional Requirements

- persist scores for each game
- maintain family leaderboard
- maintain per-game ranking where applicable
- store score history and recent match results
- maintain cumulative family points independently from raw game scores
- support future games through the same scoring pipeline
- keep the platform point award fixed at `+1`
- let each game define its own success condition for awarding the platform point

## Data Areas

- `game_sessions`
- `game_scores`
- `score_history`
- `profiles.total_score`
- `profiles.games_played`

## UI Requirements

- `/ranking` shows rank, player name, total score, and games played
- `/profile` shows recent matches
