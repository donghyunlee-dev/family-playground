import { SectionCard } from "@family-playground/ui";
import { GameCatalogCard } from "@/components/platform/game-catalog-card";
import Link from "next/link";
import { requireAppSession } from "@/lib/auth";
import { getActiveRoomForUser, listGamesWithRoomState } from "@/lib/platform";
import { getRoomPath } from "@/lib/room-routes";
import { createRoomAction } from "./actions";
import { EmptyState } from "@family-playground/ui";

const playableGameKeys = new Set<string>(["word-chain"]);

export default async function GamesPage() {
  const { user } = await requireAppSession();
  const [games, userActiveRoom] = await Promise.all([
    listGamesWithRoomState(),
    getActiveRoomForUser(user.id),
  ]);
  const launchReadyGames = games.filter((game) => playableGameKeys.has(game.gameKey));

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[1.8rem] border border-[#d8dee8] bg-white p-5 text-[#0f172a] shadow-[0_20px_50px_rgba(15,23,42,0.06)] md:rounded-[2.2rem] md:p-8">
        <p className="text-xs tracking-[0.18em] text-[#64748b]">
          GAME LIBRARY
        </p>
        <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-[-0.04em] text-balance text-[#0f172a] md:mt-3 md:text-4xl">
          함께 할 게임 고르기
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3 md:mt-6">
          <div className="rounded-[1rem] bg-[#f8fafc] px-4 py-3 text-sm text-[#334155]">
            등록된 게임 {games.length}개
          </div>
          <div className="rounded-[1rem] bg-[#f8fafc] px-4 py-3 text-sm text-[#334155]">
            플레이 가능 {launchReadyGames.length}개
          </div>
          <div className="rounded-[1rem] bg-[#f8fafc] px-4 py-3 text-sm text-[#334155]">
            {userActiveRoom ? "현재 참가 중인 방이 있습니다" : "아직 참가 중인 방이 없습니다"}
          </div>
        </div>
      </section>

      <SectionCard
        eyebrow="라인업"
        title="게임 리스트"
        description=" "
      >
        {games.length === 0 ? (
          <EmptyState
            title="등록된 게임이 없습니다"
            description="게임 패키지를 연결하면 이 목록이 채워집니다."
          />
        ) : (
        <div className="grid gap-3">
          {games.map((game) => {
            const isPlayable = playableGameKeys.has(game.gameKey);

            return (
              <GameCatalogCard
                key={game.id}
                game={game}
                isPlayable={isPlayable}
                footer={
                  isPlayable ? (
                    game.activeRoomId ? (
                      <Link
                        className="inline-flex rounded-full border border-[#ffd58c] bg-[#ffd666] px-4 py-2 text-sm font-medium text-[#25314b] transition hover:bg-[#ffc94f] hover:text-[#1f2a44]"
                        href={getRoomPath(
                          game.activeRoomId,
                          game.activeRoomStatus ?? "waiting",
                        )}
                      >
                        {game.activeRoomStatus === "playing" ? "게임 입장" : "열린 방 참가"}
                      </Link>
                    ) : userActiveRoom ? (
                      <div className="rounded-full bg-[#fff2cf] px-4 py-2 text-sm text-[#6a5b2a]">
                        현재 참가 중인 방을 나간 뒤 새 방을 만들 수 있습니다
                      </div>
                    ) : (
                      <form action={createRoomAction}>
                        <input name="gameId" type="hidden" value={game.id} />
                        <button
                          className="rounded-full border border-[#ffd58c] bg-[#ffd666] px-4 py-2 text-sm font-medium text-[#25314b] transition hover:bg-[#ffc94f] hover:text-[#1f2a44]"
                          type="submit"
                        >
                          방 만들기
                        </button>
                      </form>
                    )
                  ) : (
                    <div className="rounded-full bg-[#eef2ff] px-4 py-2 text-sm font-medium text-[#5f6784]">
                      게임 개발 전이라 아직 실행할 수 없습니다
                    </div>
                  )
                }
              />
            );
          })}
        </div>
        )}
      </SectionCard>
    </div>
  );
}
