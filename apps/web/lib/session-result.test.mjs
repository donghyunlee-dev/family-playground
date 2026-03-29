import assert from "node:assert/strict";
import test from "node:test";
import { createWordChainMatchState } from "@family-playground/game-word-chain";
import {
  buildWordChainSessionResult,
  parseSessionFinishPayload,
  toSessionFinishRpcPayload,
} from "./session-result.ts";

test("buildWordChainSessionResult creates ranked results with awarded points", () => {
  const state = createWordChainMatchState([
    { id: "alice", name: "Alice", score: 0 },
    { id: "bob", name: "Bob", score: 0 },
    { id: "carol", name: "Carol", score: 0 },
  ]);

  state.players[0].score = 5;
  state.players[1].score = 3;
  state.players[2].score = 5;
  state.finished = true;
  state.winnerIds = ["alice", "carol"];

  const payload = buildWordChainSessionResult("session-1", state);

  assert.deepEqual(payload, {
    sessionId: "session-1",
    gameKey: "word-chain",
    winnerIds: ["alice", "carol"],
    results: [
      { playerId: "alice", score: 5, rank: 1, awardedPoints: 1 },
      { playerId: "carol", score: 5, rank: 1, awardedPoints: 1 },
      { playerId: "bob", score: 3, rank: 2, awardedPoints: 0 },
    ],
  });
});

test("buildWordChainSessionResult derives winners when the state is unfinished", () => {
  const state = createWordChainMatchState([
    { id: "alice", name: "Alice", score: 0 },
    { id: "bob", name: "Bob", score: 0 },
  ]);

  state.players[0].score = 4;
  state.players[1].score = 2;

  const payload = buildWordChainSessionResult("session-2", state);

  assert.deepEqual(payload.winnerIds, ["alice"]);
  assert.deepEqual(payload.results, [
    { playerId: "alice", score: 4, rank: 1, awardedPoints: 1 },
    { playerId: "bob", score: 2, rank: 2, awardedPoints: 0 },
  ]);
});

test("buildWordChainSessionResult excludes virtual players from persisted results", () => {
  const state = createWordChainMatchState([
    { id: "alice", name: "Alice", score: 0 },
    { id: "bot:1", name: "Bot One", score: 0 },
    { id: "bot:2", name: "Bot Two", score: 0 },
  ]);

  state.players[0].score = 3;
  state.players[1].score = 5;
  state.players[2].score = 4;
  state.finished = true;
  state.winnerIds = ["bot:1"];

  const payload = buildWordChainSessionResult("session-bot", state);

  assert.deepEqual(payload, {
    sessionId: "session-bot",
    gameKey: "word-chain",
    winnerIds: [],
    results: [{ playerId: "alice", score: 3, rank: 1, awardedPoints: 0 }],
  });
});

test("parseSessionFinishPayload accepts a valid serialized payload", () => {
  const parsed = parseSessionFinishPayload(
    JSON.stringify({
      sessionId: "session-3",
      gameKey: "word-chain",
      winnerIds: ["alice"],
      results: [
        { playerId: "alice", score: 5, rank: 1, awardedPoints: 1 },
        { playerId: "bob", score: 2, rank: 2, awardedPoints: 0 },
      ],
    }),
  );

  assert.deepEqual(parsed, {
    sessionId: "session-3",
    gameKey: "word-chain",
    winnerIds: ["alice"],
    results: [
      { playerId: "alice", score: 5, rank: 1, awardedPoints: 1 },
      { playerId: "bob", score: 2, rank: 2, awardedPoints: 0 },
    ],
  });
});

test("parseSessionFinishPayload rejects malformed payloads", () => {
  assert.throws(
    () =>
      parseSessionFinishPayload(
        JSON.stringify({
          sessionId: "session-4",
          gameKey: "word-chain",
          winnerIds: ["alice"],
          results: [{ playerId: "alice", score: "five", rank: 1 }],
        }),
      ),
    /Invalid session finish payload/,
  );
});

test("toSessionFinishRpcPayload converts client payload keys for the RPC", () => {
  const rpcPayload = toSessionFinishRpcPayload({
    sessionId: "session-5",
    gameKey: "word-chain",
    winnerIds: ["alice"],
    results: [
      { playerId: "alice", score: 5, rank: 1, awardedPoints: 1 },
      { playerId: "bob", score: 2, rank: 2, awardedPoints: 0 },
    ],
  });

  assert.deepEqual(rpcPayload, {
    session_id: "session-5",
    game_key: "word-chain",
    winner_ids: ["alice"],
    results: [
      { player_id: "alice", score: 5, rank: 1, awarded_points: 1 },
      { player_id: "bob", score: 2, rank: 2, awarded_points: 0 },
    ],
  });
});
