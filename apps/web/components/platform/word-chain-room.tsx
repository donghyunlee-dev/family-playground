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
import type { ValidateWordResponse } from "@/lib/word-chain-dictionary/types";
import {
  applyWordChainFinalResult,
  shouldIgnoreWordChainBroadcastSession,
  type WordChainGameEndPayload,
} from "@/lib/word-chain-session";
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

const BOT_ID_PREFIX = "bot:";
const TURN_TIMEOUT_SECONDS = 20;
const VIRTUAL_PLAYERS: GamePlayer[] = [
  { id: `${BOT_ID_PREFIX}1`, name: "가상 지우", score: 0 },
  { id: `${BOT_ID_PREFIX}2`, name: "가상 서준", score: 0 },
  { id: `${BOT_ID_PREFIX}3`, name: "가상 하린", score: 0 },
];
const BOT_OPENERS = ["가족방", "놀이방", "친구들", "웃음꽃", "모험가", "노래방", "마음씨"];
const HANGUL_SUFFIXES = ["나", "다", "라", "마", "바", "사", "아", "자", "차"];
const HANGUL_EXTENSIONS = ["리", "미", "소", "루", "비", "주"];
const EN_SUFFIXES = ["ra", "ne", "ta", "ro", "mi", "sa", "li", "no"];
const EN_EXTENSIONS = ["n", "r", "s", "t", "m", "l"];

function isVirtualPlayerId(playerId: string) {
  return playerId.startsWith(BOT_ID_PREFIX);
}

function createPlayablePlayers(players: GamePlayer[]) {
  return players.length === 1 ? [...players, ...VIRTUAL_PLAYERS] : players;
}

function buildBotWordCandidates(
  requiredChar: string | null,
  usedWords: string[],
  botId: string,
) {
  const botIndex = Number(botId.replace(BOT_ID_PREFIX, "")) || 0;
  const candidates: string[] = [];

  if (!requiredChar) {
    for (let index = 0; index < BOT_OPENERS.length; index += 1) {
      const candidate = BOT_OPENERS[(botIndex + index - 1 + BOT_OPENERS.length) % BOT_OPENERS.length]!;

      if (!usedWords.includes(candidate) && !candidates.includes(candidate)) {
        candidates.push(candidate);
      }
    }

    candidates.push(`시작점${botIndex}`);
    return candidates;
  }

  const isEnglishPrefix = /^[a-z]$/i.test(requiredChar);
  const suffixes = isEnglishPrefix ? EN_SUFFIXES : HANGUL_SUFFIXES;
  const extensions = isEnglishPrefix ? EN_EXTENSIONS : HANGUL_EXTENSIONS;

  for (let round = 0; round < extensions.length + 1; round += 1) {
    for (let index = 0; index < suffixes.length; index += 1) {
      const suffix = suffixes[(botIndex + index) % suffixes.length]!;
      const extension = round === 0 ? "" : extensions[(round + index) % extensions.length]!;
      const candidate = `${requiredChar}${suffix}${extension}`;

      if (candidate.length >= 3 && !usedWords.includes(candidate) && !candidates.includes(candidate)) {
        candidates.push(candidate);
      }
    }
  }

  candidates.push(`${requiredChar}${isEnglishPrefix ? "go" : "라라"}${botIndex}`);
  return candidates;
}

async function validateWordWithDictionary(
  word: string,
  roomId: string,
  sessionId: string | null,
) {
  const response = await fetch("/api/games/word-chain/validate-word", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      word,
      roomId,
      sessionId,
    }),
  });

  if (!response.ok) {
    throw new Error("DICTIONARY_REQUEST_FAILED");
  }

  return (await response.json()) as ValidateWordResponse;
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
  const playablePlayers = useMemo(() => createPlayablePlayers(players), [players]);
  const hasVirtualPlayers = playablePlayers.some((player) =>
    isVirtualPlayerId(player.id),
  );
  const initialState = useMemo(
    () => createWordChainMatchState(playablePlayers),
    [playablePlayers],
  );
  const [state, setState] = useState<WordChainState>(initialState);
  const [pendingWord, setPendingWord] = useState("");
  const [helperText, setHelperText] = useState<string | null>(
    roomStatus === "playing"
      ? hasVirtualPlayers
        ? "테스트 모드입니다. 빈 자리는 가상 플레이어가 채웁니다."
        : "20초 안에 단어를 입력해야 합니다."
      : "게임 시작을 기다리는 중입니다.",
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidatingWord, setIsValidatingWord] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(TURN_TIMEOUT_SECONDS);
  const [turnStartedAt, setTurnStartedAt] = useState(Date.now());
  const seenEventIdsRef = useRef<Set<string>>(new Set());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const previousSessionIdRef = useRef(sessionId);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  const currentTurnPlayer = state.players[state.currentTurnIndex] ?? null;
  const isCurrentUserTurn = currentTurnPlayer?.id === currentUserId;
  const submitDisabled =
    roomStatus !== "playing" ||
    !sessionId ||
    state.finished ||
    !isCurrentUserTurn ||
    isValidatingWord;

  useEffect(() => {
    if (previousSessionIdRef.current === sessionId) {
      return;
    }

    previousSessionIdRef.current = sessionId;
    setState(createWordChainMatchState(playablePlayers));
    setPendingWord("");
    setValidationError(null);
    setRemainingSeconds(TURN_TIMEOUT_SECONDS);
    setTurnStartedAt(Date.now());
    setHelperText(
      roomStatus === "playing"
        ? hasVirtualPlayers
          ? "테스트 모드가 다시 시작되었습니다."
          : "20초 안에 단어를 입력해야 합니다."
        : "게임 시작을 기다리는 중입니다.",
    );
    seenEventIdsRef.current = new Set();
  }, [hasVirtualPlayers, playablePlayers, roomStatus, sessionId]);

  useEffect(() => {
    setRemainingSeconds(TURN_TIMEOUT_SECONDS);
    setTurnStartedAt(Date.now());
  }, [state.currentTurnIndex, state.entries.length, state.finished]);

  useEffect(() => {
    const container = logContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [state.entries.length]);

  useEffect(() => {
    if (
      roomStatus !== "playing" ||
      state.finished ||
      !currentTurnPlayer
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - turnStartedAt) / 1000);
      const nextRemaining = Math.max(0, TURN_TIMEOUT_SECONDS - elapsedSeconds);

      setRemainingSeconds(nextRemaining);

      if (
        nextRemaining === 0 &&
        (isCurrentUserTurn || isVirtualPlayerId(currentTurnPlayer.id))
      ) {
        setState((current) =>
          applyWordChainEvent(current, {
            type: "timeout_turn",
            playerId: currentTurnPlayer.id,
          }),
        );
        setPendingWord("");
        setValidationError(null);
        setHelperText(`${currentTurnPlayer.name} 님이 시간 초과로 탈락했습니다.`);
      }
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [currentTurnPlayer, isCurrentUserTurn, roomStatus, state.finished, turnStartedAt]);

  useEffect(() => {
    if (
      roomStatus !== "playing" ||
      !hasVirtualPlayers ||
      !currentTurnPlayer ||
      !isVirtualPlayerId(currentTurnPlayer.id) ||
      state.finished
    ) {
      return;
    }

    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      const botCandidates = buildBotWordCandidates(
        state.requiredChar,
        state.usedWords,
        currentTurnPlayer.id,
      );

      for (const candidate of botCandidates) {
        try {
          const dictionaryValidation = await validateWordWithDictionary(candidate, roomId, sessionId);

          if (!dictionaryValidation.ok) {
            continue;
          }

          if (cancelled) {
            return;
          }

          setState((current) =>
            applyWordChainEvent(current, {
              type: "submit_word",
              playerId: currentTurnPlayer.id,
              word: dictionaryValidation.normalizedWord,
            }),
          );
          setHelperText(
            `${currentTurnPlayer.name} 님이 "${dictionaryValidation.normalizedWord}"를 입력했습니다.`,
          );
          setValidationError(null);
          return;
        } catch {
          continue;
        }
      }

      if (cancelled) {
        return;
      }

      setHelperText(`${currentTurnPlayer.name} 님이 입력할 단어를 찾고 있습니다.`);
      setValidationError(null);
    }, 900);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [currentTurnPlayer, hasVirtualPlayers, roomId, roomStatus, sessionId, state.finished, state.requiredChar, state.usedWords]);

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

        setPendingWord("");
        setValidationError(null);
        setRemainingSeconds(TURN_TIMEOUT_SECONDS);
        setTurnStartedAt(Date.now());
        setHelperText(
          hasVirtualPlayers ? "테스트 모드가 시작되었습니다." : "라운드가 시작되었습니다.",
        );
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

        setPendingWord("");
        setValidationError(null);
        setState((current) =>
          applyWordChainFinalResult(current, gamePayload, sessionId),
        );
        setHelperText("라운드가 끝났습니다.");
      });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [hasVirtualPlayers, roomId, sessionId]);

  const handleSubmitWord = async () => {
    if (submitDisabled || !sessionId) {
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
      setHelperText("세 글자 이상, 규칙에 맞는 단어를 입력해 주세요.");
      return;
    }

    setValidationError(null);
    setIsValidatingWord(true);

    try {
      const dictionaryValidation = await validateWordWithDictionary(
        localValidation.normalizedWord,
        roomId,
        sessionId,
      );

      if (!dictionaryValidation.ok) {
        setValidationError(dictionaryValidation.message);
        setHelperText("국어사전에서 확인된 단어만 입력할 수 있습니다.");
        return;
      }

      const event: WordChainEvent = {
        type: "submit_word",
        playerId: currentUserId,
        word: dictionaryValidation.normalizedWord,
      };
      const nextState = applyWordChainEvent(state, event);
      const eventId = crypto.randomUUID();

      seenEventIdsRef.current.add(eventId);
      setState(nextState);
      setPendingWord("");
      setHelperText(
        nextState.finished
          ? "라운드가 끝났습니다."
          : `${currentUserName} 님의 단어가 반영되었습니다.`,
      );

      if (hasVirtualPlayers) {
        return;
      }

      const payload: WordChainBroadcastPayload = {
        type: "word_chain_event",
        game_key: "word-chain",
        session_id: sessionId,
        event_id: eventId,
        event,
      };

      try {
        await channelRef.current?.send({
          type: "broadcast",
          event: "game_event",
          payload: createRoomRealtimeMessage(
            "game_event",
            roomId,
            currentUserId,
            payload,
          ),
        });
      } catch {
        setHelperText("단어는 반영되었지만 실시간 동기화에 실패했습니다.");
      }
    } catch {
      setValidationError("국어사전 검증 서버에 연결할 수 없습니다.");
      setHelperText("사전 검증 후 다시 시도해 주세요.");
      return;
    } finally {
      setIsValidatingWord(false);
    }
  };

  const handleRestartLocalRound = () => {
    setState(createWordChainMatchState(playablePlayers));
    setPendingWord("");
    setValidationError(null);
    setRemainingSeconds(TURN_TIMEOUT_SECONDS);
    setTurnStartedAt(Date.now());
    setHelperText("테스트 라운드를 다시 시작했습니다.");
    seenEventIdsRef.current = new Set();
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

  const inputPrefix = state.requiredChar ?? null;
  const supportMessage = validationError ?? state.lastError ?? helperText;

  return (
    <div className="mx-auto h-[calc(100vh-13rem)] w-full max-w-6xl min-h-[560px] pb-48 md:h-[calc(100vh-11.5rem)] md:min-h-[640px] md:pb-40">
      <section className="flex h-full w-full flex-col rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,#183456_0%,#0c1220_55%,#090d16_100%)] px-4 py-5 text-white shadow-[0_30px_80px_rgba(2,6,23,0.32)] md:px-6 md:py-6">
        <div className="mb-4 text-center">
          <p className="text-base font-semibold tracking-[0.08em] text-sky-300 md:text-lg">
            끝말 잇기 게임
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {state.players.map((player) => {
            const isCurrentTurn = player.id === currentTurnPlayer?.id;
            const isWinner = state.finished && state.winnerIds.includes(player.id);

            return (
              <div
                key={player.id}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] ${
                  player.eliminated
                    ? "bg-white/5 text-slate-500 line-through"
                    : isWinner
                      ? "bg-[#dff5e7] font-semibold text-[#0f5132]"
                      : isCurrentTurn
                    ? "bg-[#dff5e7] font-semibold text-[#0f5132]"
                      : "bg-white/8 text-slate-200"
                }`}
              >
                {player.name}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex min-h-0 flex-1 flex-col rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="w-16 shrink-0" />
            <h2 className="flex-1 text-center text-lg font-semibold tracking-[-0.04em] md:text-2xl">
              {state.finished ? "라운드 종료" : "단어 입력"}
            </h2>
            <span
              className={`w-16 shrink-0 rounded-full px-3 py-1.5 text-center text-xs font-semibold ${
                remainingSeconds <= 3 ? "bg-[#fecaca] text-[#7f1d1d]" : "bg-[#ffd666] text-[#25314b]"
              }`}
            >
              {remainingSeconds}초
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[1rem] border border-white/8 bg-white/5 px-3 py-2 text-xs md:text-sm">
            {inputPrefix ? (
              <span className="rounded-full bg-sky-400/15 px-2.5 py-1 font-semibold text-sky-100">
                시작 글자 {inputPrefix}
              </span>
            ) : null}
            {supportMessage ? (
              <span
                className={
                  validationError || state.lastError ? "text-[#fca5a5]" : "text-slate-300"
                }
              >
                {supportMessage}
              </span>
            ) : (
              <span className="text-slate-400">세 글자 이상 단어를 입력해 주세요.</span>
            )}
          </div>

          <div
            ref={logContainerRef}
            className="scrollbar-hidden mt-3 min-h-0 flex-1 overflow-y-auto rounded-[1.4rem] border border-white/8 bg-black/10 px-3 py-3 md:px-4"
          >
            {state.entries.length === 0 ? (
              <div className="flex h-full items-center justify-center px-6 text-center text-slate-400">
                아직 입력된 단어가 없습니다.
              </div>
            ) : (
              <div className="grid gap-2">
                {state.entries.map((entry, index) => {
                  const speaker = state.players.find((player) => player.id === entry.playerId);
                  const isCurrentUserEntry = entry.playerId === currentUserId;

                  return (
                    <div
                      key={`${entry.playerId}-${entry.word}-${index}`}
                      className={`flex items-center gap-2 text-sm ${
                        isCurrentUserEntry ? "justify-end" : "justify-start"
                      }`}
                    >
                    {!isCurrentUserEntry ? (
                      <span className="shrink-0 rounded-full bg-white/6 px-2.5 py-1 text-[11px] text-slate-300">
                        {speaker?.name ?? "알 수 없음"}
                      </span>
                    ) : null}
                      <div
                        className={`rounded-full px-4 py-2 ${
                          isCurrentUserEntry
                            ? "bg-sky-400 text-slate-950"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        {entry.word}
                      </div>
                      {isCurrentUserEntry ? (
                        <span className="shrink-0 rounded-full bg-sky-400/15 px-2.5 py-1 text-[11px] text-sky-100">
                          {speaker?.name ?? currentUserName}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 md:px-4 md:pb-4">
        <section className="pointer-events-auto mx-auto w-full max-w-6xl rounded-[1.4rem] border border-white/10 bg-[rgba(10,15,26,0.92)] p-3 text-white shadow-[0_18px_40px_rgba(2,6,23,0.25)] backdrop-blur">
          <div className="mb-2 flex flex-wrap gap-2">
            {winners.length > 0 ? (
              <div className="rounded-full bg-[#dff5e7] px-3 py-1.5 text-xs font-semibold text-[#0f5132]">
                승리 {winners.map((winner) => winner.name).join(", ")}
              </div>
            ) : null}
            {hasVirtualPlayers ? (
              <button
                className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/14"
                onClick={handleRestartLocalRound}
                type="button"
              >
                테스트 다시 시작
              </button>
            ) : null}
            {hasVirtualPlayers ? (
              <span className="rounded-full bg-[#dff5e7] px-3 py-1.5 text-xs font-semibold text-[#0f5132]">
                테스트 모드
              </span>
            ) : null}
            {canFinish && sessionId && finishFormId && !hasVirtualPlayers ? (
              <>
                <input form={finishFormId} name="sessionId" type="hidden" value={sessionId} />
                <input
                  form={finishFormId}
                  name="resultPayload"
                  type="hidden"
                  value={finishPayload}
                />
                <button
                  className="rounded-full bg-[#fb923c] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#f97316]"
                  onClick={handleFinishSession}
                  type="button"
                >
                  세션 종료
                </button>
              </>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex min-w-0 flex-1 items-center rounded-full border border-white/10 bg-white/8 focus-within:border-sky-400">
              {inputPrefix ? (
                <span className="shrink-0 pl-4 text-sm font-semibold text-sky-200">{inputPrefix}</span>
              ) : null}
              <input
                className={`min-w-0 flex-1 rounded-full bg-transparent py-3 text-base text-white outline-none placeholder:text-slate-400 ${
                  inputPrefix ? "pl-2 pr-4" : "px-4"
                }`}
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
                placeholder={inputPrefix ? "이어질 글자를 입력" : "단어를 입력"}
                value={pendingWord}
              />
            </div>
            <button
              className="rounded-full bg-[#22c55e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#16a34a] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitDisabled}
              onClick={handleSubmitWord}
              type="button"
            >
              입력
            </button>
          </div>

        </section>
      </div>
    </div>
  );
}
