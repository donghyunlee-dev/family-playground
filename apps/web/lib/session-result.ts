import { wordChainGame, type WordChainState } from "@family-playground/game-word-chain";

export interface SessionResultRow {
  playerId: string;
  score: number;
  rank: number;
  awardedPoints: number;
}

export interface SessionFinishPayload {
  sessionId: string;
  gameKey: "word-chain";
  winnerIds: string[];
  results: SessionResultRow[];
}

export interface SessionFinishRpcPayload {
  session_id: string;
  game_key: "word-chain";
  winner_ids: string[];
  results: Array<{
    player_id: string;
    score: number;
    rank: number;
    awarded_points: number;
  }>;
}

function isSessionResultRow(value: unknown): value is SessionResultRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.playerId === "string" &&
    typeof candidate.score === "number" &&
    typeof candidate.rank === "number" &&
    typeof candidate.awardedPoints === "number"
  );
}

export function parseSessionFinishPayload(value: string): SessionFinishPayload {
  const parsed = JSON.parse(value) as Record<string, unknown>;

  if (
    typeof parsed.sessionId !== "string" ||
    parsed.gameKey !== "word-chain" ||
    !Array.isArray(parsed.winnerIds) ||
    !parsed.winnerIds.every((winnerId) => typeof winnerId === "string") ||
    !Array.isArray(parsed.results) ||
    !parsed.results.every(isSessionResultRow)
  ) {
    throw new Error("Invalid session finish payload.");
  }

  return {
    sessionId: parsed.sessionId,
    gameKey: parsed.gameKey,
    winnerIds: parsed.winnerIds,
    results: parsed.results,
  };
}

export function buildWordChainSessionResult(
  sessionId: string,
  state: WordChainState,
): SessionFinishPayload {
  const calculated = wordChainGame.calculateResult(state);
  const playersWithIndex = state.players.map((player, index) => ({
    index,
    playerId: player.id,
    score: calculated.scores[player.id] ?? player.score,
    awardedPoints: calculated.winnerIds.includes(player.id) ? 1 : 0,
  }));

  playersWithIndex.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return left.index - right.index;
  });

  let currentRank = 1;

  const results: SessionResultRow[] = playersWithIndex.map((player, index) => {
    if (index > 0 && player.score !== playersWithIndex[index - 1]!.score) {
      currentRank += 1;
    }

    return {
      playerId: player.playerId,
      score: player.score,
      rank: currentRank,
      awardedPoints: player.awardedPoints,
    };
  });

  return {
    sessionId,
    gameKey: "word-chain",
    winnerIds: calculated.winnerIds,
    results,
  };
}

export function toSessionFinishRpcPayload(
  payload: SessionFinishPayload,
): SessionFinishRpcPayload {
  return {
    session_id: payload.sessionId,
    game_key: payload.gameKey,
    winner_ids: payload.winnerIds,
    results: payload.results.map((result) => ({
      player_id: result.playerId,
      score: result.score,
      rank: result.rank,
      awarded_points: result.awardedPoints,
    })),
  };
}
