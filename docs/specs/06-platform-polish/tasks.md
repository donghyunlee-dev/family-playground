# Phase 06 Tasks

## Status

In Progress

## Tasks

- [x] Review UX and behavior gaps across all routes.
- [ ] Fix blocking or high-severity bugs.
- [x] Improve loading, error, and empty states.
- [x] Refresh the visual language for a family-friendly Korean UI.
- [x] Run targeted verification for the refreshed web app.
- [ ] Write final completion summary and commit/push.

## Progress Notes

- Updated shared typography and background styling to a brighter, child-friendly direction.
- Reworked home, login, lobby, games, ranking, profile, and room pages with Korean copy and clearer empty states.
- Adjusted buttons and navigation styles to avoid low-contrast hover states.
- Removed decorative gradients from the main UI and simplified the lobby around the game list and open rooms.
- Moved logout to the protected header top bar so account switching is easy during login testing.
- Reworked the main routes for phone-first sizing with shorter copy, tighter cards, and larger touch targets.
- Adjusted protected navigation and game/room controls so they remain usable on mobile and tablet widths.
- Verified `pnpm --filter @family-playground/web lint` and `pnpm --filter @family-playground/web typecheck`.
- Verified the local preview server responds on `http://127.0.0.1:3001/login`.
