import assert from "node:assert/strict";
import test from "node:test";
import { createWordChainMatchState } from "@family-playground/game-word-chain";
import {
  applyWordChainFinalResult,
  shouldIgnoreWordChainBroadcastSession,
} from "./word-chain-session.ts";

test("ignores broadcasts for another session", () => {
  assert.equal(
    shouldIgnoreWordChainBroadcastSession("session-b", "session-a"),
    true,
  );
  assert.equal(
    shouldIgnoreWordChainBroadcastSession("session-a", "session-a"),
    false,
  );
  assert.equal(shouldIgnoreWordChainBroadcastSession(undefined, "session-a"), false);
});

test("applies final result for the current session", () => {
  const state = createWordChainMatchState([
    { id: "alice", name: "Alice", score: 2 },
    { id: "bob", name: "Bob", score: 1 },
  ]);

  const nextState = applyWordChainFinalResult(
    state,
    {
      session_id: "session-a",
      results: [
        { player_id: "alice", score: 2, rank: 1 },
        { player_id: "bob", score: 1, rank: 2 },
      ],
    },
    "session-a",
  );

  assert.equal(nextState.finished, true);
  assert.deepEqual(nextState.winnerIds, ["alice"]);
  assert.equal(nextState.lastError, null);
});

test("keeps the current state for a stale session end payload", () => {
  const state = createWordChainMatchState([
    { id: "alice", name: "Alice", score: 2 },
  ]);

  const nextState = applyWordChainFinalResult(
    state,
    {
      session_id: "session-b",
      results: [{ player_id: "alice", score: 2, rank: 1 }],
    },
    "session-a",
  );

  assert.equal(nextState, state);
});
