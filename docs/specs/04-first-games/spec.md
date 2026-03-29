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
- show game board
- Word Chain must support a mobile-first top-down layout that reads like a compact chat feed
- Word Chain play view must keep the word input and word log as the dominant visual focus
- room metadata and participant context should move to compact top or bottom support areas instead of competing with the game board
- mobile support information must remain visible inside the game board instead of only inside the fixed input bar
- when a required starting character exists, the input must render it as a fixed prefix before the editable suffix field
- validation feedback must distinguish between local rule failures and dictionary lookup failures

## Word Chain Match Rules

- each turn has a 20-second limit
- if the current player does not submit within 20 seconds, that player is eliminated
- submitted words must be at least 3 characters long
- the round ends when only one active player remains
- once only one active player remains, the round must finish immediately and that player must not be processed as a later timeout elimination
- the last remaining player earns 1 point for the session result
- turn-count scoring and target-score scoring are not used

## Word Chain Validation

- local game rules remain deterministic inside `packages/game-word-chain`
- dictionary validation must run in the web app layer before a submit event is broadcast
- when a dictionary provider key is configured, the play screen must call the validation API before applying a user submission
- virtual players in solo test mode must also pass through the same dictionary validation path before their words are applied
- Korean words must be checked against a Korean dictionary provider
- English words must be checked against an English dictionary provider
- mixed-language submissions must be rejected unless a future mode explicitly supports them
- temporary local test mode may suspend external dictionary checks when multiplayer validation is blocked and must be documented as a non-final state
