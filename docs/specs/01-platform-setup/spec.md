# Phase 01 Spec

## Scope

This phase covers the platform foundation described across the source specs.

## Functional Requirements

- initialize a TypeScript monorepo managed by Turborepo
- provide a Next.js web application in `apps/web`
- reserve `apps/admin` for future admin work
- create shared packages for `ui`, `types`, `supabase-client`, and `game-engine`
- provide local Supabase configuration under `supabase/`
- prepare authentication foundations for Google OAuth via Supabase Auth
- prepare family allowlist access-control foundations
- prepare persistent session restoration foundations
- provide the initial base UI layout for the platform

## Technical Requirements

- use strict TypeScript
- keep shared logic inside `packages/`
- keep game packages independent from each other
- keep state/event contracts deterministic and serializable
- support environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Deliverables

- working workspace tooling
- initial route shell in `apps/web`
- shared type and engine contracts
- local Supabase config and seed placeholders
- auth and protected-route foundations
- family membership and access-control foundations
- documented verification path for local setup
