import { EmptyState, SectionCard } from "@family-playground/ui";
import { RoomList } from "@/components/platform/room-list";
import Link from "next/link";
import { requireAppSession } from "@/lib/auth";
import { getRoomPath } from "@/lib/room-routes";
import { getActiveRoomForUser, listGames, listOpenRooms } from "@/lib/platform";

export default async function LobbyPage() {
  const { user } = await requireAppSession();
  const [games, rooms, activeRoom] = await Promise.all([
    listGames(),
    listOpenRooms(),
    getActiveRoomForUser(user.id),
  ]);

  return (
    <div className="grid gap-6">
      <section className="rounded-[1.8rem] border border-[#ffdca8] bg-[#fffdf9] p-4 text-[#26324b] shadow-[0_18px_42px_rgba(245,158,11,0.1)] md:rounded-[2.4rem] md:p-8 md:shadow-[0_26px_80px_rgba(245,158,11,0.14)]">
        <p className="text-xs tracking-[0.24em] text-[#f97316]">로비</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-balance md:mt-3 md:text-4xl">
          게임 로비
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-2 md:mt-6 md:flex md:flex-wrap md:gap-3">
          <div className="rounded-[1rem] bg-[#fff2cf] px-4 py-2 text-center text-sm text-[#5d4a1d] md:rounded-full">
            열린 방 {rooms.length}개
          </div>
          <div className="rounded-[1rem] bg-[#eef8ff] px-4 py-2 text-center text-sm text-[#35516f] md:rounded-full">
            등록된 게임 {games.length}개
          </div>
        </div>
      </section>

      {activeRoom ? (
        <SectionCard
          eyebrow="바로 이어하기"
          title="현재 참가 중인 방"
          description="가장 먼저 돌아가야 할 진행 중 컨텍스트입니다."
        >
          <div className="flex flex-col gap-3 rounded-[1.5rem] bg-[#fff9ec] px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-[#f97316]">
                {activeRoom.status === "playing" ? "게임 진행 중" : "대기 중"}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-[#26324b]">
                {activeRoom.gameTitle}
              </h3>
              <p className="mt-1 text-sm text-[#5f6784]">
                방장 {activeRoom.hostName} · 인원 {activeRoom.players.length}/
                {activeRoom.maxPlayers}
              </p>
            </div>
            <Link
              className="inline-flex w-full items-center justify-center rounded-full border border-[#ffd58c] bg-[#ffd666] px-4 py-2.5 text-sm font-medium text-[#25314b] transition hover:bg-[#ffc94f] hover:text-[#1f2a44] md:w-auto"
              href={getRoomPath(activeRoom.id, activeRoom.status)}
            >
              {activeRoom.status === "playing" ? "게임으로 복귀" : "대기방으로 이동"}
            </Link>
          </div>
        </SectionCard>
      ) : null}

      <SectionCard
        eyebrow="게임"
        title="빠른 게임 목록"
        description=" "
      >
        {games.length === 0 ? (
          <EmptyState
            title="등록된 게임이 없습니다"
            description="게임 패키지를 연결하면 이 목록이 먼저 채워집니다."
          />
        ) : (
          <div className="grid gap-3">
            {games.map((game) => {
              const room = rooms.find((item) => item.gameId === game.id);

              return (
                <article
                  key={game.id}
                  className="rounded-[1.5rem] border border-[#d8dee8] bg-white p-4 shadow-[0_16px_30px_rgba(15,23,42,0.05)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-end rounded-[1.2rem] bg-[linear-gradient(160deg,#1f2937,#475569)] p-3 text-white">
                      <div>
                        <p className="text-[10px] tracking-[0.2em] text-white/70">GAME</p>
                        <p className="mt-1 text-lg font-semibold">{game.title.slice(0, 2).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-[#0f172a] md:text-xl">{game.title}</h3>
                          <p className="mt-1.5 text-sm text-[#475569]">
                            {game.description}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            room
                              ? "bg-[#e6f6ec] text-[#17603a]"
                              : "bg-[#eef2f6] text-[#526173]"
                          }`}
                        >
                          {room ? "방 열림" : "준비 중"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[#64748b]">
                        {game.minPlayers}명 ~ {game.maxPlayers}명
                      </p>
                      <div className="mt-3">
                        {room ? (
                          <Link
                            className="inline-flex w-full items-center justify-center rounded-full border border-[#d8dee8] bg-[#0f172a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1e293b] sm:w-auto"
                            href={getRoomPath(room.id, room.status)}
                          >
                            열린 방으로 이동
                          </Link>
                        ) : (
                          <span className="inline-flex w-full items-center justify-center rounded-full bg-[#f8fafc] px-4 py-2.5 text-sm text-[#64748b] sm:w-auto">
                            아직 열린 방이 없습니다
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard
        eyebrow="방"
        title="현재 열려 있는 방"
        description=" "
      >
        <RoomList rooms={rooms} />
      </SectionCard>
    </div>
  );
}
