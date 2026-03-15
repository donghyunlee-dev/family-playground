# Game Room Protocol

## Overview

Game Room is the core coordination unit of the multiplayer system.

Players do not directly start games.

They must first create or join a **Game Room**.

A room manages:

- game type
- player membership
- game lifecycle
- realtime communication

---

## Room Lifecycle

Room states:

- waiting
- playing
- finished

State transitions:

waiting → playing → finished

---

## Room Creation

When a user creates a room:

1. user selects a game
2. room record is created in database
3. host user becomes room owner

Room properties:

- room_id
- game_id
- host_user_id
- status
- created_at

Current operating rules:

- each game may have only one active room at a time
- if a room already exists for that game, other users must join it instead of creating another one
- a user who is already inside an active room must stay in that room until leaving it

---

## Room Capacity

Each game defines its own player limits.

Example:

Memory Card Game

min_players = 1

max_players = 4

Word Chain Game

min_players = 2

max_players = 4

Room creation must respect these limits.

---

## Joining a Room

A player can join a room if:

- room status = waiting
- room capacity not exceeded
- the player is not already inside another active room

Process:

1. insert record into room_players
2. broadcast player_join event
3. update room presence

---

## Leaving a Room

If a player leaves:

1. remove player from room_players
2. broadcast player_leave event

If host leaves:

host must transfer to another player.

If no players remain:

room is automatically closed.

If players remain after a finished session:

- the room stays alive
- the room returns to waiting state
- the same room may start another session later

---

## Starting a Game

Only the host can start a game.

Requirements:

- minimum players reached
- room status = waiting

Steps:

1. room status → playing
2. game session created
3. initial game state generated
4. broadcast game_start event

---

## Ending a Game

When the game finishes:

1. game result calculated
2. scores stored
3. session is closed
4. if players remain, room status → waiting
5. if no players remain, room status → finished
4. broadcast game_end event

---

## Room Reuse

Finished rooms may allow:

- restart game
- create new session

If restart:

status → waiting

# Game Room Protocol

## Overview

Game Room is the core coordination unit of the multiplayer system.

Players do not directly start games.

They must first create or join a **Game Room**.

A room manages:

- game type
- player membership
- game lifecycle
- realtime communication

---

## Room Lifecycle

Room states:

- waiting
- playing
- finished

State transitions:

waiting → playing → finished

---

## Room Creation

When a user creates a room:

1. user selects a game
2. room record is created in database
3. host user becomes room owner

Room properties:

- room_id
- game_id
- host_user_id
- status
- created_at

---

## Room Capacity

Each game defines its own player limits.

Example:

Memory Card Game

min_players = 1

max_players = 4

Word Chain Game

min_players = 2

max_players = 4

Room creation must respect these limits.

---

## Joining a Room

A player can join a room if:

- room status = waiting
- room capacity not exceeded

Process:

1. insert record into room_players
2. broadcast player_join event
3. update room presence

---

## Leaving a Room

If a player leaves:

1. remove player from room_players
2. broadcast player_leave event

If host leaves:

host must transfer to another player.

If no players remain:

room is automatically closed.

---

## Starting a Game

Only the host can start a game.

Requirements:

- minimum players reached
- room status = waiting

Steps:

1. room status → playing
2. game session created
3. initial game state generated
4. broadcast game_start event

---

## Ending a Game

When the game finishes:

1. game result calculated
2. scores stored
3. room status → finished
4. broadcast game_end event

---

## Room Reuse

Finished rooms may allow:

- restart game
- create new session

If restart:

status → waiting
