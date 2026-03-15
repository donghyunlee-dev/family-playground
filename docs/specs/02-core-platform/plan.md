# Phase 02 Plan

## Title

Core Platform

## Goal

Implement the first complete platform flows after setup: user profiles, game catalog, lobby, room creation and join flows, and presence-aware family hub screens.

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

## Exit Criteria

- lobby, game catalog, room entry, and profile views exist
- users can create and join rooms
- waiting-room player lists are visible
