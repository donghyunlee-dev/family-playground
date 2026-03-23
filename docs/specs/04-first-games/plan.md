# Phase 04 Plan

## Title

First Games

## Goal

Ship the first playable games for the MVP: Memory Card and Word Chain.

## Implementation Order

1. Finalize shared game-engine contracts.
2. Define state, events, and result calculation for each game.
3. Build room-integrated game UIs with mobile-first layouts.
4. Connect realtime event flow to each game.
5. Add dictionary-backed validation for Word Chain submissions.
6. Verify game completion and results.

## Dependencies

- completed realtime room flow
- completed room UI and player management

## Verification

- unit tests for pure game logic
- unit tests for dictionary validation helpers
- multiplayer manual tests
- end-of-game result validation

## Exit Criteria

- Memory Card is playable
- Word Chain is playable with rule validation and dictionary-backed word checks
- both games use shared game definition contracts
- results can be calculated deterministically
