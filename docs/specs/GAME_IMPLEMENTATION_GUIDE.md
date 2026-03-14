# Game Implementation Guide

## Purpose

This document defines the standard method for implementing new games.

Every game must follow the same architecture to ensure platform stability.

---

# Game Module Structure

Each game must be implemented as a standalone package.

Example:

packages/game-memory-card/

src/

components/

logic/

types/

index.ts

---

# Game Layers

Game implementation consists of three layers.

UI Layer

Handles rendering and player interactions.

Logic Layer

Handles game rules and state transitions.

State Layer

Defines game state structures.

---

# Game Definition

Every game must export a GameDefinition object.

Required fields:

id

title

minPlayers

maxPlayers

Required functions:

createInitialState()

applyEvent()

isGameFinished()

calculateResult()

---

# Game State

GameState must represent the entire state of a running game.

Requirements:

- deterministic
- serializable
- event driven

GameState example:

players

board

turn

scores

timer

---

# Event Driven Updates

Game state must only change through events.

Examples:

card_flip

word_submit

move_piece

object_found

Direct state mutation is not allowed.

---

# Turn System

Turn based games must implement:

currentTurn

nextTurn()

Example logic:

player_index = (current + 1) % players.length

---

# Scoring

Score calculation must occur only when the game ends.

Result example:

player_id

score

rank

Results must be persisted in database.

---

# UI Integration

Each game must provide a root component.

Example:

GameRoot.tsx

Responsibilities:

- render game board
- listen to realtime events
- dispatch player actions
