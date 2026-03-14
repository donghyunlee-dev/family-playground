# Folder Structure Specification

## Purpose

This document defines the **mandatory repository structure**.

All AI agents must follow this structure when creating or modifying files.

Do not create files outside the defined directories unless explicitly instructed.

---

# Root Repository Structure

family-playground/

apps/

packages/

supabase/

docs/

---

# Apps Directory

Applications that can be deployed.

apps/web

Main web platform built with Next.js.

apps/admin

Optional admin interface for managing assets and games.

Rules:

- apps must only contain application code
- shared logic must not be placed inside apps

Shared logic must be placed in packages.

---

# Packages Directory

Reusable packages shared across applications.

packages/ui

Reusable UI components.

packages/types

Shared TypeScript types.

packages/supabase-client

Supabase client configuration.

packages/game-engine

Core game interfaces and shared gameplay logic.

packages/game-word-chain

Endless word chain game module.

packages/game-memory-card

Memory card matching game.

packages/game-ladder

Random ladder selection game.

packages/game-spot-diff

Spot the difference puzzle game.

packages/game-hidden-object

Hidden object search game.

packages/game-yut

Yut board game.

---

# Game Package Rules

Each game must be implemented as an independent package.

Example structure:

packages/game-memory-card/

src/

components/

logic/

types/

index.ts

Rules:

- game packages must not depend on other game packages
- games may only depend on:
    - game-engine
    - types
    - ui

---

# Supabase Directory

Contains backend infrastructure.

supabase/

migrations/

Database migration SQL files.

functions/

Supabase edge functions.

seed.sql

Optional seed data.

---

# Docs Directory

Contains all project specifications.

docs/

PRD

architecture

data specification

coding rules

deployment guides

---

# AI Restrictions

AI agents must follow these rules:

Never create game logic inside apps/web.

Never mix game modules.

Never duplicate shared types.

All shared code must be placed inside packages.
