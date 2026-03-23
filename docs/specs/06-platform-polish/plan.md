# Phase 06 Plan

## Title

Platform Polish

## Goal

Stabilize the MVP, improve UX, reduce defects, and prepare the platform for steady iteration.

Current focus:

- simplify the platform UI so children and parents can understand it at a glance
- switch shared styling to a brighter family-game visual language
- remove remaining English copy from core user-facing routes
- verify that login remains reachable while game slots stay intentionally empty
- collapse the public entry flow so `/` shows the game catalog immediately and authentication happens in-place

## Implementation Order

1. Review UX gaps across routes and game flows.
2. Fix defects and rough edges from earlier phases.
3. Improve responsiveness, loading states, and error handling.
4. Re-run full verification across the platform.
5. Finalize documentation and release readiness notes.

## Dependencies

- Phases 01 through 05 substantially complete

## Verification

- full regression pass
- performance and usability checks
- deployment readiness review
- route smoke checks on `/`, `/login`, and protected navigation after UI refresh
- use `ui-regression-checklist.md` after every UI-affecting change
- `pnpm --filter @family-playground/web lint`
- `pnpm --filter @family-playground/web typecheck`

## Exit Criteria

- major UX gaps are closed
- blocking bugs are fixed
- full platform verification is documented
