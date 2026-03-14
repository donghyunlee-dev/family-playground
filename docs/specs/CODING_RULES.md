# Coding Rules

## General Principles

Code must follow these principles:

- simplicity
- modularity
- readability
- maintainability

Avoid unnecessary complexity.

---

# Language

Primary language:

TypeScript

---

# Repository Rules

Use monorepo structure.

Shared code must be placed in packages.

Apps must not duplicate shared logic.

---

# Game Module Rules

Each game must exist as its own package.

Example:

packages/game-memory-card
packages/game-word-chain

Game packages must not depend on other game packages.

They may depend only on:

game-engine
types
ui

---

# State Management

Game state must be deterministic.

All state changes must occur through events.

Never mutate shared state directly.

---

# Realtime Events

Realtime messages must follow a common format.

Example event structure:

event_type
room_id
user_id
payload
timestamp

---

# Error Handling

Errors must not break realtime channels.

Client must handle invalid events gracefully.

---

# Code Style

Use consistent formatting.

Linting:

eslint

Formatting:

prettier

Type safety:

strict TypeScript mode
