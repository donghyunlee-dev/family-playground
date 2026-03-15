import { EmptyState, SectionCard } from "@family-playground/ui";
import { requireAppSession } from "@/lib/auth";
import { getRoomById } from "@/lib/platform";
import { finishRoomAction, joinRoomAction, leaveRoomAction, startRoomAction } from "./actions";

interface RoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomId } = await params;
  const { user } = await requireAppSession();
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

  const isMember = room.players.some((player) => player.userId === user.id);
  const canJoin =
    room.status === "waiting" && !isMember && room.players.length < room.maxPlayers;
  const canStart =
    room.status === "waiting" &&
    room.hostUserId === user.id &&
    room.players.length >= room.minPlayers;
  const canFinish = room.status === "playing" && room.hostUserId === user.id;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
      <div className="grid gap-6">
        <section className="rounded-[2.4rem] border border-[#ffdca8] bg-[linear-gradient(135deg,_#fff4d2_0%,_#ffc7d8_50%,_#caedff_100%)] p-6 text-[#26324b] shadow-[0_26px_80px_rgba(245,158,11,0.14)] md:p-8">
          <p className="text-xs tracking-[0.24em] text-[#f97316]">
            게임 방
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-balance">
            {room.gameTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#4d5c7a]">
            이 방은 해당 게임에 연결된 대기 공간입니다. 가족이 모이면 여기서
            시작하고, 한 판이 끝나도 누군가 남아 있으면 같은 방에서 다시 즐길 수
            있습니다.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.6rem] bg-white/72 px-4 py-4 shadow-[0_12px_28px_rgba(255,143,171,0.12)]">
              <p className="text-sm text-[#f97316]">상태</p>
              <p className="mt-2 text-2xl font-semibold text-[#26324b]">
                {room.status === "waiting"
                  ? "대기 중"
                  : room.status === "playing"
                    ? "진행 중"
                    : "종료됨"}
              </p>
            </div>
            <div className="rounded-[1.6rem] bg-white/72 px-4 py-4 shadow-[0_12px_28px_rgba(144,219,244,0.16)]">
              <p className="text-sm text-[#f97316]">인원</p>
              <p className="mt-2 text-2xl font-semibold text-[#26324b]">
                {room.players.length}/{room.maxPlayers}
              </p>
            </div>
          </div>
        </section>

        <SectionCard
          eyebrow="진행"
          title="방 관리 버튼"
          description="실제 게임 화면이 붙기 전까지는 이 화면에서 방 참가, 시작, 종료를 관리합니다."
        >
          <div className="grid gap-3 text-sm text-[#5f6784]">
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
          <div className="mt-6 flex flex-wrap gap-3">
            {canJoin ? (
              <form action={joinRoomAction.bind(null, room.id)}>
                <button
                  className="rounded-full border border-[#ffd58c] bg-[#ffd666] px-4 py-2 text-sm font-medium text-[#25314b] transition hover:bg-[#ffc94f] hover:text-[#1f2a44]"
                  type="submit"
                >
                  방 참가하기
                </button>
              </form>
            ) : null}
            {canStart ? (
              <form action={startRoomAction.bind(null, room.id)}>
                <button
                  className="rounded-full bg-[#22c55e] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#16a34a]"
                  type="submit"
                >
                  게임 시작
                </button>
              </form>
            ) : null}
            {canFinish ? (
              <form action={finishRoomAction.bind(null, room.id)}>
                <button
                  className="rounded-full bg-[#fb923c] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#f97316]"
                  type="submit"
                >
                  게임 종료
                </button>
              </form>
            ) : null}
            {isMember ? (
              <form action={leaveRoomAction.bind(null, room.id)}>
                <button
                  className="rounded-full border border-[#fecdd3] bg-[#fff1f3] px-4 py-2 text-sm font-medium text-[#be123c] transition hover:bg-[#ffe4e6] hover:text-[#9f1239]"
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
        description="현재는 방 단위로 참가 여부를 기록하고 있으며, 다음 단계에서 실시간 상태와 연결됩니다."
      >
        <div className="space-y-3">
          {room.players.map((player) => (
            <article
              key={player.id}
              className="flex items-center justify-between rounded-[1.6rem] bg-[#fff9ec] px-4 py-3 text-sm"
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
