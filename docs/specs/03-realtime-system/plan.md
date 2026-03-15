# Phase 03 Plan

## Title

Realtime System

## Goal

Implement the shared realtime contract for rooms and gameplay synchronization using Supabase Realtime.

## Implementation Order

1. Finalize shared realtime message types and channel conventions.
2. Connect room presence and join/leave events.
3. Add turn and game event synchronization.
4. Add host start and game end events.
5. Validate multi-client room behavior.

## Dependencies

- completed room system from Phase 02
- Supabase Realtime enabled for required tables and channels

## Verification

- multi-client manual tests
- event payload validation
- reconnect/resubscribe smoke tests

## Exit Criteria

- room channels follow `room:{room_id}`
- join/leave, start, turn, game, end, and score events are synchronized
- invalid events are handled safely
