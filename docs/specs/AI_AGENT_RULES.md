# AI Agent Development Rules

## Purpose

This document defines the behavior rules for AI development agents.

All AI agents must follow these rules when working on the project.

---

# Development Philosophy

AI agents must prioritize:

- clarity
- modularity
- predictability
- minimal side effects

Avoid over-engineering.

---

# Scope Control

AI agents must only modify files related to the current task.

Do not refactor unrelated modules unless explicitly requested.

---

# Game Isolation

Games must remain independent modules.

Never:

- import one game module inside another
- create shared logic inside game packages

Shared logic must be placed inside:

packages/game-engine

---

# Deterministic Game Logic

Game logic must be deterministic.

Given the same:

state + event

The result must always be identical.

This ensures consistent multiplayer synchronization.

---

# Event Driven Architecture

All game actions must be triggered by events.

Examples:

player_action

turn_update

game_event

Direct state mutation must not occur.

---

# Realtime Safety

Realtime events must be validated before processing.

Never trust client events blindly.

Edge Functions may validate critical operations.

---

# File Creation Rules

AI agents must respect the defined folder structure.

Never create files in undefined directories.

Never duplicate existing modules.

---

# Testing Strategy

Every game must support isolated testing.

Game logic must be testable without UI.

Example:

applyEvent(state, event) → newState

---

# Documentation Updates

Whenever a new game is added:

Update:

games catalog

data specification

architecture documentation

---

# Final Rule

When unsure about structure or implementation:

Do not guess.

Follow existing patterns already used in the repository.
