import { defineGame } from "@family-playground/game-engine";

interface MemoryCardState {
  moves: number;
  finished: boolean;
}

type MemoryCardEvent = { type: "flip_pair"; match: boolean };

export const memoryCardGame = defineGame<MemoryCardState, MemoryCardEvent>({
  id: "memory-card",
  title: "Memory Card",
  summary: "Turn-based card matching for 2 to 4 players.",
  minPlayers: 2,
  maxPlayers: 4,
  createInitialState: () => ({
    moves: 0,
    finished: false,
  }),
  applyEvent: (state, event) => ({
    moves: state.moves + 1,
    finished: event.match ? state.finished : state.moves + 1 >= 12,
  }),
  isGameFinished: (state) => state.finished,
  calculateResult: () => ({
    winnerIds: [],
    scores: {},
  }),
});
