import { EmptyState, SectionCard } from "@family-playground/ui";
import { getLeaderboard } from "@/lib/platform";

export default async function RankingPage() {
  const leaderboard = await getLeaderboard(20);

  return (
    <SectionCard
      eyebrow="랭킹"
      title="가족 점수판"
      description="플랫폼 점수는 개별 게임 점수와 분리되어 쌓이기 때문에, 나중에 새 게임이 추가되어도 같은 랭킹 시스템을 그대로 사용할 수 있습니다."
    >
      {leaderboard.length === 0 ? (
        <EmptyState
          title="아직 랭킹 데이터가 없습니다"
          description="게임 세션이 끝나고 점수가 반영되면 첫 랭킹이 여기에 표시됩니다."
        />
      ) : (
        <div className="overflow-hidden rounded-[1.9rem] border border-[#ffdca8] bg-white">
          <table className="min-w-full divide-y divide-[#ffe7be] text-left text-sm">
            <thead className="bg-[#fff9ec] text-[#6b728c]">
              <tr>
                <th className="px-4 py-3">순위</th>
                <th className="px-4 py-3">이름</th>
                <th className="px-4 py-3">누적 점수</th>
                <th className="px-4 py-3">플레이 횟수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#fff0d1]">
              {leaderboard.map((profile, index) => (
                <tr key={profile.id}>
                  <td className="px-4 py-3 font-medium text-[#26324b]">{index + 1}</td>
                  <td className="px-4 py-3 text-[#26324b]">{profile.displayName}</td>
                  <td className="px-4 py-3 text-[#26324b]">{profile.totalScore}</td>
                  <td className="px-4 py-3 text-[#5f6784]">{profile.gamesPlayed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}
