import { EmptyState, SectionCard } from "@family-playground/ui";
import { RoomList } from "@/components/platform/room-list";
import { listGames, getLeaderboard, listOpenRooms } from "@/lib/platform";

export default async function LobbyPage() {
  const [games, leaderboard, rooms] = await Promise.all([
    listGames(),
    getLeaderboard(4),
    listOpenRooms(),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.16fr_0.84fr]">
      <div className="grid gap-6">
        <section className="rounded-[2.4rem] border border-[#ffdca8] bg-[linear-gradient(135deg,_#fff4d2_0%,_#ffc6d7_50%,_#caedff_100%)] p-6 text-[#26324b] shadow-[0_26px_80px_rgba(245,158,11,0.14)] md:p-8">
          <p className="text-xs tracking-[0.24em] text-[#f97316]">
            로비
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-balance">
            가족이 한곳에 모여
            <br />
            준비 상태를 보는 공간입니다
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#4d5c7a]">
            누가 방을 열어 두었는지, 지금 준비된 게임이 무엇인지, 점수가 얼마나
            쌓였는지를 한눈에 보기 쉽게 정리합니다.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.7rem] bg-white/72 px-4 py-4 shadow-[0_12px_28px_rgba(255,143,171,0.12)]">
              <p className="text-sm text-[#f97316]">현재 방</p>
              <p className="mt-2 text-3xl font-semibold text-[#26324b]">{rooms.length}</p>
            </div>
            <div className="rounded-[1.7rem] bg-white/72 px-4 py-4 shadow-[0_12px_28px_rgba(144,219,244,0.16)]">
              <p className="text-sm text-[#f97316]">등록된 게임</p>
              <p className="mt-2 text-3xl font-semibold text-[#26324b]">{games.length}</p>
            </div>
            <div className="rounded-[1.7rem] bg-white/72 px-4 py-4 shadow-[0_12px_28px_rgba(251,191,36,0.14)]">
              <p className="text-sm text-[#f97316]">랭킹 인원</p>
              <p className="mt-2 text-3xl font-semibold text-[#26324b]">
                {leaderboard.length}
              </p>
            </div>
          </div>
        </section>

        <SectionCard
          eyebrow="방"
          title="열려 있는 가족 방"
          description="방은 대기 중, 진행 중, 종료됨 상태로 움직입니다. 실제 게임이 붙으면 이 대기방이 바로 플레이 공간으로 연결됩니다."
        >
          <RoomList rooms={rooms} />
        </SectionCard>

        <SectionCard
          eyebrow="랭킹"
          title="가족 랭킹"
          description="플랫폼 점수는 게임별 점수와 분리되어 누적됩니다."
        >
          {leaderboard.length === 0 ? (
            <EmptyState
              title="아직 랭킹 데이터가 없습니다"
              description="게임 결과가 저장되면 가족별 점수와 최근 기록이 여기에 표시됩니다."
            />
          ) : (
            <div className="space-y-3">
              {leaderboard.map((profile, index) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between rounded-[1.6rem] bg-[#fff9ec] px-4 py-3"
                >
                  <div>
                    <p className="text-xs tracking-[0.18em] text-[#f97316]">
                      {index + 1}위
                    </p>
                    <p className="mt-1 font-medium text-[#26324b]">
                      {profile.displayName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[#26324b]">{profile.totalScore}</p>
                    <p className="text-xs text-[#6b728c]">
                      플레이 {profile.gamesPlayed}회
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          eyebrow="미리보기"
          title="등록된 게임"
          description="현재는 게임 목록만 먼저 보이고, 실제 플레이 가능한 게임은 아직 연결되지 않았습니다."
        >
          <div className="grid gap-3">
            {games.slice(0, 4).map((game) => (
              <div
                key={game.id}
                className="rounded-[1.5rem] bg-[#fff9ec] px-4 py-3 text-sm text-[#5f6784]"
              >
                <strong className="text-[#26324b]">{game.title}</strong> ·{" "}
                {game.minPlayers}-{game.maxPlayers}명
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
