import { EmptyState, SectionCard } from "@family-playground/ui";
import { RoomRealtimePanel } from "@/components/platform/room-realtime-panel";
import { requireAppSession } from "@/lib/auth";
import { getRoomById } from "@/lib/platform";
import { getRoomPath } from "@/lib/room-routes";
import { redirect } from "next/navigation";
import { joinRoomAction, leaveRoomAction, startRoomAction } from "./actions";

interface RoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomId } = await params;
  const { user, profile } = await requireAppSession();
  const room = await getRoomById(roomId);

  if (!room) {
    return (
      <SectionCard
        eyebrow="방"
        title="방을 찾을 수 없습니다"
        description="요청한 방이 없거나 이미 닫힌 상태입니다."
      >
        <EmptyState
          title="사라진 방입니다"
          description="로비로 돌아가서 게임 목록에서 새 방을 열어 주세요."
        />
      </SectionCard>
    );
  }

  if (room.status === "playing") {
    redirect(getRoomPath(room.id, room.status));
  }

  const isMember = room.players.some((player) => player.userId === user.id);
  const canJoin =
    room.status === "waiting" && !isMember && room.players.length < room.maxPlayers;
  const canStart =
    room.status === "waiting" &&
    room.hostUserId === user.id &&
    room.players.length >= room.minPlayers;
  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-[1.02fr_0.98fr]">
      <div className="grid gap-6">
        <section className="rounded-[1.8rem] border border-[#ffdca8] bg-[#fffdf9] p-4 text-[#26324b] shadow-[0_18px_42px_rgba(245,158,11,0.1)] md:rounded-[2.4rem] md:p-8 md:shadow-[0_26px_80px_rgba(245,158,11,0.14)]">
          <p className="text-xs tracking-[0.24em] text-[#f97316]">
            게임 방
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-balance md:mt-3 md:text-4xl">
            {room.gameTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4d5c7a] md:mt-4 md:leading-7">
            가족이 모이면 여기서 바로 시작합니다.
          </p>
          <div className="mt-4 grid gap-2 md:mt-6 md:grid-cols-2 md:gap-3">
            <div className="rounded-[1.6rem] bg-white/72 px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
              <p className="text-sm text-[#f97316]">상태</p>
              <p className="mt-1.5 text-xl font-semibold text-[#26324b] md:mt-2 md:text-2xl">
                {room.status === "waiting" ? "대기 중" : "종료됨"}
              </p>
            </div>
            <div className="rounded-[1.6rem] bg-white/72 px-4 py-4 shadow-[0_12px_28px_rgba(144,219,244,0.16)]">
              <p className="text-sm text-[#f97316]">인원</p>
              <p className="mt-1.5 text-xl font-semibold text-[#26324b] md:mt-2 md:text-2xl">
                {room.players.length}/{room.maxPlayers}
              </p>
            </div>
          </div>
        </section>

        <SectionCard
          eyebrow="진행"
          title="방 관리 버튼"
          description="여기서 참가와 시작을 관리합니다."
        >
          <RoomRealtimePanel
            roomId={room.id}
            gameId={room.gameId}
            userId={user.id}
            displayName={profile.displayName}
            roomStatus={room.status}
            currentSessionId={room.currentSessionId}
            isHost={room.hostUserId === user.id}
          />
          <div className="grid gap-2 text-sm text-[#5f6784] md:gap-3">
            <div className="rounded-[1.5rem] bg-[#fff9ec] px-4 py-3">
              방장: {room.hostName}
            </div>
            <div className="rounded-[1.5rem] bg-[#fff9ec] px-4 py-3">
              현재 세션: {room.currentSessionId ?? "아직 시작 전"}
            </div>
            <div className="rounded-[1.5rem] bg-[#fff9ec] px-4 py-3">
              시작 조건: 최소 {room.minPlayers}명이 방에 있어야 합니다
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 md:mt-6 md:flex md:flex-wrap md:gap-3">
            {canJoin ? (
              <form action={joinRoomAction.bind(null, room.id)}>
                <button
                  className="w-full rounded-full border border-[#ffd58c] bg-[#ffd666] px-4 py-2.5 text-sm font-medium text-[#25314b] transition hover:bg-[#ffc94f] hover:text-[#1f2a44]"
                  type="submit"
                >
                  방 참가하기
                </button>
              </form>
            ) : null}
            {canStart ? (
              <form action={startRoomAction.bind(null, room.id)}>
                <button
                  className="w-full rounded-full bg-[#22c55e] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#16a34a]"
                  type="submit"
                >
                  게임 시작
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
      </div>

      <SectionCard
        eyebrow="참가자"
        title="방에 들어와 있는 가족"
        description="현재 방 참가자"
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
  );
}
