# Phase 01 Plan

## Title

Platform Setup

## Goal

Establish the monorepo, base web application, shared packages, Supabase local development environment, authentication foundation, family access control foundation, session persistence strategy, and the initial UI shell required for later phases.

## Implementation Order

1. Finalize repository tooling and workspace configuration.
2. Complete `apps/web`, shared packages, and environment handling.
3. Configure local Supabase workflow and baseline migrations.
4. Add authentication entry points, protected route strategy, and session bootstrap.
5. Verify local development flow, lint, typecheck, build, and local backend availability.

## Dependencies

- existing architecture, folder, coding, UI, deployment, and MVP specs
- Supabase project configuration
- Docker for local Supabase runtime

## Verification

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm --filter @family-playground/web dev`
- `supabase start` and `supabase status`

## Exit Criteria

- monorepo structure matches project rules
- web app runs locally
- Supabase local stack is available
- auth-related environment variables are wired
- family access and session foundations are defined
- base app routes and shell are present
