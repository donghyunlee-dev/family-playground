import type { GameCatalogEntry } from "@family-playground/types";

export const fallbackGames: GameCatalogEntry[] = [
  {
    id: "memory-card",
    gameKey: "memory-card",
    title: "Memory Card",
    description: "Turn-based card matching for 2 to 4 players.",
    thumbnailUrl: null,
    minPlayers: 2,
    maxPlayers: 4,
    enabled: true,
  },
  {
    id: "word-chain",
    gameKey: "word-chain",
    title: "Word Chain",
    description: "Realtime word relay with deterministic event handling.",
    thumbnailUrl: null,
    minPlayers: 2,
    maxPlayers: 8,
    enabled: true,
  },
  {
    id: "spot-diff",
    gameKey: "spot-diff",
    title: "Spot the Difference",
    description: "Find visual differences together in timed rounds.",
    thumbnailUrl: null,
    minPlayers: 1,
    maxPlayers: 4,
    enabled: false,
  },
];
