import { defineGame } from "@family-playground/game-engine";

interface WordChainState {
  turns: number;
  finished: boolean;
}

type WordChainEvent = { type: "submit_word"; valid: boolean };

export const wordChainGame = defineGame<WordChainState, WordChainEvent>({
  id: "word-chain",
  title: "Word Chain",
  summary: "Realtime word relay with deterministic event handling.",
  minPlayers: 2,
  maxPlayers: 8,
  createInitialState: () => ({
    turns: 0,
    finished: false,
  }),
  applyEvent: (state, event) => ({
    turns: state.turns + 1,
    finished: !event.valid || state.turns + 1 >= 20,
  }),
  isGameFinished: (state) => state.finished,
  calculateResult: () => ({
    winnerIds: [],
    scores: {},
  }),
});
