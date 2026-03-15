import { EmptyState, SectionCard } from "@family-playground/ui";
import { getLeaderboard } from "@/lib/platform";

export default async function RankingPage() {
  const leaderboard = await getLeaderboard(20);

  return (
    <SectionCard
      eyebrow="Ranking"
      title="Family leaderboard"
      description="Platform points are tracked independently from individual game scoring, so new games can join the same ranking system later."
    >
      {leaderboard.length === 0 ? (
        <EmptyState
          title="No ranking data yet"
          description="Finish a game session to populate the first leaderboard entries."
        />
      ) : (
        <div className="overflow-hidden rounded-[1.75rem] border border-stone-900/10 bg-white">
          <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Total Score</th>
                <th className="px-4 py-3">Games Played</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {leaderboard.map((profile, index) => (
                <tr key={profile.id}>
                  <td className="px-4 py-3 font-medium">{index + 1}</td>
                  <td className="px-4 py-3">{profile.displayName}</td>
                  <td className="px-4 py-3">{profile.totalScore}</td>
                  <td className="px-4 py-3">{profile.gamesPlayed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}
