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
- stable session restoration between visits within a 24-hour login window
- authenticated sessions older than 24 hours must be invalidated and sent back through login
- one active room per game
- visible room-created indicators in the game catalog
- no multi-room participation for a single user
- a waiting room host may start the game alone when the game supports single-player entry
- all launchable games must cap room size at 4 players

## UI Requirements

- `/lobby` shows profile card, ranking preview, online members, and game catalog
- `/games` lists playable games as cards with room state surfaced directly in the card UI
- `/games` must show when a room already exists for a game and offer join instead of create
- `/room/{room_id}` shows room status, players, and host controls
- `/profile` shows player information and recent matches
- the public landing and protected shell should feel like a curated App Store-style product surface rather than a plain dashboard
- the top account area should expose avatar, identity, and session actions in a polished store-style header

## Data Requirements

- use `profiles`, `games`, `game_rooms`, and `room_players`
- preserve room lifecycle: `waiting -> playing -> finished`
- use `family_members` as the application allowlist after login
