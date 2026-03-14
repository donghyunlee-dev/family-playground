
# Family Playground Architecture

## System Overview## System Overvie
Family Playground is a web-based multiplayer game platform designed for a small group (family).

The architecture is based on a modern web stack with a TypeScript monorepo and Supabase backend services.

Main characteristics:

- Web-based multiplayer games
- Google OAuth authentication
- Real-time gameplay
- Modular game architecture
- Expandable game ecosystem

---

# High Level Architecture

System components:

Frontend Application
Backend Platform
Realtime System
Database
Storage

Architecture diagram:

Client Browser
│
│ HTTPS
▼
Next.js Web App (Vercel)
│
│ Supabase SDK
▼
Supabase Platform
├ Auth
├ PostgreSQL
├ Realtime
├ Storage
└ Edge Functions

---

# Monorepo Architecture

The project uses a TypeScript monorepo managed by Turborepo.

Repository layout:

family-playground/

apps/
web/
admin/

packages/
ui/
types/
supabase-client/
game-engine/

game-word-chain/
game-memory-card/
game-ladder/
game-spot-diff/
game-hidden-object/
game-yut/

supabase/
migrations/
functions/

docs/

---

# Application Layer

## Web Application

Framework:
Next.js

Responsibilities:

- UI rendering
- game interface
- lobby system
- player interaction
- realtime event handling

---

## Supabase Platform

Supabase provides backend services.

Services used:

Auth
PostgreSQL
Realtime
Storage
Edge Functions

Responsibilities:

- authentication
- user data
- game data persistence
- realtime events
- asset storage

---

# Realtime Communication

Realtime communication is required for multiplayer gameplay.

Realtime responsibilities:

- player presence
- room membership
- turn updates
- gameplay events
- score updates

Supabase Realtime channels will be used.

Example channel structure:

room:{room_id}

Example events:

player_join
player_leave
turn_update
game_event
game_end

---

# Game Engine Architecture

All games must follow a shared interface defined in the game-engine package.

This ensures:

- consistent lifecycle
- reusable logic
- modular game implementation

Game engine responsibilities:

- game initialization
- state management
- event processing
- result calculation

---

# Storage Architecture

Game assets are stored in Supabase Storage.

Asset types:

- thumbnails
- puzzle images
- hidden object images
- game backgrounds

Storage buckets:

game-assets
user-assets

---

# Security Model

Authentication:

Google OAuth via Supabase Auth.

Authorization:

Row Level Security (RLS) in PostgreSQL.

Users can only access:

- their own profile
- public game rooms
- rooms they joined

---

# Scalability

The system is optimized for small group gameplay.

Expected load:

- <10 concurrent users

Architecture supports scaling if needed:

- Supabase horizontal scaling
- Vercel edge deployment
