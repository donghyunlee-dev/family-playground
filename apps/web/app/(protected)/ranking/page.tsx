import { EmptyState, SectionCard } from "@family-playground/ui";
import { getLeaderboard } from "@/lib/platform";

export default async function RankingPage() {
  const leaderboard = await getLeaderboard(20);

  return (
    <SectionCard
      eyebrow="랭킹"
      title="가족 점수판"
      description="가족 점수 보기"
    >
      {leaderboard.length === 0 ? (
        <EmptyState
          title="아직 랭킹 데이터가 없습니다"
          description="게임 세션이 끝나고 점수가 반영되면 첫 랭킹이 여기에 표시됩니다."
        />
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] border border-[#ffdca8] bg-white md:rounded-[1.9rem]">
          <table className="min-w-full divide-y divide-[#ffe7be] text-left text-sm">
            <thead className="bg-[#fff9ec] text-[#6b728c]">
              <tr>
                <th className="px-3 py-2.5 md:px-4 md:py-3">순위</th>
                <th className="px-3 py-2.5 md:px-4 md:py-3">이름</th>
                <th className="px-3 py-2.5 md:px-4 md:py-3">점수</th>
                <th className="px-3 py-2.5 md:px-4 md:py-3">횟수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#fff0d1]">
              {leaderboard.map((profile, index) => (
                <tr key={profile.id}>
                  <td className="px-3 py-2.5 font-medium text-[#26324b] md:px-4 md:py-3">{index + 1}</td>
                  <td className="px-3 py-2.5 text-[#26324b] md:px-4 md:py-3">{profile.displayName}</td>
                  <td className="px-3 py-2.5 text-[#26324b] md:px-4 md:py-3">{profile.totalScore}</td>
                  <td className="px-3 py-2.5 text-[#5f6784] md:px-4 md:py-3">{profile.gamesPlayed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}
