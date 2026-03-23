# Phase 04 Tasks

## Status

In Progress

## Tasks

- [ ] Complete Memory Card game state and event model.
- [x] Complete Word Chain game state and event model.
- [ ] Add game UI components inside each package.
- [ ] Integrate both games with room flow.
- [ ] Add game logic tests.
- [x] Add dictionary-backed validation API for Word Chain.
- [x] Update Word Chain room UI to a mobile-first top-down train layout.
- [ ] Verify multiplayer playability and result calculation.
- [ ] Write completion summary and commit/push.

## Current Result

- `game-memory-card` is still placeholder logic
- `game-word-chain` now has deterministic match state, event validation, turn rotation, score tracking, and result calculation
- `word-chain` now has app-layer dictionary validation helpers and a validation route for Korean and English words
- the in-room `word-chain` UI now uses a mobile-first vertical train layout with a fixed prefix chip before the editable suffix input
- other game packages are still package-level placeholders
- `word-chain` is now exposed as the first playable test game from `/games`
- the room screen now mounts a realtime `word-chain` test board for `word-chain` rooms
- multiplayer browser verification is still pending
- dictionary helper tests are available, but full gameplay verification is still pending
- this phase cannot be closed until Phase 03 realtime sync is in place
- current implementation slice will focus on making `word-chain` testable first so room flow can be exercised with a real game loop
- current blocker under active investigation: external dictionary provider credentials are required for full Korean dictionary verification in deployed environments
