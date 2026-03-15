import { EmptyState, SectionCard } from "@family-playground/ui";
import { requireAppSession } from "@/lib/auth";
import { getRecentScoreHistory } from "@/lib/platform";

export default async function ProfilePage() {
  const { profile, member } = await requireAppSession();
  const history = await getRecentScoreHistory(profile.id);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <SectionCard
        eyebrow="프로필"
        title={profile.displayName}
        description="가족 계정 정보와 현재 점수, 플레이 횟수를 한 번에 확인하는 화면입니다."
      >
        <div className="grid gap-3 text-sm text-[#5f6784]">
          <div className="rounded-[1.6rem] bg-[#fff9ec] px-4 py-3">
            이메일: {profile.email}
          </div>
          <div className="rounded-[1.6rem] bg-[#fff9ec] px-4 py-3">
            가족 역할: {member.role === "admin" ? "관리자" : "구성원"}
          </div>
          <div className="rounded-[1.6rem] bg-[#fff9ec] px-4 py-3">
            누적 점수: {profile.totalScore}
          </div>
          <div className="rounded-[1.6rem] bg-[#fff9ec] px-4 py-3">
            플레이 횟수: {profile.gamesPlayed}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="기록"
        title="최근 점수 기록"
        description="게임이 끝나고 점수가 반영되면 최근 기록이 시간순으로 쌓입니다."
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
                className="rounded-[1.7rem] bg-[#fff9ec] px-4 py-3 text-sm text-[#5f6784]"
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
