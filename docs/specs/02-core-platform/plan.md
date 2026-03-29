# Phase 02 Plan

## Title

Core Platform

## Goal

Implement the first complete platform flows after setup: user profiles, game catalog, lobby, room creation and join flows, and presence-aware family hub screens.

Current adjustment:

- treat `/` as the public catalog entry instead of a marketing landing page
- expose game and room visibility before login
- trigger Google OAuth only when an unauthenticated user tries to start or join a flow
- return authenticated users to `/` with session and profile state already restored
- enforce a 24-hour maximum authenticated session age before forcing sign-out
- allow single-player room start for games configured with `min_players = 1`
- normalize launchable room capacity to a 4-player maximum

## Implementation Order

1. Define data and UI requirements for profiles, games, rooms, and players.
2. Add route structure for lobby, games, room, ranking, and profile pages.
3. Implement profile loading and catalog rendering.
4. Implement room creation, room joining, and waiting-room state.
5. Verify basic multiplayer room entry and presence display.

## Dependencies

- completed Phase 01 setup
- database schema for profiles, games, rooms, and players
- Supabase auth session availability

## Verification

- route rendering tests or manual route verification
- room creation and join smoke tests
- authenticated navigation checks
- expired-session redirect checks
- single-player room start checks

## Exit Criteria

- lobby, game catalog, room entry, and profile views exist
- users can create and join rooms
- waiting-room player lists are visible
- sessions older than 24 hours are rejected
