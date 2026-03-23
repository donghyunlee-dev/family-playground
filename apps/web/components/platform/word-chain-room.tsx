"use client";

import {
  createRoomRealtimeMessage,
  getRoomChannelName,
} from "@family-playground/types";
import {
  applyWordChainEvent,
  createWordChainMatchState,
  isValidWordSubmission,
  type WordChainEvent,
  type WordChainState,
} from "@family-playground/game-word-chain";
import type { GamePlayer } from "@family-playground/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  applyWordChainFinalResult,
  shouldIgnoreWordChainBroadcastSession,
  type WordChainGameEndPayload,
} from "@/lib/word-chain-session";
import type { ValidateWordResponse } from "@/lib/word-chain-dictionary/types";
import { buildWordChainSessionResult } from "@/lib/session-result";

interface WordChainRoomProps {
  finishFormId?: string;
  roomId: string;
  sessionId: string | null;
  roomStatus: "waiting" | "playing" | "finished";
  currentUserId: string;
  currentUserName: string;
  players: GamePlayer[];
  canFinish: boolean;
}

interface WordChainBroadcastPayload {
  type: "word_chain_event";
  game_key: "word-chain";
  session_id: string;
  event_id: string;
  event: WordChainEvent;
  [key: string]: unknown;
}

export function WordChainRoom({
  finishFormId,
  roomId,
  sessionId,
  roomStatus,
  currentUserId,
  currentUserName,
  players,
  canFinish,
}: WordChainRoomProps) {
  const initialState = useMemo(
    () => createWordChainMatchState(players),
    [players],
  );
  const [state, setState] = useState<WordChainState>(initialState);
  const [pendingWord, setPendingWord] = useState("");
  const [helperText, setHelperText] = useState<string | null>(
    "방장이 게임 시작을 누르면 끝말잇기가 시작됩니다.",
  );
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [isValidatingWord, setIsValidatingWord] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const seenEventIdsRef = useRef<Set<string>>(new Set());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isSessionEndedRef = useRef(false);
  const previousSessionIdRef = useRef(sessionId);

  useEffect(() => {
    isSessionEndedRef.current = isSessionEnded;
  }, [isSessionEnded]);

  useEffect(() => {
    if (previousSessionIdRef.current === sessionId) {
      return;
    }

    previousSessionIdRef.current = sessionId;
    isSessionEndedRef.current = false;
    setIsSessionEnded(false);
    setState(createWordChainMatchState(players));
    setPendingWord("");
    setValidationError(null);
    setIsValidatingWord(false);
    setHelperText(
      roomStatus === "playing"
        ? "단어를 제출하면 같은 방 참가자 화면에 바로 반영됩니다."
        : "방장이 게임 시작을 누르면 끝말잇기가 시작됩니다.",
    );
    seenEventIdsRef.current = new Set();
  }, [players, roomStatus, sessionId]);

  useEffect(() => {
    if (roomStatus === "playing") {
      return;
    }

    if (!isSessionEndedRef.current) {
      isSessionEndedRef.current = true;
      setIsSessionEnded(true);
      setHelperText(
        "이번 라운드는 끝났습니다. 방장이 새 세션을 시작할 수 있습니다.",
      );
    }
  }, [roomStatus]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase.channel(getRoomChannelName(roomId));

    channel
      .on("broadcast", { event: "game_event" }, ({ payload }) => {
        const message = payload as {
          payload: WordChainBroadcastPayload;
        };
        const gamePayload = message.payload;

        if (
          !gamePayload ||
          gamePayload.game_key !== "word-chain" ||
          shouldIgnoreWordChainBroadcastSession(gamePayload.session_id, sessionId) ||
          isSessionEndedRef.current ||
          seenEventIdsRef.current.has(gamePayload.event_id)
        ) {
          return;
        }

        seenEventIdsRef.current.add(gamePayload.event_id);
        setState((current) => applyWordChainEvent(current, gamePayload.event));
      })
      .on("broadcast", { event: "game_start" }, ({ payload }) => {
        const message = payload as {
          payload?: { session_id?: string };
        };

        if (
          shouldIgnoreWordChainBroadcastSession(
            message.payload?.session_id,
            sessionId,
          )
        ) {
          return;
        }

        isSessionEndedRef.current = false;
        setIsSessionEnded(false);
        setPendingWord("");
        setValidationError(null);
        setIsValidatingWord(false);
        setHelperText("게임이 시작되었습니다. 현재 차례인 사람이 단어를 제출해 주세요.");
      })
      .on("broadcast", { event: "game_end" }, ({ payload }) => {
        const message = payload as {
          payload?: WordChainGameEndPayload;
        };
        const gamePayload = message.payload;

        if (
          shouldIgnoreWordChainBroadcastSession(
            gamePayload?.session_id,
            sessionId,
          )
        ) {
          return;
        }

        isSessionEndedRef.current = true;
        setIsSessionEnded(true);
        setPendingWord("");
        setValidationError(null);
        setIsValidatingWord(false);
        setState((current) =>
          applyWordChainFinalResult(current, gamePayload, sessionId),
        );
        setHelperText(
          gamePayload?.results?.length
            ? "게임이 종료되었습니다. 서버 결과가 반영되었습니다."
            : "이번 라운드는 끝났습니다. 방장이 새 세션을 시작할 수 있습니다.",
        );
      });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [players, roomId, sessionId]);

  const submitDisabled =
    roomStatus !== "playing" ||
    !sessionId ||
    isSessionEnded ||
    isValidatingWord ||
    state.finished ||
    state.players[state.currentTurnIndex]?.id !== currentUserId;

  const handleSubmitWord = async () => {
    if (submitDisabled || !sessionId || !channelRef.current) {
      return;
    }

    const suffix = pendingWord.trim();
    const submittedWord = state.requiredChar
      ? `${state.requiredChar}${suffix}`
      : suffix;

    if (!submittedWord) {
      setHelperText("빈 단어는 제출할 수 없습니다.");
      setValidationError("빈 단어는 제출할 수 없습니다.");
      return;
    }

    const localValidation = isValidWordSubmission(
      state,
      currentUserId,
      submittedWord,
    );

    if (!localValidation.valid) {
      setValidationError(localValidation.message);
      setHelperText("게임 규칙에 맞는 단어를 입력해 주세요.");
      return;
    }

    setValidationError(null);
    setIsValidatingWord(true);

    let dictionaryResult: ValidateWordResponse;

    try {
      const response = await fetch("/api/games/word-chain/validate-word", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word: localValidation.normalizedWord,
          requiredChar: state.requiredChar,
          usedWords: state.usedWords,
          roomId,
          sessionId,
        }),
      });

      dictionaryResult = (await response.json()) as ValidateWordResponse;
    } catch {
      setValidationError("사전 검증 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      setHelperText("사전 검증 요청에 실패했습니다.");
      setIsValidatingWord(false);
      return;
    }

    if (!dictionaryResult.ok) {
      setValidationError(dictionaryResult.message);
      setHelperText("사전 검증을 통과한 단어만 제출할 수 있습니다.");
      setIsValidatingWord(false);
      return;
    }

    const event: WordChainEvent = {
      type: "submit_word",
      playerId: currentUserId,
      word: dictionaryResult.normalizedWord,
    };
    const nextState = applyWordChainEvent(state, event);
    const eventId = crypto.randomUUID();

    seenEventIdsRef.current.add(eventId);
    setState(nextState);
    setPendingWord("");
    setValidationError(null);
    setHelperText(
      nextState.finished
        ? "라운드가 끝났습니다. 방장이 게임 종료를 눌러 세션을 마무리해 주세요."
        : `${currentUserName} 님의 단어가 사전 검증 후 반영되었습니다.`,
    );

    const payload: WordChainBroadcastPayload = {
      type: "word_chain_event",
      game_key: "word-chain",
      session_id: sessionId,
      event_id: eventId,
      event,
    };

    try {
      await channelRef.current.send({
        type: "broadcast",
        event: "game_event",
        payload: createRoomRealtimeMessage(
          "game_event",
          roomId,
          currentUserId,
          payload,
        ),
      });

      await channelRef.current.send({
        type: "broadcast",
        event: "turn_update",
        payload: createRoomRealtimeMessage("turn_update", roomId, currentUserId, {
          player_id: nextState.players[nextState.currentTurnIndex]?.id ?? currentUserId,
        }),
      });
    } catch {
      setHelperText("단어는 반영되었지만 실시간 동기화에 실패했습니다.");
    } finally {
      setIsValidatingWord(false);
    }
  };

  const winners =
    state.finished && state.winnerIds.length > 0
      ? state.players.filter((player) => state.winnerIds.includes(player.id))
      : [];
  const finalResults =
    state.finished && sessionId
      ? buildWordChainSessionResult(sessionId, state).results.map((result) => ({
          player_id: result.playerId,
          score: result.score,
          rank: result.rank,
        }))
      : [];
  const finishPayload =
    sessionId ? JSON.stringify(buildWordChainSessionResult(sessionId, state)) : "";

  const handleFinishSession = async () => {
    if (!canFinish || !sessionId || !finishFormId) {
      return;
    }

    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast",
        event: "game_end",
        payload: createRoomRealtimeMessage("game_end", roomId, currentUserId, {
          session_id: sessionId,
          results: finalResults,
        }),
      });
    }

    const form = document.getElementById(finishFormId) as HTMLFormElement | null;
    form?.requestSubmit();
  };

  const latestWord = state.usedWords.at(-1) ?? null;
  const inputPrefix = state.requiredChar ?? "";
  const canTypeWord = !submitDisabled;

  return (
    <div className="grid gap-4">
      <section className="rounded-[1.6rem] bg-[#fff8ea] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.18em] text-[#f97316]">현재 차례</p>
            <h3 className="mt-1 text-xl font-semibold text-[#26324b]">
              {state.players[state.currentTurnIndex]?.name ?? "대기 중"}
            </h3>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm text-[#4d5c7a]">
            {state.requiredChar
              ? `다음 시작 글자: ${state.requiredChar}`
              : "첫 단어를 입력해 주세요"}
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {state.players.map((player) => (
            <article
              key={player.id}
              className={`rounded-[1.4rem] px-4 py-3 text-sm ${
                player.id === state.players[state.currentTurnIndex]?.id
                  ? "bg-[#ffd666] text-[#25314b]"
                  : "bg-white text-[#4d5c7a]"
              }`}
            >
              <p className="font-medium">{player.name}</p>
              <p className="mt-1">점수 {player.score}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="rounded-[1.6rem] bg-[linear-gradient(180deg,#eff7ff_0%,#f9fcff_100%)] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.18em] text-[#4f78a6]">단어 기관차</p>
            <p className="mt-2 text-sm text-[#35516f]">
              {state.finished
                ? "이번 라운드는 끝났습니다. 방장이 게임 종료를 눌러 세션을 마무리해 주세요."
                : state.players[state.currentTurnIndex]?.id === currentUserId
                  ? "지금은 내 차례입니다. 이어질 칸을 붙여 새 단어를 완성하세요."
                  : "다른 참가자의 차례를 기다리는 중입니다."}
            </p>
          </div>
          <div className="rounded-full bg-white/90 px-3 py-1 text-xs text-[#4d5c7a]">
            {latestWord ? `직전 단어 ${latestWord}` : "첫 칸을 출발시켜 주세요"}
          </div>
        </div>
        <div className="mt-4 rounded-[1.8rem] border border-[#cfe4f6] bg-white p-3 shadow-[0_16px_40px_rgba(102,141,178,0.12)]">
          <div className="flex items-center gap-3 rounded-[1.4rem] bg-[#f4fbff] px-3 py-3">
            {inputPrefix ? (
              <div className="shrink-0 rounded-[1.1rem] bg-[#ffd666] px-4 py-3 text-lg font-semibold text-[#25314b]">
                {inputPrefix}
              </div>
            ) : null}
            <input
              aria-busy={isValidatingWord}
              className="min-w-0 flex-1 bg-transparent text-base text-[#26324b] outline-none placeholder:text-[#8ba0bd]"
              disabled={submitDisabled}
              onChange={(event) => {
                const nextValue = event.target.value;

                setValidationError(null);

                if (inputPrefix && nextValue.startsWith(inputPrefix)) {
                  setPendingWord(nextValue.slice(inputPrefix.length));
                  return;
                }

                setPendingWord(nextValue);
              }}
              placeholder={inputPrefix ? "뒤에 이어질 글자를 입력" : "첫 단어를 입력"}
              value={pendingWord}
            />
            <button
              className="shrink-0 rounded-full bg-[#22c55e] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#16a34a] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitDisabled}
              onClick={handleSubmitWord}
              type="button"
            >
              {isValidatingWord ? "검증 중..." : "단어 제출"}
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#60728f]">
            <span>
              {inputPrefix
                ? `자동 시작 글자 ${inputPrefix} 뒤에 이어 붙입니다.`
                : "첫 단어는 자유롭게 시작할 수 있습니다."}
            </span>
            <span>{canTypeWord ? "입력 가능" : "대기 중"}</span>
          </div>
        </div>
        {helperText ? (
          <p className="mt-3 text-sm text-[#35516f]">{helperText}</p>
        ) : null}
        {validationError ? (
          <p className="mt-2 text-sm text-[#b91c1c]">{validationError}</p>
        ) : null}
        {state.lastError ? (
          <p className="mt-2 text-sm text-[#b91c1c]">{state.lastError}</p>
        ) : null}
      </section>
      <section className="rounded-[1.6rem] bg-[linear-gradient(180deg,#fff9ec_0%,#fff5dd_100%)] p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#26324b]">단어 기차</h3>
          <span className="rounded-full bg-white px-3 py-1 text-sm text-[#5f6784]">
            {state.turnCount}/{state.maxTurns}턴
          </span>
        </div>
        {state.usedWords.length === 0 ? (
          <p className="mt-3 text-sm text-[#5f6784]">
            아직 제출된 단어가 없습니다. 첫 칸을 출발시키면 아래로 단어가 이어집니다.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {state.usedWords.map((word, index) => (
              <div key={`${word}-${index}`} className="relative pl-8">
                {index > 0 ? (
                  <div className="absolute left-[0.9rem] top-[-1rem] h-4 w-px bg-[#f2b64b]" />
                ) : null}
                <div className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[#f59e0b] bg-white" />
                <article
                  className={`rounded-[1.4rem] border px-4 py-3 shadow-[0_10px_30px_rgba(209,157,56,0.12)] ${
                    index === state.usedWords.length - 1
                      ? "border-[#f59e0b] bg-[#fff0c2]"
                      : "border-[#f7ddb2] bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs tracking-[0.16em] text-[#b7791f]">
                      {index === 0 ? "출발 칸" : `${index + 1}번째 칸`}
                    </p>
                    {index === state.usedWords.length - 1 ? (
                      <span className="rounded-full bg-white px-2 py-1 text-[11px] text-[#8b5b14]">
                        최신 단어
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-lg font-semibold text-[#26324b]">{word}</p>
                </article>
              </div>
            ))}
          </div>
        )}
      </section>
      {winners.length > 0 ? (
        <div className="rounded-[1.6rem] bg-[#ddf7e8] px-4 py-3 text-sm text-[#156c4c]">
          승리: {winners.map((winner) => winner.name).join(", ")}
        </div>
      ) : null}
      {canFinish && sessionId && finishFormId ? (
        <div className="grid gap-2">
          <input form={finishFormId} name="sessionId" type="hidden" value={sessionId} />
          <input
            form={finishFormId}
            name="resultPayload"
            type="hidden"
            value={finishPayload}
          />
          <button
            className="rounded-full bg-[#fb923c] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#f97316]"
            onClick={handleFinishSession}
            type="button"
          >
            세션 종료
          </button>
        </div>
      ) : null}
    </div>
  );
}
