Family Playground – Codex Agent Instructions# Family Playground – Codex Agent Instructions

This file provides instructions for AI coding agents working on the **Family Playground** project.

Agents must read this document before making any changes to the repository.

The purpose of this document is to ensure consistent architecture, predictable development patterns, and safe modification of the codebase.

---

# Project Overview

Family Playground is a **web-based multiplayer game platform** designed for a small group (family).

The platform allows users to:

- log in using Google accounts
- join game rooms
- play multiplayer casual games
- accumulate scores
- compare rankings

The system acts as a **mini game platform** where new games can be added modularly.

---

# Core Technology Stack

Frontend

Next.js

TypeScript

TailwindCSS

Backend Platform

Supabase

Services used:

- Supabase Auth
- Supabase PostgreSQL
- Supabase Realtime
- Supabase Storage
- Supabase Edge Functions

Deployment

Vercel (frontend)

Supabase (backend services)

---

# Repository Structure

The repository uses a **monorepo architecture**.

Root structure:

```
family-playground/

apps/
packages/
supabase/
docs/
```

---

# Apps

apps/web

Main web platform.

apps/admin

Optional administration panel.

Rules:

Application code must exist only in apps.

Shared logic must not be placed in apps.

---

# Packages

Reusable packages are stored in packages.

```
packages/

ui
types
supabase-client
game-engine

game-word-chain
game-memory-card
game-ladder
game-spot-diff
game-hidden-object
game-yut
```

---

# Game Module Rules

Each game must exist as its own package.

Example:

```
packages/game-memory-card/
```

Games must NOT depend on other game packages.

Games may only depend on:

- game-engine
- types
- ui

Shared gameplay utilities must be placed in:

```
packages/game-engine
```

---

# Game Engine Concept

All games must implement a common interface.

GameDefinition

Required fields:

- id
- title
- minPlayers
- maxPlayers

Required functions:

createInitialState()

applyEvent()

isGameFinished()

calculateResult()

---

# Game Architecture

Each game must follow a 3-layer architecture.

UI Layer

Rendering and interaction.

Logic Layer

Game rules and event processing.

State Layer

Game state structures.

---

# Game State Rules

Game state must be:

- deterministic
- serializable
- event-driven

State must only change via events.

Direct mutation is forbidden.

---

# Realtime System

Realtime communication uses Supabase Realtime.

Channels follow this format:

```
room:{room_id}
```

Example events:

player_join

player_leave

game_start

turn_update

game_event

game_end

score_update

All realtime messages must follow this structure:

```
event_type
room_id
user_id
payload
timestamp
```

---

# Game Room System

Game rooms manage multiplayer sessions.

Room states:

waiting

playing

finished

Lifecycle:

waiting → playing → finished

Host is responsible for starting the game.

---

# Database Model

Core tables:

profiles

family_members

games

game_rooms

room_players

game_sessions

game_scores

score_history

game_assets

All persistent data must be stored in Supabase PostgreSQL.

---

# Authentication

Authentication must use Supabase Auth.

Google OAuth is the only login method.

No username/password authentication.

---

# Storage

Game assets must be stored in Supabase Storage.

Buckets:

game-assets

user-assets

Examples:

- puzzle images
- hidden object images
- thumbnails

---

# UI Structure

Main routes:

```
/
/login
/lobby
/games
/room/{room_id}
/ranking
/profile
```

---

# Coding Standards

Language:

TypeScript

Rules:

- use strict TypeScript mode
- avoid unnecessary complexity
- write modular code
- prefer pure functions

Formatting:

eslint

prettier

---

# Development Strategy

Development must proceed in phases.

Phase 1

Platform foundation

- authentication
- user profile
- lobby
- room system

Phase 2

First playable games

- memory card game
- word chain game

Phase 3

score system

leaderboard

Phase 4

additional games

---

# AI Development Rules

AI agents must follow these rules:

Never create files outside defined folders.

Never mix game modules.

Never duplicate shared logic.

Never modify unrelated modules.

Follow existing patterns in the repository.

When uncertain, follow the existing architecture.

---

# Testing Strategy

Game logic must be testable independently from UI.

Example:

```
applyEvent(state, event) → newState
```

---

# Documentation Updates

When a new game is added:

Update:

- games catalog
- data specification
- architecture documentation

---

# Delivery Workflow

Agents must execute work in documented phases.

Before starting implementation:

- read the relevant existing specs in `docs/specs`
- identify the current phase and scope
- update the phase documents before writing production code

Phase folders must be created in `docs/specs` using this format:

```
01-platform-setup/
02-core-platform/
03-realtime-system/
04-first-games/
05-scoring-system/
06-platform-polish/
```

Each phase folder must contain:

- `plan.md`
- `spec.md`
- `tasks.md`

Document rules:

- `plan.md` must describe the phase goal, implementation order, dependencies, verification approach, and exit criteria
- `spec.md` must describe the functional and technical requirements for that phase based on the source specs
- `tasks.md` must track actionable tasks with status updates and final results

Execution rules:

- implementation must follow the phase order unless an earlier phase requires correction
- while work is in progress, the relevant phase documents must be updated to reflect the current state
- tests must be run for each completed task or feature slice whenever applicable
- a phase is complete only after implementation, verification, and documentation are all complete
- after verification completes, write the result summary into the phase documents
- after a completed unit of work, create a Git commit and push it to the remote without waiting for extra approval
- platform foundations must be completed before expanding the number of games
- prioritize authentication, family access control, session persistence, room lifecycle stability, and score persistence before adding more game content

Completion policy:

- do not mark work complete based only on code changes
- completion requires passing tests or explicit verification evidence when automated tests are unavailable
- if verification cannot be completed, document the blocker and keep the phase open
- continue this process until the documented specs are fully implemented

---

# Final Rule

Agents must prioritize:

predictability

modularity

clarity

Avoid over-engineering.

