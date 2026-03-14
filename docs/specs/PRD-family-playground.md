playground Platform PRD

## Product Overview

Family Playground is a web-based multiplayer game platform designed for a small family group.

The platform allows family members to log in with their Google accounts and play multiple casual games together through a web interface.

The platform acts as a **game hub**, similar to a small internal app store, where multiple games can be accessed and added over time.

The system focuses on:

- Family-only access
- Casual multiplayer games
- Shared scoring and ranking
- Real-time gameplay
- Expandable game architecture

The project will be developed as a **TypeScript monorepo** and deployed as a modern web application.

---

# Product Goals

### Primary Goals

Create a web-based family game platform where:

- Family members can log in with Google accounts
- Multiple games are available from a central UI
- Players can play games simultaneously
- Game scores are tracked and compared
- New games can be added easily

### Secondary Goals

- Build the platform as a modular game ecosystem
- Enable real-time multiplayer gameplay
- Use free cloud services for infrastructure

---

# Target Users

Primary users are a **single family group of 4 members**.

Characteristics:

- Known users (not public)
- Each user has a Google account
- Small concurrent player count
- Casual gameplay sessions

---

# Core Features

## Authentication

Users must log in using **Google OAuth**.

Requirements:

- No username/password registration
- Login via Google account only
- User session must persist between visits
- User profile must be stored in database

Auth will be implemented using **Supabase Auth**.

Supabase provides built-in authentication including OAuth providers like Google and session management.

---

# User Profile System

Each authenticated user has a profile.

Stored information:

- user_id
- display_name
- avatar
- created_at
- total_score
- games_played

Profiles are stored in PostgreSQL.

---

# Game Platform

The platform behaves like a small **game hub**.

Users can:

- Browse available games
- Enter a game room
- Play with other family members
- Track scores

Games must be modular so new games can be added without modifying the platform core.

---

# Initial Game List

The following games will be implemented.

### Word Chain Game

Korean 끝말잇기 style word chain game.

Features:

- Turn-based gameplay
- Word validation
- Timer
- Scoring

---

### Spot the Difference

Players must find differences between two images.

Features:

- Click detection
- Score tracking
- Timed rounds

---

### Yut Game

Traditional Korean Yut board game.

Features:

- Turn-based board movement
- Dice (Yut sticks) result
- Piece capture
- Score tracking

---

### Memory Card Game

Classic card matching game.

Features:

- Random card shuffle
- Flip animation
- Match detection
- Player scoring

---

### Ladder Game

Random selection game for choosing options such as food.

Features:

- Random ladder generation
- Visual animation
- Result mapping

---

### Hidden Object Game

Players search for objects inside an image.

Features:

- Click detection
- Object tracking
- Score ranking

---

# Multiplayer Requirements

The system must support **simultaneous multiplayer sessions**.

Capabilities:

- Up to 4 players per game
- Real-time game state updates
- Shared game room
- Player presence tracking

Realtime synchronization will be implemented using **Supabase Realtime**.

---

# Game Room System

Players join games through **game rooms**.

Room properties:

```
room_id
game_type
host_user_id
status
players
created_at
```

Room states:

```
waiting
playing
finished
```

---

# Scoring System

Every game awards points.

Points are stored in the database.

Example scoring:

- win = +10
- second place = +5
- participation = +1

Scores are used to generate:

- family leaderboard
- player ranking

---

# Leaderboard

The system will maintain rankings based on scores.

Views:

- total score ranking
- per-game ranking
- recent match history

---

# Admin Capabilities

Basic administration features:

- enable / disable games
- upload image assets
- manage game configuration

Admin access may be limited to one family member.

---

# Platform Architecture

The project will use a **TypeScript monorepo architecture**.

A monorepo is a single repository that contains multiple applications and shared packages.

The repository will be managed using **Turborepo**.

Turborepo is a build system designed to manage JavaScript/TypeScript monorepos efficiently.

---

# Repository Structure

```
family-playground/

apps/
  web/
  admin/

packages/
  ui/
  types/
  game-engine/

  game-word-chain/
  game-memory-card/
  game-ladder/
  game-spot-diff/
  game-hidden-object/
  game-yut/

  supabase-client/

supabase/
  migrations/
  functions/

docs/
  prd/
  architecture/
```

---

# Technology Stack

## Frontend

Next.js

TypeScript

TailwindCSS

---

## Backend

Supabase platform

Services used:

- PostgreSQL
- Auth
- Realtime
- Storage
- Edge Functions

Supabase bundles database, authentication, storage, realtime features and serverless functions into one backend platform.

---

## Database

PostgreSQL (Supabase)

---

## Realtime System

Supabase Realtime will handle:

- player presence
- game state events
- room communication

---

## Storage

Game assets will be stored in Supabase Storage.

Examples:

- game thumbnails
- difference game images
- hidden object images

---

## Edge Functions

Supabase Edge Functions will handle server-side logic such as:

- score calculation
- match validation
- anti-cheat logic
- game result recording

Edge Functions are globally distributed server-side TypeScript functions.

---

# Infrastructure

Deployment strategy:

Frontend

```
Vercel
```

Backend services

```
Supabase
```

Supabase free tier supports small applications with database, auth and storage capabilities suitable for MVP applications.

Example free limits include:

- 500MB database
- 1GB file storage
- 50,000 monthly active users

This is more than sufficient for a family-scale platform.

---

# Game Engine Concept

All games must follow a shared interface.

Example concept:

```
GameDefinition

createInitialState()
applyEvent()
isGameFinished()
calculateResult()
```

This allows the platform to load games dynamically.

---

# UI Structure

Main pages

```
/
 /login
 /lobby
 /games
 /games/{game-id}
 /room/{room-id}
 /ranking
 /profile
```

---

# MVP Scope

The MVP version will include:

- Google login
- user profiles
- family leaderboard
- game lobby
- room system
- realtime player presence
- 2 playable games

Initial games for MVP:

- Memory Card Game
- Word Chain Game

---

# Post-MVP Expansion

After MVP launch the following features may be added.

Additional games

- ladder game
- spot the difference
- hidden object game
- yut game

Additional features

- achievements
- game statistics
- seasonal ranking
- admin asset management

---

# Success Metrics

Platform success is measured by:

- successful multiplayer sessions
- stable realtime gameplay
- score tracking accuracy
- ease of adding new games

---

# Risks

Potential risks include:

- realtime synchronization complexity
- game state desynchronization
- asset management complexity
- complex rule systems in some games (especially Yut)

Mitigation strategies:

- start with simple games
- build reusable game engine interfaces
- implement authoritative state logic

---

# Development Strategy

Development will proceed in phases.

Phase 1

Platform foundation

- authentication
- user profile
- game lobby
- room system

Phase 2

First playable games

- memory card game
- word chain game

Phase 3

Platform stabilization

- scoring system
- leaderboard
- realtime optimization

Phase 4

Game expansion

---

# Future Vision

Family Playground may evolve into:

- a private multiplayer game hub

- a casual social platform for small groups
- a modular game ecosystem

The long-term goal is to create a flexible platform where new games can be integrated easily without modifying the core system.
