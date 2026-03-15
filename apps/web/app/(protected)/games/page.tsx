import { SectionCard } from "@family-playground/ui";
import { GameCatalogCard } from "@/components/platform/game-catalog-card";
import Link from "next/link";
import { requireAppSession } from "@/lib/auth";
import { getActiveRoomForUser, listGamesWithRoomState } from "@/lib/platform";
import { createRoomAction } from "./actions";
import { EmptyState } from "@family-playground/ui";

const playableGameKeys = new Set<string>();

export default async function GamesPage() {
  const { user } = await requireAppSession();
  const [games, userActiveRoom] = await Promise.all([
    listGamesWithRoomState(),
    getActiveRoomForUser(user.id),
  ]);
  const launchReadyGames = games.filter((game) => playableGameKeys.has(game.gameKey));

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[1.8rem] border border-[#ffdca8] bg-[#fffdf9] p-4 text-[#26324b] shadow-[0_18px_42px_rgba(245,158,11,0.1)] md:rounded-[2.4rem] md:p-8 md:shadow-[0_26px_80px_rgba(245,158,11,0.14)]">
        <p className="text-xs tracking-[0.24em] text-[#f97316]">
          게임 목록
        </p>
        <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-[-0.04em] text-balance md:mt-3 md:text-4xl">
          게임 선택
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#4d5c7a] md:mt-4 md:text-base md:leading-7">
          준비된 게임이 생기면 여기서 같은 방으로 모입니다.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 md:mt-6 md:flex md:flex-wrap md:gap-3">
          <div className="rounded-[1rem] bg-white/72 px-4 py-2 text-sm text-[#34415f] md:rounded-full">
            등록된 게임 {games.length}개
          </div>
          <div className="rounded-[1rem] bg-white/72 px-4 py-2 text-sm text-[#34415f] md:rounded-full">
            플레이 가능 {launchReadyGames.length}개
          </div>
          <div className="rounded-[1rem] bg-white/72 px-4 py-2 text-sm text-[#34415f] md:rounded-full">
            {userActiveRoom ? "현재 참가 중인 방이 있습니다" : "아직 참가 중인 방이 없습니다"}
          </div>
        </div>
      </section>

      <SectionCard
        eyebrow="상태"
        title="지금은 준비 단계"
        description="실제 플레이 가능한 게임은 아직 없습니다."
      >
        {launchReadyGames.length === 0 ? (
          <EmptyState
            title="아직 플레이 가능한 게임이 없습니다"
            description="플랫폼 화면과 로그인, 방 구조를 먼저 정리한 뒤 메모리 카드나 끝말잇기 같은 실제 게임을 연결할 예정입니다."
          />
        ) : null}
      </SectionCard>

      <SectionCard
        eyebrow="예정"
        title="준비 중인 게임"
        description="게임 패키지는 등록되어 있지만 아직 실행되지는 않습니다."
      >
        <div className="grid gap-4 lg:grid-cols-2">
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
                        href={`/room/${game.activeRoomId}`}
                      >
                        열린 방 참가
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
      </SectionCard>
    </div>
  );
}
