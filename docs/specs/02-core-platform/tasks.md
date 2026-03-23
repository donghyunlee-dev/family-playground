# Phase 02 Tasks

## Status

In Progress

## Tasks

- [x] Define shared types for profiles, games, rooms, and players.
- [x] Add platform route skeletons for lobby, games, room, ranking, and profile.
- [x] Implement game catalog data flow.
- [x] Implement session restore and protected route behavior.
- [x] Enforce family allowlist access checks after login.
- [x] Implement room creation and join flow.
- [x] Enforce one active room per game and one active room per user.
- [x] Show room-created state and join actions in the game catalog.
- [x] Implement waiting-room player list and host state.
- [x] Add room leave and session finish controls for reusable rooms.
- [x] Move room lifecycle mutations into database RPC functions.
- [x] Refresh the shell and catalog UI toward an App Store-style layout.
- [x] Move the public entry flow to a visible game catalog on `/`.
- [ ] Verify authenticated navigation and room entry flow.
- [ ] Write completion summary and commit/push.

## Current Result

- public landing, login, lobby, games, and room screens have been visually refreshed
- game cards now surface active-room state and join/create behavior directly
- room lifecycle now has RPC-backed create, join, start, finish, and leave flows
- one-active-room-per-game and one-active-room-per-user rules are enforced in both schema constraints and server actions
- unauthenticated access to `/games` redirects to `/login`
- waiting room and in-game screen are now split so room setup stays on `/room/{room_id}` and gameplay moves to `/room/{room_id}/play`
- the public landing page now starts Google OAuth directly in the current window instead of forcing an extra `/login` hop
- `/` is being reshaped into the main public game catalog so users can see games and open rooms before authenticating
- authenticated end-to-end room flow still needs browser verification with a signed-in family account
- Phase 02 is functionally ahead of the original task list, but it is not fully closed until signed-in browser verification is recorded
- current blocker under active investigation: room entry can still bounce users to `/login` when the browser session is not restored consistently after Google OAuth
