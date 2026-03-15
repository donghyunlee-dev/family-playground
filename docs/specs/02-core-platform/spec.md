# Phase 02 Spec

## Scope

This phase covers the product hub features after the platform foundation.

## Functional Requirements

- user profile system
- game catalog
- lobby screen
- room creation
- room join system
- player presence
- authenticated protected navigation
- family-only access enforcement
- stable session restoration between visits
- one active room per game
- visible room-created indicators in the game catalog
- no multi-room participation for a single user

## UI Requirements

- `/lobby` shows profile card, ranking preview, online members, and game catalog
- `/games` lists playable games as cards
- `/games` must show when a room already exists for a game and offer join instead of create
- `/room/{room_id}` shows room status, players, and host controls
- `/profile` shows player information and recent matches

## Data Requirements

- use `profiles`, `games`, `game_rooms`, and `room_players`
- preserve room lifecycle: `waiting -> playing -> finished`
- use `family_members` as the application allowlist after login
