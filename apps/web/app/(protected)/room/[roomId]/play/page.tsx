import { WordChainRoom } from "@/components/platform/word-chain-room";
import type { GamePlayer } from "@family-playground/types";
import { EmptyState, SectionCard } from "@family-playground/ui";
import { requireAppSession } from "@/lib/auth";
import { getRoomById } from "@/lib/platform";
import { getRoomPath } from "@/lib/room-routes";
import Link from "next/link";
import { redirect } from "next/navigation";
import { finishRoomAction, leaveRoomAction } from "../actions";

interface RoomPlayPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function RoomPlayPage({ params }: RoomPlayPageProps) {
  const { roomId } = await params;
  const { user, profile } = await requireAppSession();
  const room = await getRoomById(roomId);
  const finishFormId = `finish-session-${roomId}`;

  if (!room) {
    return (
      <SectionCard
        eyebrow="게임"
        title="게임 방을 찾을 수 없습니다"
        description="이미 닫혔거나 접근할 수 없는 방입니다."
      >
        <EmptyState
          title="사라진 게임입니다"
          description="로비로 돌아가서 새 대기방을 열어 주세요."
        />
      </SectionCard>
    );
  }

  if (room.status !== "playing") {
    redirect(getRoomPath(room.id, room.status));
  }

  const isMember = room.players.some((player) => player.userId === user.id);
  const canFinish = room.hostUserId === user.id;
  const isWordChain = room.gameKey === "word-chain";

  if (!isMember) {
    return (
      <SectionCard
        eyebrow="플레이"
        title="참가 중인 가족만 플레이할 수 있습니다"
        description="이미 시작된 세션에는 현재 참가자만 접근할 수 있습니다."
      >
        <EmptyState
          title="플레이 권한이 없습니다"
          description="로비로 돌아가 다른 방을 확인하거나 새 대기방을 열어 주세요."
        />
        <div className="mt-4">
          <Link
            className="inline-flex rounded-full border border-[#d8dee8] bg-white px-4 py-2.5 text-sm font-medium text-[#25314b] transition hover:bg-[#f8fafc]"
            href="/lobby"
          >
            로비로 이동
          </Link>
        </div>
      </SectionCard>
    );
  }

  const gamePlayers: GamePlayer[] = room.players.map((player) => ({
    id: player.userId,
    name: player.displayName,
    score: 0,
  }));

  if (isWordChain) {
    return (
      <div className="mx-auto grid max-w-6xl gap-4">
        <WordChainRoom
          canFinish={canFinish}
          currentUserId={user.id}
          currentUserName={profile.displayName}
          finishFormId={finishFormId}
          players={gamePlayers}
          roomId={room.id}
          roomStatus={room.status}
          sessionId={room.currentSessionId}
        />

        <details className="rounded-[1.4rem] border border-white/10 bg-[rgba(12,18,31,0.78)] p-4 text-slate-100 shadow-[0_14px_30px_rgba(2,6,23,0.28)] backdrop-blur">
          <summary className="cursor-pointer list-none text-sm font-semibold text-[#17324e]">
            <span className="text-slate-100">보조 정보 보기</span>
          </summary>
          <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-2 text-sm text-slate-300">
              <div className="rounded-[1.1rem] bg-white/8 px-4 py-3">
                방장: {room.hostName}
              </div>
              <div className="rounded-[1.1rem] bg-white/8 px-4 py-3">
                세션: {room.currentSessionId}
              </div>
              <div className="rounded-[1.1rem] bg-white/8 px-4 py-3">
                실제 참가 인원: {room.players.length}/{room.maxPlayers}
              </div>
              {isMember ? (
                <form action={leaveRoomAction.bind(null, room.id)}>
                  <button
                    className="w-full rounded-full border border-white/12 bg-white/8 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/12"
                    type="submit"
                  >
                    방 나가기
                  </button>
                </form>
              ) : null}
            </div>
            <div className="grid gap-2">
              {room.players.map((player) => (
                <article
                  key={player.id}
                  className="flex items-center justify-between rounded-[1.1rem] bg-white/8 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-white">{player.displayName}</p>
                    <p className="mt-1 text-xs tracking-[0.16em] text-sky-300">
                      {player.isHost ? "방장" : "참가자"}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                    {player.presenceStatus === "online"
                      ? "접속 중"
                      : player.presenceStatus === "away"
                        ? "잠시 비움"
                        : "상태 확인 중"}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </details>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-[1.08fr_0.92fr]">
      <div className="grid gap-6">
        <SectionCard
          eyebrow="플레이"
          title={room.gameTitle}
          description=" "
        >
          {room.gameKey === "word-chain" ? (
            <WordChainRoom
              canFinish={canFinish}
              currentUserId={user.id}
              currentUserName={profile.displayName}
              finishFormId={finishFormId}
              players={gamePlayers}
              roomId={room.id}
              roomStatus={room.status}
              sessionId={room.currentSessionId}
            />
          ) : (
            <EmptyState
              title="아직 게임 화면이 없습니다"
              description="이 게임은 플레이 화면 분리가 아직 끝나지 않았습니다."
            />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6">
        <SectionCard
          eyebrow="방 정보"
          title="게임 중인 방"
          description="혼자 시작했더라도 이 화면에서 바로 플레이를 이어갑니다."
        >
          <div className="grid gap-2 text-sm text-[#5f6784]">
            <div className="rounded-[1.5rem] bg-[#fff9ec] px-4 py-3">
              방장: {room.hostName}
            </div>
            <div className="rounded-[1.5rem] bg-[#fff9ec] px-4 py-3">
              세션: {room.currentSessionId}
            </div>
            <div className="rounded-[1.5rem] bg-[#fff9ec] px-4 py-3">
              인원: {room.players.length}/{room.maxPlayers}
            </div>
          </div>
          <div
            aria-live="polite"
            className="mt-4 rounded-[1.5rem] bg-[#eef8ff] px-4 py-3 text-sm text-[#35516f]"
          >
            {canFinish
              ? "방장으로서 세션 종료와 결과 반영을 마무리할 수 있습니다."
              : "게임 시작 이후에는 이 화면에서 진행 상황을 함께 확인합니다."}
          </div>
          {canFinish && room.gameKey === "word-chain" ? (
            <form
              action={finishRoomAction.bind(null, room.id)}
              className="hidden"
              id={finishFormId}
            />
          ) : null}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {canFinish && room.gameKey !== "word-chain" ? (
              <form action={finishRoomAction.bind(null, room.id)}>
                <button
                  className="w-full rounded-full bg-[#fb923c] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#f97316]"
                  type="submit"
                >
                  세션 종료
                </button>
              </form>
            ) : null}
            {isMember ? (
              <form action={leaveRoomAction.bind(null, room.id)}>
                <button
                  className="w-full rounded-full border border-[#fecaca] bg-[#fef2f2] px-4 py-2.5 text-sm font-medium text-[#b91c1c] transition hover:bg-[#fee2e2] hover:text-[#991b1b]"
                  type="submit"
                >
                  방 나가기
                </button>
              </form>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="참가자"
          title="현재 플레이어"
          description="게임 시작 후에는 이 화면에서만 플레이합니다."
        >
          <div className="space-y-3">
            {room.players.map((player) => (
              <article
                key={player.id}
                className="flex items-center justify-between rounded-[1.4rem] bg-[#fff9ec] px-4 py-3 text-sm md:rounded-[1.6rem]"
              >
                <div>
                  <p className="font-medium text-[#26324b]">{player.displayName}</p>
                  <p className="mt-1 text-xs tracking-[0.16em] text-[#f97316]">
                    {player.isHost ? "방장" : "참가자"}
                  </p>
                </div>
                <span className="rounded-full bg-[#ddf7e8] px-3 py-1 text-xs font-medium text-[#156c4c]">
                  {player.presenceStatus === "online"
                    ? "접속 중"
                    : player.presenceStatus === "away"
                      ? "잠시 비움"
                      : "상태 확인 중"}
                </span>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
