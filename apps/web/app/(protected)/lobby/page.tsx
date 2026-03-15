import { EmptyState, SectionCard } from "@family-playground/ui";
import { RoomList } from "@/components/platform/room-list";
import Link from "next/link";
import { listGames, listOpenRooms } from "@/lib/platform";

export default async function LobbyPage() {
  const [games, rooms] = await Promise.all([listGames(), listOpenRooms()]);

  return (
    <div className="grid gap-6">
      <section className="rounded-[2.4rem] border border-[#ffdca8] bg-[#fffdf9] p-6 text-[#26324b] shadow-[0_26px_80px_rgba(245,158,11,0.14)] md:p-8">
        <p className="text-xs tracking-[0.24em] text-[#f97316]">로비</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-balance">
          게임 목록에서 방을 찾고
          <br />
          바로 같이 모이면 됩니다
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#4d5c7a]">
          로비에서는 열린 방과 등록된 게임만 간단하게 보여 줍니다. 로그인
          테스트를 할 때는 위쪽 로그아웃 버튼으로 계정을 바로 바꿀 수 있습니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="rounded-full bg-[#fff2cf] px-4 py-2 text-sm text-[#5d4a1d]">
            열린 방 {rooms.length}개
          </div>
          <div className="rounded-full bg-[#eef8ff] px-4 py-2 text-sm text-[#35516f]">
            등록된 게임 {games.length}개
          </div>
        </div>
      </section>

      <SectionCard
        eyebrow="게임"
        title="등록된 게임"
        description="지금 보이는 게임 목록에서 방이 열려 있는지 확인하고 바로 이동할 수 있습니다."
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
                  className="rounded-[1.7rem] border border-[#ffe2b4] bg-[#fff8ea] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-[#26324b]">{game.title}</h3>
                      <p className="mt-2 text-sm text-[#5f6784]">
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
                  <p className="mt-3 text-sm leading-7 text-[#5f6784]">{game.description}</p>
                  <div className="mt-4">
                    {room ? (
                      <Link
                        className="inline-flex rounded-full border border-[#ffd58c] bg-[#ffd666] px-4 py-2 text-sm font-medium text-[#25314b] transition hover:bg-[#ffc94f] hover:text-[#1f2a44]"
                        href={`/room/${room.id}`}
                      >
                        열린 방으로 이동
                      </Link>
                    ) : (
                      <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm text-[#6b728c]">
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
