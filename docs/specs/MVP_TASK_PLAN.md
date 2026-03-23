# MVP Development Plan

## Current Baseline

As of the current implementation review:

- platform foundation is in place
- protected navigation and family allowlist checks exist
- room creation and room lifecycle RPCs exist
- waiting room and gameplay screen are split
- `word-chain` is the first active test game slice
- score persistence is not connected yet
- the highest current blocker is authentication/session stability during room entry

Current execution priority:

1. stabilize Google login and session persistence across protected room routes
2. stabilize waiting-room to gameplay navigation and realtime sync
3. finish `word-chain` as the first reliable playable multiplayer slice
4. connect score persistence and leaderboard updates
5. add the second MVP game after the first slice is stable

## Phase 1 Platform Setup

Tasks:

initialize monorepo

setup turborepo

create Next.js web app

configure Supabase project

setup authentication

create base UI layout

---

# Phase 2 Core Platform

Features:

user profile system

game catalog

game lobby

room creation

room join system

player presence

Current status:

- mostly implemented
- must be re-verified around login redirect, room entry, and one-room-per-user behavior

---

# Phase 3 Realtime System

Implement:

room realtime channel

player join/leave events

turn synchronization

game events

Current status:

- room subscription and presence foundation exist
- gameplay sync is still incomplete and must be finished against a real playable game

---

# Phase 4 First Games

Implement two games:

Memory Card Game

Word Chain Game

Game features:

game UI

game state management

score calculation

game end logic

Current status:

- `word-chain` is the active first slice
- `memory-card` has not started beyond placeholder logic
- gameplay must be verified end-to-end before expanding scope

---

# Phase 5 Scoring System

Features:

score persistence

leaderboard

score history

Current status:

- schema exists
- persistence pipeline is not implemented yet

---

# Phase 6 Platform Polish

Improvements:

UI polish

bug fixes

performance tuning

---

# MVP Completion Criteria

MVP is complete when:

users can login with Google

users can create game rooms

multiple players can join

two games are playable

scores are recorded

leaderboard works

Additional release gate:

- login must remain stable when entering `/room/{room_id}` and `/room/{room_id}/play`
- waiting room and gameplay routes must remain visually and behaviorally separated
