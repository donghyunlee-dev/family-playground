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
- [ ] Rework Word Chain play screen so gameplay dominates and room metadata moves to compact support areas.
- [ ] Add temporary solo test mode with three virtual players while external dictionary validation is suspended.
- [ ] Replace turn-count scoring with 20-second timeout elimination and last-player-standing scoring.
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
- current in-flight adjustment: the play screen is being rebalanced so the word input becomes the visual center and room/player details move to compact support panels
- current in-flight adjustment: solo room testing is being unlocked by injecting three virtual players and bypassing external dictionary checks temporarily
- current in-flight adjustment: the word-chain play view is moving from overlay input to a chat-like top-down play log with support information in a bottom section
- current in-flight adjustment: the input section must surface the required starting character inline so mobile play does not lose the rule cue
- current in-flight adjustment: word submissions now need a minimum of 3 characters across both engine rules and play-screen validation
- current in-flight adjustment: mobile support information is moving into the game board so it stays visible above the fixed input section
- current blocker under active investigation: the local runtime environment still does not expose `WORD_CHAIN_KO_PROVIDER_KEY`, so live Korean dictionary validation cannot yet be verified end-to-end
- current in-flight adjustment: virtual player submissions are being routed through the same dictionary validation API so fake non-dictionary words do not appear in solo testing
- current in-flight adjustment: virtual players must also respect the full 20-second timeout window instead of being eliminated immediately when early candidate validation fails
- current in-flight adjustment: the last remaining player edge case is being guarded so a finished round cannot process a later timeout as another elimination
