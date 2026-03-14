# Family Playground Data Specification

## Overview

All persistent data is stored in Supabase PostgreSQL.

Tables are designed for:

- user management
- game catalog
- game sessions
- scoring
- leaderboard

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

---

# Table: family_members

Family group membership.

Columns:

id (uuid)
user_id (uuid)
role (text)
joined_at (timestamp)

Roles:

admin
member

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

---

# Table: game_rooms

Game room information.

Columns:

id (uuid)
game_id (uuid)
host_user_id (uuid)
status (text)
created_at (timestamp)

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

---

# Table: game_sessions

Game match sessions.

Columns:

id (uuid)
room_id (uuid)
game_id (uuid)
started_at (timestamp)
ended_at (timestamp)

---

# Table: game_scores

Score results.

Columns:

id (uuid)
session_id (uuid)
user_id (uuid)
score (integer)
rank (integer)

---

# Table: score_history

Score history records.

Columns:

id (uuid)
user_id (uuid)
game_id (uuid)
score_delta (integer)
created_at (timestamp)

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
