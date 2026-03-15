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
      <section className="overflow-hidden rounded-[2.4rem] border border-[#ffdca8] bg-[linear-gradient(135deg,_#fff4d2_0%,_#ffc7d8_48%,_#caedff_100%)] p-6 text-[#26324b] shadow-[0_26px_80px_rgba(245,158,11,0.14)] md:p-8">
        <p className="text-xs tracking-[0.24em] text-[#f97316]">
          게임 목록
        </p>
        <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-balance">
          게임이 준비되면 여기서 선택하고 같은 방으로 모일 수 있습니다.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#4d5c7a] md:text-base">
          지금은 플랫폼 기반을 먼저 정리하는 단계라 실제로 플레이 가능한 게임은
          아직 없습니다. 이후 게임이 붙으면 방 생성과 참가 흐름이 그대로 연결됩니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="rounded-full bg-white/72 px-4 py-2 text-sm text-[#34415f]">
            등록된 게임 {games.length}개
          </div>
          <div className="rounded-full bg-white/72 px-4 py-2 text-sm text-[#34415f]">
            플레이 가능 {launchReadyGames.length}개
          </div>
          <div className="rounded-full bg-white/72 px-4 py-2 text-sm text-[#34415f]">
            {userActiveRoom ? "현재 참가 중인 방이 있습니다" : "아직 참가 중인 방이 없습니다"}
          </div>
        </div>
      </section>

      <SectionCard
        eyebrow="상태"
        title="현재는 게임 준비 단계입니다"
        description="실제 게임 화면이 아직 연결되지 않았기 때문에 방 생성 버튼 대신 준비 상태를 먼저 보여줍니다."
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
        description="게임 패키지는 등록되어 있지만 실제 플레이 화면이 아직 연결되지 않았습니다."
      >
        <div className="grid gap-5 lg:grid-cols-2">
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
