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
- Word Chain must support a mobile-first top-down layout that makes the submitted words feel like connected train cars
- when a required starting character exists, the input must render it as a fixed prefix before the editable suffix field
- validation feedback must distinguish between local rule failures and dictionary lookup failures

## Word Chain Validation

- local game rules remain deterministic inside `packages/game-word-chain`
- dictionary validation must run in the web app layer before a submit event is broadcast
- Korean words must be checked against a Korean dictionary provider
- English words must be checked against an English dictionary provider
- mixed-language submissions must be rejected unless a future mode explicitly supports them
