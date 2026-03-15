# Phase 04 Spec

## Scope

This phase covers the first MVP games.

## Games

- Memory Card Game
- Word Chain Game

## Shared Rules

- game state must be deterministic
- game state must be serializable
- state changes must occur only through events
- all games must implement:
  - `id`
  - `title`
  - `minPlayers`
  - `maxPlayers`
  - `createInitialState()`
  - `applyEvent()`
  - `isGameFinished()`
  - `calculateResult()`

## UI Rules

- show player list
- show current turn
- show scores
- show game board
