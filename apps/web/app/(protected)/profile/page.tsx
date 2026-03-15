import { EmptyState, SectionCard } from "@family-playground/ui";
import { requireAppSession } from "@/lib/auth";
import { getRecentScoreHistory } from "@/lib/platform";

export default async function ProfilePage() {
  const { profile, member } = await requireAppSession();
  const history = await getRecentScoreHistory(profile.id);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <SectionCard
        eyebrow="Profile"
        title={profile.displayName}
        description="Profile data is bootstrapped from Supabase Auth and matched to the family allowlist before protected routes are accessible."
      >
        <div className="grid gap-3 text-sm text-stone-700">
          <div className="rounded-2xl bg-stone-50 px-4 py-3">
            Email: {profile.email}
          </div>
          <div className="rounded-2xl bg-stone-50 px-4 py-3">
            Family role: {member.role}
          </div>
          <div className="rounded-2xl bg-stone-50 px-4 py-3">
            Total score: {profile.totalScore}
          </div>
          <div className="rounded-2xl bg-stone-50 px-4 py-3">
            Games played: {profile.gamesPlayed}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="History"
        title="Recent score events"
        description="Every platform point change should be stored as score history so family ranking remains auditable across games."
      >
        {history.length === 0 ? (
          <EmptyState
            title="No score history yet"
            description="Once sessions finish and points are awarded, recent activity will appear here."
          />
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <article
                key={entry.id}
                className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-stone-900">{entry.gameTitle}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-500">
                      {entry.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{entry.scoreDelta}</p>
                    <p className="text-xs text-stone-500">
                      Total: {entry.runningTotal}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
