# Realtime Event Specification

## Overview

Realtime communication enables multiplayer gameplay.

Events are delivered through Supabase Realtime channels.

Channel format:

room:{room_id}

Example:

room:1234

---

## Event Structure

All realtime messages must follow this structure.

event_type

room_id

user_id

payload

timestamp

Example:

{

"event_type": "player_join",

"room_id": "room123",

"user_id": "user456",

"payload": {},

"timestamp": "2025-01-01T10:00:00Z"

}

---

## Standard Events

### player_join

Triggered when a player enters a room.

Payload:

player_id

display_name

---

### player_leave

Triggered when a player leaves a room.

Payload:

player_id

---

### game_start

Triggered when host starts a game.

Payload:

game_id

session_id

---

### turn_update

Triggered when player turn changes.

Payload:

player_id

---

### game_event

Generic gameplay event.

Examples:

- card_flip
- word_submit
- piece_move
- object_found

Payload format depends on game.

---

### score_update

Triggered when player score changes.

Payload:

user_id

score_delta

new_total_score

---

### game_end

Triggered when game finishes.

Payload:

results

Example:

[

{ player_id, score, rank }

]

---

## Presence Events

Presence tracks active players in a room.

Presence data:

user_id

display_name

status

Status:

- online
- away
