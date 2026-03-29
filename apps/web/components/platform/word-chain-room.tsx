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
const VIRTUAL_PLAYERS: GamePlayer[] = [
  { id: `${BOT_ID_PREFIX}1`, name: "가상 지우", score: 0 },
  { id: `${BOT_ID_PREFIX}2`, name: "가상 서준", score: 0 },
  { id: `${BOT_ID_PREFIX}3`, name: "가상 하린", score: 0 },
];
const BOT_OPENERS = [
  "가족",
  "놀이",
  "친구",
  "기차",
  "웃음",
  "모험",
  "마음",
  "노래",
];
const HANGUL_SUFFIXES = [
  "나",
  "다",
  "라",
  "마",
  "바",
  "사",
  "아",
  "자",
  "차",
  "카",
  "타",
  "파",
  "하",
];
const HANGUL_EXTENSIONS = ["리", "미", "소", "루", "비", "주"];
const EN_SUFFIXES = ["ra", "ne", "ta", "ro", "mi", "sa", "li", "no"];
const EN_EXTENSIONS = ["n", "r", "s", "t", "m", "l"];

function isVirtualPlayerId(playerId: string) {
  return playerId.startsWith(BOT_ID_PREFIX);
}

function createPlayablePlayers(players: GamePlayer[]) {
  if (players.length === 1) {
    return [...players, ...VIRTUAL_PLAYERS];
  }

  return players;
}

function buildBotWord(
  requiredChar: string | null,
  usedWords: string[],
  botId: string,
) {
  const botIndex = Number(botId.replace(BOT_ID_PREFIX, "")) || 0;

  if (!requiredChar) {
    return (
      BOT_OPENERS.find((word, index) => !usedWords.includes(word) && index >= botIndex - 1) ??
      BOT_OPENERS.find((word) => !usedWords.includes(word)) ??
      `시작${botIndex}`
    );
  }

  const isEnglishPrefix = /^[a-z]$/i.test(requiredChar);
  const suffixes = isEnglishPrefix ? EN_SUFFIXES : HANGUL_SUFFIXES;
  const extensions = isEnglishPrefix ? EN_EXTENSIONS : HANGUL_EXTENSIONS;

  for (let round = 0; round < extensions.length + 1; round += 1) {
    for (let index = 0; index < suffixes.length; index += 1) {
      const suffix = suffixes[(botIndex + index) % suffixes.length]!;
      const extension = round === 0 ? "" : extensions[(round + index) % extensions.length]!;
      const candidate = `${requiredChar}${suffix}${extension}`;

      if (!usedWords.includes(candidate)) {
        return candidate;
      }
    }
  }

  return `${requiredChar}${isEnglishPrefix ? "go" : "라"}${botIndex}`;
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
        ? "테스트 모드입니다. 내가 입력하지 않는 턴은 가상 플레이어가 자동으로 진행합니다."
        : "내 차례가 오면 단어를 입력해 주세요."
      : "방장이 게임 시작을 누르면 끝말잇기가 시작됩니다.",
  );
  const [isSessionEnded, setIsSessionEnded] = useState(false);
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
    setState(createWordChainMatchState(playablePlayers));
    setPendingWord("");
    setValidationError(null);
    setHelperText(
      roomStatus === "playing"
        ? hasVirtualPlayers
          ? "테스트 모드가 다시 시작되었습니다. 입력에 집중해 보세요."
          : "게임이 시작되었습니다. 현재 차례인 사람이 단어를 제출해 주세요."
        : "방장이 게임 시작을 누르면 끝말잇기가 시작됩니다.",
    );
    seenEventIdsRef.current = new Set();
  }, [hasVirtualPlayers, playablePlayers, roomStatus, sessionId]);

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
        setHelperText(
          hasVirtualPlayers
            ? "테스트 모드가 시작되었습니다. 가상 플레이어가 빈 자리를 채웁니다."
            : "게임이 시작되었습니다. 현재 차례인 사람이 단어를 제출해 주세요.",
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

        isSessionEndedRef.current = true;
        setIsSessionEnded(true);
        setPendingWord("");
        setValidationError(null);
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
  }, [hasVirtualPlayers, roomId, sessionId]);

  const currentTurnPlayer = state.players[state.currentTurnIndex] ?? null;
  const isCurrentUserTurn = currentTurnPlayer?.id === currentUserId;
  const submitDisabled =
    roomStatus !== "playing" ||
    !sessionId ||
    isSessionEnded ||
    state.finished ||
    !isCurrentUserTurn;

  useEffect(() => {
    if (
      roomStatus !== "playing" ||
      !hasVirtualPlayers ||
      !currentTurnPlayer ||
      !isVirtualPlayerId(currentTurnPlayer.id) ||
      isSessionEnded ||
      state.finished
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const botWord = buildBotWord(
        state.requiredChar,
        state.usedWords,
        currentTurnPlayer.id,
      );
      const event: WordChainEvent = {
        type: "submit_word",
        playerId: currentTurnPlayer.id,
        word: botWord,
      };
      const nextState = applyWordChainEvent(state, event);

      setState(nextState);
      setHelperText(
        nextState.finished
          ? "테스트 라운드가 끝났습니다. 아래 버튼으로 바로 다시 시작할 수 있습니다."
          : `${currentTurnPlayer.name} 님이 "${botWord}"를 이어 붙였습니다.`,
      );
      setValidationError(null);
    }, 900);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    currentTurnPlayer,
    hasVirtualPlayers,
    isSessionEnded,
    roomStatus,
    state,
  ]);

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
      setHelperText("게임 규칙에 맞는 단어를 입력해 주세요.");
      return;
    }

    setValidationError(null);

    const event: WordChainEvent = {
      type: "submit_word",
      playerId: currentUserId,
      word: localValidation.normalizedWord,
    };
    const nextState = applyWordChainEvent(state, event);
    const eventId = crypto.randomUUID();

    seenEventIdsRef.current.add(eventId);
    setState(nextState);
    setPendingWord("");
    setHelperText(
      nextState.finished
        ? hasVirtualPlayers
          ? "테스트 라운드가 끝났습니다. 아래 버튼으로 바로 다시 시작할 수 있습니다."
          : "라운드가 끝났습니다. 방장이 게임 종료를 눌러 세션을 마무리해 주세요."
        : `${currentUserName} 님의 단어가 바로 반영되었습니다. 사전 검증은 잠시 멈춘 상태입니다.`,
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

      await channelRef.current?.send({
        type: "broadcast",
        event: "turn_update",
        payload: createRoomRealtimeMessage("turn_update", roomId, currentUserId, {
          player_id: nextState.players[nextState.currentTurnIndex]?.id ?? currentUserId,
        }),
      });
    } catch {
      setHelperText("단어는 반영되었지만 실시간 동기화에 실패했습니다.");
    }
  };

  const handleRestartLocalRound = () => {
    setState(createWordChainMatchState(playablePlayers));
    setPendingWord("");
    setValidationError(null);
    setIsSessionEnded(false);
    isSessionEndedRef.current = false;
    seenEventIdsRef.current = new Set();
    setHelperText("테스트 라운드를 다시 시작했습니다.");
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

  return (
    <div className="grid gap-4">
      <section className="rounded-[1.4rem] bg-[#edf6ff] px-4 py-3">
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-white px-3 py-1.5 text-[#35516f]">
            현재 차례 {currentTurnPlayer?.name ?? "대기 중"}
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 text-[#35516f]">
            {state.turnCount}/{state.maxTurns}턴
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 text-[#35516f]">
            {state.requiredChar ? `시작 글자 ${state.requiredChar}` : "첫 단어 입력"}
          </span>
          {hasVirtualPlayers ? (
            <span className="rounded-full bg-[#dff5e7] px-3 py-1.5 text-[#0f5132]">
              테스트 모드
            </span>
          ) : null}
        </div>
      </section>

      <section className="rounded-[2rem] bg-[linear-gradient(180deg,#fffdf8_0%,#f8fbff_100%)] p-4 shadow-[0_22px_60px_rgba(15,23,42,0.08)] md:p-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-sm font-medium tracking-[0.16em] text-[#4285f4]">
              WORD CHAIN
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[#17324e] md:text-4xl">
              {state.finished
                ? "라운드가 끝났습니다"
                : isCurrentUserTurn
                  ? "지금 단어를 입력해 주세요"
                  : `${currentTurnPlayer?.name ?? "다른 플레이어"} 님의 차례입니다`}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#5a7085] md:text-base">
              {latestWord
                ? `직전 단어는 "${latestWord}" 입니다. 이어지는 단어를 완성해 보세요.`
                : "첫 단어를 입력하면 아래 기차가 이어집니다."}
            </p>
          </div>

          <div className="mt-6 rounded-[2rem] border border-[#d9e8f6] bg-white p-4 shadow-[0_20px_45px_rgba(15,23,42,0.06)] md:p-5">
            <div className="grid gap-4">
              <div className="rounded-[1.4rem] bg-[#f4f9ff] px-4 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  {inputPrefix ? (
                    <div className="shrink-0 rounded-[1.2rem] bg-[#ffd666] px-5 py-4 text-center text-2xl font-semibold text-[#25314b]">
                      {inputPrefix}
                    </div>
                  ) : null}
                  <input
                    className="min-w-0 flex-1 rounded-[1.2rem] border border-transparent bg-white px-4 py-4 text-lg text-[#17324e] outline-none placeholder:text-[#8ba0bd] focus:border-[#bfd9f1]"
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
                    placeholder={
                      inputPrefix ? "이어질 글자를 입력해 주세요" : "첫 단어를 입력해 주세요"
                    }
                    value={pendingWord}
                  />
                  <button
                    className="rounded-full bg-[#22c55e] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#16a34a] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={submitDisabled}
                    onClick={handleSubmitWord}
                    type="button"
                  >
                    단어 제출
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#60728f]">
                  <span>
                    {inputPrefix
                      ? `${inputPrefix} 뒤에 이어질 글자만 입력합니다.`
                      : "첫 단어는 자유롭게 시작할 수 있습니다."}
                  </span>
                  <span>{isCurrentUserTurn ? "입력 가능" : "대기 중"}</span>
                </div>
              </div>

              {helperText ? (
                <p className="text-sm text-[#35516f]">{helperText}</p>
              ) : null}
              {validationError ? (
                <p className="text-sm text-[#b91c1c]">{validationError}</p>
              ) : null}
              {state.lastError ? (
                <p className="text-sm text-[#b91c1c]">{state.lastError}</p>
              ) : null}

              <div className="rounded-[1.6rem] bg-[linear-gradient(180deg,#fff9ec_0%,#fff5dd_100%)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-lg font-semibold text-[#26324b]">단어 기차</h4>
                  <span className="rounded-full bg-white px-3 py-1 text-sm text-[#5f6784]">
                    {state.usedWords.length}칸
                  </span>
                </div>
                {state.usedWords.length === 0 ? (
                  <p className="mt-3 text-sm text-[#5f6784]">
                    아직 제출된 단어가 없습니다. 첫 단어를 입력하면 아래로 이어집니다.
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
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.6rem] bg-white/90 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap gap-2">
          {state.players.map((player) => {
            const isCurrentTurn = player.id === currentTurnPlayer?.id;
            const isVirtual = isVirtualPlayerId(player.id);

            return (
              <article
                key={player.id}
                className={`min-w-[132px] rounded-[1.3rem] px-4 py-3 text-sm ${
                  isCurrentTurn
                    ? "bg-[#dff5e7] text-[#0f5132]"
                    : "bg-[#f4f9ff] text-[#35516f]"
                }`}
              >
                <p className="font-semibold">
                  {player.name} {isVirtual ? "(가상)" : ""}
                </p>
                <p className="mt-1">점수 {player.score}</p>
              </article>
            );
          })}
        </div>

        {winners.length > 0 ? (
          <div className="mt-4 rounded-[1.4rem] bg-[#ddf7e8] px-4 py-3 text-sm text-[#156c4c]">
            승리: {winners.map((winner) => winner.name).join(", ")}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {hasVirtualPlayers ? (
            <button
              className="rounded-full bg-[#17324e] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#244a6e]"
              onClick={handleRestartLocalRound}
              type="button"
            >
              테스트 라운드 다시 시작
            </button>
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
                className="rounded-full bg-[#fb923c] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#f97316]"
                onClick={handleFinishSession}
                type="button"
              >
                세션 종료
              </button>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
