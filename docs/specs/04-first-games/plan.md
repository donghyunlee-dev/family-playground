# Phase 04 Plan

## Title

First Games

## Goal

Ship the first playable games for the MVP: Memory Card and Word Chain.

## Implementation Order

1. Finalize shared game-engine contracts.
2. Define state, events, and result calculation for each game.
3. Build room-integrated game UIs.
4. Connect realtime event flow to each game.
5. Verify game completion and results.

## Dependencies

- completed realtime room flow
- completed room UI and player management

## Verification

- unit tests for pure game logic
- multiplayer manual tests
- end-of-game result validation

## Exit Criteria

- Memory Card is playable
- Word Chain is playable
- both games use shared game definition contracts
- results can be calculated deterministically
