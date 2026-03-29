import { defineGame } from "@family-playground/game-engine";
import type { GamePlayer } from "@family-playground/types";

export interface WordChainPlayerState extends GamePlayer {
  eliminated: boolean;
}

export interface WordChainState {
  players: WordChainPlayerState[];
  currentTurnIndex: number;
  usedWords: string[];
  lastWord: string | null;
  requiredChar: string | null;
  turnCount: number;
  maxTurns: number;
  targetScore: number;
  finished: boolean;
  winnerIds: string[];
  lastError: string | null;
}

export type WordChainEvent =
  | {
      type: "submit_word";
      playerId: string;
      word: string;
    }
  | {
      type: "reset_match";
      players: GamePlayer[];
    };

function normalizeWord(word: string) {
  return word.trim().toLowerCase();
}

export function createWordChainMatchState(
  players: GamePlayer[],
  options?: {
    maxTurns?: number;
    targetScore?: number;
  },
): WordChainState {
  return {
    players: players.map((player) => ({
      ...player,
      eliminated: false,
    })),
    currentTurnIndex: 0,
    usedWords: [],
    lastWord: null,
    requiredChar: null,
    turnCount: 0,
    maxTurns: options?.maxTurns ?? 12,
    targetScore: options?.targetScore ?? 5,
    finished: false,
    winnerIds: [],
    lastError: null,
  };
}

function calculateWinners(players: WordChainPlayerState[]) {
  const highestScore = Math.max(...players.map((player) => player.score), 0);

  return players
    .filter((player) => player.score === highestScore)
    .map((player) => player.id);
}

export function getNextTurnIndex(state: WordChainState) {
  if (state.players.length === 0) {
    return 0;
  }

  return (state.currentTurnIndex + 1) % state.players.length;
}

export function isValidWordSubmission(
  state: WordChainState,
  playerId: string,
  rawWord: string,
) {
  const normalizedWord = normalizeWord(rawWord);
  const currentPlayer = state.players[state.currentTurnIndex];

  if (state.finished) {
    return {
      valid: false,
      message: "이미 끝난 게임입니다.",
      normalizedWord,
    };
  }

  if (!currentPlayer || currentPlayer.id !== playerId) {
    return {
      valid: false,
      message: "지금은 내 차례가 아닙니다.",
      normalizedWord,
    };
  }

  if (normalizedWord.length < 2) {
    return {
      valid: false,
      message: "두 글자 이상 입력해 주세요.",
      normalizedWord,
    };
  }

  if (state.usedWords.includes(normalizedWord)) {
    return {
      valid: false,
      message: "이미 사용한 단어입니다.",
      normalizedWord,
    };
  }

  if (state.requiredChar && !normalizedWord.startsWith(state.requiredChar)) {
    return {
      valid: false,
      message: `현재는 ${state.requiredChar}로 시작해야 합니다.`,
      normalizedWord,
    };
  }

  return {
    valid: true,
    message: null,
    normalizedWord,
  };
}

export function applyWordChainEvent(
  state: WordChainState,
  event: WordChainEvent,
): WordChainState {
  if (event.type === "reset_match") {
    return createWordChainMatchState(event.players, {
      maxTurns: state.maxTurns,
      targetScore: state.targetScore,
    });
  }

  const validation = isValidWordSubmission(state, event.playerId, event.word);

  if (!validation.valid) {
    return {
      ...state,
      lastError: validation.message,
    };
  }

  const nextPlayers = state.players.map((player) =>
    player.id === event.playerId
      ? {
          ...player,
          score: player.score + 1,
        }
      : player,
  );
  const turnCount = state.turnCount + 1;
  const finished =
    nextPlayers.some((player) => player.score >= state.targetScore) ||
    turnCount >= state.maxTurns;

  return {
    ...state,
    players: nextPlayers,
    usedWords: [...state.usedWords, validation.normalizedWord],
    lastWord: validation.normalizedWord,
    requiredChar: validation.normalizedWord.slice(-1),
    currentTurnIndex: finished ? state.currentTurnIndex : getNextTurnIndex(state),
    turnCount,
    finished,
    winnerIds: finished ? calculateWinners(nextPlayers) : [],
    lastError: null,
  };
}

export const wordChainGame = defineGame<WordChainState, WordChainEvent>({
  id: "word-chain",
  title: "Word Chain",
  summary: "Realtime word relay with deterministic event handling.",
  minPlayers: 1,
  maxPlayers: 4,
  createInitialState: () => createWordChainMatchState([]),
  applyEvent: applyWordChainEvent,
  isGameFinished: (state) => state.finished,
  calculateResult: (state) => ({
    winnerIds: state.finished ? state.winnerIds : calculateWinners(state.players),
    scores: Object.fromEntries(
      state.players.map((player) => [player.id, player.score]),
    ),
  }),
});
