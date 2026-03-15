import { EmptyState, SectionCard } from "@family-playground/ui";
import { RoomList } from "@/components/platform/room-list";
import Link from "next/link";
import { listGames, listOpenRooms } from "@/lib/platform";

export default async function LobbyPage() {
  const [games, rooms] = await Promise.all([listGames(), listOpenRooms()]);

  return (
    <div className="grid gap-6">
      <section className="rounded-[1.8rem] border border-[#ffdca8] bg-[#fffdf9] p-4 text-[#26324b] shadow-[0_18px_42px_rgba(245,158,11,0.1)] md:rounded-[2.4rem] md:p-8 md:shadow-[0_26px_80px_rgba(245,158,11,0.14)]">
        <p className="text-xs tracking-[0.24em] text-[#f97316]">로비</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-balance md:mt-3 md:text-4xl">
          게임을 고르고 바로 모이기
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4d5c7a] md:mt-4 md:leading-7">
          열린 방과 게임 목록만 간단히 보여 줍니다.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 md:mt-6 md:flex md:flex-wrap md:gap-3">
          <div className="rounded-[1rem] bg-[#fff2cf] px-4 py-2 text-center text-sm text-[#5d4a1d] md:rounded-full">
            열린 방 {rooms.length}개
          </div>
          <div className="rounded-[1rem] bg-[#eef8ff] px-4 py-2 text-center text-sm text-[#35516f] md:rounded-full">
            등록된 게임 {games.length}개
          </div>
        </div>
      </section>

      <SectionCard
        eyebrow="게임"
        title="등록된 게임"
        description="방이 열려 있으면 바로 들어갈 수 있습니다."
      >
        {games.length === 0 ? (
          <EmptyState
            title="등록된 게임이 없습니다"
            description="게임 패키지를 연결하면 이 목록이 먼저 채워집니다."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {games.map((game) => {
              const room = rooms.find((item) => item.gameId === game.id);

              return (
                <article
                  key={game.id}
                  className="rounded-[1.4rem] border border-[#ffe2b4] bg-[#fff8ea] p-4 md:rounded-[1.7rem] md:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[#26324b] md:text-xl">{game.title}</h3>
                      <p className="mt-1.5 text-sm text-[#5f6784] md:mt-2">
                        {game.minPlayers}명 ~ {game.maxPlayers}명
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        room
                          ? "bg-[#ddf7e8] text-[#156c4c]"
                          : "bg-white text-[#6b728c]"
                      }`}
                    >
                      {room ? "방 열림" : "준비 중"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#5f6784]">{game.description}</p>
                  <div className="mt-3">
                    {room ? (
                      <Link
                        className="inline-flex w-full items-center justify-center rounded-full border border-[#ffd58c] bg-[#ffd666] px-4 py-2.5 text-sm font-medium text-[#25314b] transition hover:bg-[#ffc94f] hover:text-[#1f2a44] sm:w-auto"
                        href={`/room/${room.id}`}
                      >
                        열린 방으로 이동
                      </Link>
                    ) : (
                      <span className="inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm text-[#6b728c] sm:w-auto">
                        아직 열린 방이 없습니다
                      </span>
                    )}
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
        description="누가 먼저 방을 만들었는지 확인하고 바로 같은 방으로 들어갑니다."
      >
        <RoomList rooms={rooms} />
      </SectionCard>
    </div>
  );
}
