# Phase 03 Spec

## Scope

This phase covers realtime room and gameplay synchronization.

## Required Event Types

- `player_join`
- `player_leave`
- `game_start`
- `turn_update`
- `game_event`
- `game_end`
- `score_update`

## Message Shape

- `event_type`
- `room_id`
- `user_id`
- `payload`
- `timestamp`

## Channel Rule

- use `room:{room_id}` for room-level realtime traffic

## Reliability Requirements

- clients must handle invalid events gracefully
- realtime failures must not break the room UI
