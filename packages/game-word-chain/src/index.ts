import { defineGame } from "@family-playground/game-engine";
import type { GamePlayer } from "@family-playground/types";

export interface WordChainPlayerState extends GamePlayer {
  eliminated: boolean;
}

export interface WordChainEntry {
  playerId: string;
  word: string;
}

export interface WordChainState {
  players: WordChainPlayerState[];
  currentTurnIndex: number;
  entries: WordChainEntry[];
  usedWords: string[];
  lastWord: string | null;
  requiredChar: string | null;
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
      type: "timeout_turn";
      playerId: string;
    }
  | {
      type: "reset_match";
      players: GamePlayer[];
    };

function normalizeWord(word: string) {
  return word.trim().toLowerCase();
}

export function createWordChainMatchState(players: GamePlayer[]): WordChainState {
  return {
    players: players.map((player) => ({
      ...player,
      score: 0,
      eliminated: false,
    })),
    currentTurnIndex: 0,
    entries: [],
    usedWords: [],
    lastWord: null,
    requiredChar: null,
    finished: false,
    winnerIds: [],
    lastError: null,
  };
}

function getActivePlayers(players: WordChainPlayerState[]) {
  return players.filter((player) => !player.eliminated);
}

function calculateWinners(players: WordChainPlayerState[]) {
  const activePlayers = getActivePlayers(players);

  if (activePlayers.length === 1) {
    return [activePlayers[0]!.id];
  }

  return [];
}

export function getNextTurnIndex(state: WordChainState, players = state.players) {
  if (players.length === 0) {
    return 0;
  }

  let nextIndex = state.currentTurnIndex;

  for (let step = 0; step < players.length; step += 1) {
    nextIndex = (nextIndex + 1) % players.length;

    if (!players[nextIndex]?.eliminated) {
      return nextIndex;
    }
  }

  return state.currentTurnIndex;
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

  if (currentPlayer.eliminated) {
    return {
      valid: false,
      message: "탈락한 플레이어는 입력할 수 없습니다.",
      normalizedWord,
    };
  }

  if (normalizedWord.length < 3) {
    return {
      valid: false,
      message: "세 글자 이상 입력해 주세요.",
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
    return createWordChainMatchState(event.players);
  }

  if (event.type === "timeout_turn") {
    const currentPlayer = state.players[state.currentTurnIndex];
    const activePlayers = getActivePlayers(state.players);

    if (!currentPlayer || currentPlayer.id !== event.playerId || currentPlayer.eliminated) {
      return {
        ...state,
        lastError: "타임아웃을 처리할 수 없습니다.",
      };
    }

    if (activePlayers.length <= 1) {
      return {
        ...state,
        finished: true,
        winnerIds: activePlayers.map((player) => player.id),
        lastError: null,
      };
    }

    const nextPlayers = state.players.map((player) =>
      player.id === event.playerId
        ? {
            ...player,
            eliminated: true,
          }
        : player,
    );
    const winnerIds = calculateWinners(nextPlayers);
    const finished = winnerIds.length > 0;

    return {
      ...state,
      players: nextPlayers,
      currentTurnIndex: finished ? state.currentTurnIndex : getNextTurnIndex(state, nextPlayers),
      finished,
      winnerIds,
      lastError: `${currentPlayer.name} 님이 시간 초과로 탈락했습니다.`,
    };
  }

  const validation = isValidWordSubmission(state, event.playerId, event.word);

  if (!validation.valid) {
    return {
      ...state,
      lastError: validation.message,
    };
  }

  return {
    ...state,
    entries: [
      ...state.entries,
      {
        playerId: event.playerId,
        word: validation.normalizedWord,
      },
    ],
    usedWords: [...state.usedWords, validation.normalizedWord],
    lastWord: validation.normalizedWord,
    requiredChar: validation.normalizedWord.slice(-1),
    currentTurnIndex: getNextTurnIndex(state),
    finished: false,
    winnerIds: [],
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
  calculateResult: (state) => {
    const winnerIds = state.finished ? state.winnerIds : calculateWinners(state.players);

    return {
      winnerIds,
      scores: Object.fromEntries(
        state.players.map((player) => [player.id, winnerIds.includes(player.id) ? 1 : 0]),
      ),
    };
  },
});
