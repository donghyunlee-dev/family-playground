# Game Engine Specification

## Overview

All games must implement a shared interface.

This ensures that new games can be added without modifying platform logic.

Games must follow a predictable lifecycle.

---

# Game Lifecycle

Game lifecycle stages:

1 Initialize
2 Waiting for players
3 Start game
4 Gameplay events
5 End game
6 Result calculation

---

# GameDefinition Interface

Each game must export a GameDefinition.

Example structure:

GameDefinition

id
title
minPlayers
maxPlayers

createInitialState()
applyEvent()
isGameFinished()
calculateResult()

---

# GameState

GameState represents the current state of the game.

Example:

players
turn
board
timer
scores

GameState must be serializable.

---

# GameEvent

Events are triggered by player actions.

Examples:

player_move
card_flip
word_submit
object_found

Events are sent via realtime channel.

---

# Result Calculation

When a game ends:

calculateResult() is called.

Output:

player results
score values
ranking order

Results are persisted in database.
