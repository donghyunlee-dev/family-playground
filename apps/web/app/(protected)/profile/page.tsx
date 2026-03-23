import { EmptyState, SectionCard } from "@family-playground/ui";
import { requireAppSession } from "@/lib/auth";
import { getRecentScoreHistory } from "@/lib/platform";

export default async function ProfilePage() {
  const { profile, member } = await requireAppSession();
  const history = await getRecentScoreHistory(profile.id);

  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <SectionCard
        eyebrow="프로필"
        title={profile.displayName}
        description="내 계정 정보"
      >
        <div className="grid gap-3 text-sm text-[#5f6784]">
          <div className="rounded-[1.2rem] bg-[#fff9ec] px-4 py-3 md:rounded-[1.6rem]">
            이메일: {profile.email}
          </div>
          <div className="rounded-[1.2rem] bg-[#fff9ec] px-4 py-3 md:rounded-[1.6rem]">
            가족 역할: {member.role === "admin" ? "관리자" : "구성원"}
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.2rem] bg-[#eef8ff] px-4 py-4 md:rounded-[1.6rem]">
            <p className="text-xs tracking-[0.16em] text-[#4b6c8d]">누적 점수</p>
            <p className="mt-2 text-2xl font-semibold text-[#26324b]">
              {profile.totalScore}
            </p>
          </div>
          <div className="rounded-[1.2rem] bg-[#eef8ff] px-4 py-4 md:rounded-[1.6rem]">
            <p className="text-xs tracking-[0.16em] text-[#4b6c8d]">플레이 횟수</p>
            <p className="mt-2 text-2xl font-semibold text-[#26324b]">
              {profile.gamesPlayed}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="기록"
        title="최근 점수 기록"
        description="최근 활동"
      >
        {history.length === 0 ? (
          <EmptyState
            title="아직 점수 기록이 없습니다"
            description="게임 세션이 끝나고 점수가 반영되면 최근 활동이 여기에 표시됩니다."
          />
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <article
                key={entry.id}
                className="rounded-[1.3rem] bg-[#fff9ec] px-4 py-3 text-sm text-[#5f6784] md:rounded-[1.7rem]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-[#26324b]">{entry.gameTitle}</p>
                    <p className="mt-1 text-xs tracking-[0.16em] text-[#f97316]">
                      {entry.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#26324b]">{entry.scoreDelta}</p>
                    <p className="text-xs text-[#6b728c]">
                      현재 합계: {entry.runningTotal}
                    </p>
                    <p className="mt-1 text-xs text-[#94a3b8]">
                      {new Date(entry.createdAt).toLocaleString("ko-KR")}
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
