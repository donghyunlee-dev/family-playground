import type { WordChainState } from "@family-playground/game-word-chain";

export interface WordChainFinalResult {
  player_id: string;
  score: number;
  rank: number;
}

export interface WordChainGameEndPayload {
  session_id?: string;
  results?: WordChainFinalResult[];
}

export function shouldIgnoreWordChainBroadcastSession(
  payloadSessionId: string | null | undefined,
  currentSessionId: string | null,
) {
  return Boolean(
    payloadSessionId &&
      currentSessionId &&
      payloadSessionId !== currentSessionId,
  );
}

export function applyWordChainFinalResult(
  state: WordChainState,
  payload: WordChainGameEndPayload | null | undefined,
  currentSessionId: string | null,
) {
  if (shouldIgnoreWordChainBroadcastSession(payload?.session_id, currentSessionId)) {
    return state;
  }

  const winnerIds =
    payload?.results
      ?.filter((result) => result.rank === 1)
      .map((result) => result.player_id) ?? [];

  return {
    ...state,
    finished: true,
    winnerIds: winnerIds.length > 0 ? winnerIds : state.winnerIds,
    lastError: null,
  };
}
