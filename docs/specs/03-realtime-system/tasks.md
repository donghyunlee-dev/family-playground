# Phase 03 Tasks

## Status

In Progress

## Tasks

- [x] Finalize shared realtime message contracts and room event payload types.
- [x] Implement room channel subscribe/unsubscribe flow.
- [x] Implement presence and join/leave updates.
- [ ] Implement host start and turn/game event sync.
- [ ] Implement end-of-game and score update events.
- [ ] Verify multi-client realtime behavior.
- [ ] Write completion summary and commit/push.

## Current Result

- shared realtime payload types and a `room:{room_id}` channel helper now exist in `packages/types`
- the room page now mounts a realtime client panel that subscribes to `room:{room_id}`
- room presence is tracked through Supabase Realtime presence with browser-side refresh on sync, join, and leave
- room UI now refreshes on `room_players` and `game_rooms` postgres changes through the same room channel
- host-driven room status transitions now emit best-effort `game_start` and `game_end` broadcasts from the room client
- gameplay event broadcast, turn sync, and score update sync are still not implemented
- multi-client browser verification is still required before this phase can be closed
- realtime validation is blocked until auth/session flow is stable enough to keep multiple clients inside the same protected room routes
