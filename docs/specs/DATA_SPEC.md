# Family Playground Data Specification

## Overview

All persistent data is stored in Supabase PostgreSQL.

Tables are designed for:

- user management
- game catalog
- game sessions
- scoring
- leaderboard

Data design must also support:

- family-only access control
- durable authenticated sessions
- future game additions without schema redesign
- deterministic score and session history
- a maximum of 4 family members
- one active room per game
- one active room membership per user

---

# Table: profiles

User profile information.

Columns:

id (uuid, primary key)
email (text)
display_name (text)
avatar_url (text)
created_at (timestamp)
total_score (integer)
games_played (integer)
last_seen_at (timestamp)
is_active (boolean)

Rules:

- `id` must match the Supabase Auth user id
- `total_score` should default to 0
- `games_played` should default to 0

---

# Table: family_members

Family group membership.

Columns:

id (uuid)
user_id (uuid)
role (text)
joined_at (timestamp)
is_allowed (boolean)
invited_by (uuid)

Roles:

admin
member

Rules:

- only users with `is_allowed = true` may use protected platform features
- this table acts as the family allowlist
- at least one family member should have the `admin` role

---

# Table: games

Game catalog.

Columns:

id (uuid)
game_key (text)
title (text)
description (text)
thumbnail_url (text)
min_players (integer)
max_players (integer)
enabled (boolean)
sort_order (integer)

---

# Table: game_rooms

Game room information.

Columns:

id (uuid)
game_id (uuid)
host_user_id (uuid)
status (text)
created_at (timestamp)
updated_at (timestamp)
current_session_id (uuid)

Statuses:

waiting
playing
finished

---

# Table: room_players

Players inside a room.

Columns:

id (uuid)
room_id (uuid)
user_id (uuid)
joined_at (timestamp)
is_host (boolean)
presence_status (text)
left_at (timestamp)

Presence statuses:

online
away
offline

---

# Table: game_sessions

Game match sessions.

Columns:

id (uuid)
room_id (uuid)
game_id (uuid)
started_at (timestamp)
ended_at (timestamp)
status (text)
result_payload (jsonb)

Statuses:

created
in_progress
completed
abandoned

---

# Table: game_scores

Score results.

Columns:

id (uuid)
session_id (uuid)
user_id (uuid)
score (integer)
rank (integer)
awarded_points (integer)
created_at (timestamp)

---

# Table: score_history

Score history records.

Columns:

id (uuid)
user_id (uuid)
game_id (uuid)
score_delta (integer)
created_at (timestamp)
reason (text)
session_id (uuid)
running_total (integer)

---

# Table: game_assets

Game resource metadata.

Columns:

id (uuid)
game_id (uuid)
asset_type (text)
url (text)
created_at (timestamp)

Asset types:

thumbnail
puzzle_image
hidden_object_image

---

# Session and Access Policy

Authentication must use Supabase Auth with Google OAuth only.

Platform access rules:

- successful Google login alone is not enough
- the authenticated user must also exist in `family_members`
- unauthorized users must be blocked from protected routes

Current operating decision:

- this platform is shared only with one family group
- the first rollout will onboard up to 4 family members directly through Google login
- initial admin handling may be managed manually during setup

Session persistence requirements:

- the app must restore the user session on refresh and return visits
- protected pages must redirect unauthenticated users to `/login`
- profile bootstrap must be safe to run repeatedly

---

# Scoring Policy

Platform points are separate from raw in-game scores.

Requirements:

- each completed game session must store per-game result rows
- each point change must produce a `score_history` row
- `profiles.total_score` and `profiles.games_played` must stay in sync with session results
- future games must be able to use the same scoring pipeline

Recommended baseline:

- platform point award is always `+1`
- the condition for receiving that `+1` is defined by each game independently
- some games may award only the winner
- some games may award all successful players

---

# Recommended Constraints

- unique `family_members.user_id`
- unique `games.game_key`
- one active player membership per user per room
- one score row per user per completed session
- indexes for room status, room players, session scores, and score history lookup
