import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { validateAuthenticatedAppUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveRoomForUser } from "@/lib/platform";
import { getRoomPath } from "@/lib/room-routes";
import { normalizeNextPath } from "@/lib/redirect-path";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  "not-allowed":
    "이 구글 계정은 아직 가족 계정 목록에 없습니다. family_members 테이블에 이메일을 추가한 뒤 다시 시도해 주세요.",
  "email-claimed":
    "이 가족 이메일은 이미 다른 사용자와 연결되어 있습니다. family_members 설정을 확인해 주세요.",
  "missing-email": "로그인한 계정에서 이메일 정보를 가져오지 못했습니다.",
  "missing-code": "구글 로그인 후 인증 코드가 전달되지 않았습니다.",
  "session-expired":
    "로그인 유지 시간이 24시간을 지나 세션이 만료되었습니다. 다시 로그인해 주세요.",
  "auth-callback-failed":
    "Supabase가 구글 로그인 콜백을 세션으로 바꾸지 못했습니다. 구글 OAuth 설정을 다시 확인해야 합니다.",
};

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    detail?: string;
    force?: string;
    next?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, detail, force, next } = await searchParams;
  const normalizedNext = normalizeNextPath(next);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && force !== "1") {
    await validateAuthenticatedAppUser(user, normalizedNext);
    const activeRoom = await getActiveRoomForUser(user.id);

    redirect(
      next
        ? normalizedNext
        : activeRoom
          ? getRoomPath(activeRoom.id, activeRoom.status)
          : "/lobby",
    );
  }

  return (
    <main className="min-h-screen px-4 py-4 text-slate-950 md:px-6 md:py-8">
      <div className="mx-auto grid max-w-3xl gap-4 md:gap-5">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#f8fff6_0%,#ffffff_42%,#eef6ff_100%)] p-5 text-[#16324f] shadow-[0_24px_70px_rgba(36,99,235,0.12)] md:rounded-[2.8rem] md:p-10">
          <p className="text-sm font-semibold tracking-[0.18em] text-[#0f9d58]">
            FAMILY PLAY
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-balance md:mt-4 md:text-5xl">
            가족 계정으로
            <br className="md:hidden" />
            다시 들어오기
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#48627d] md:text-base md:leading-7">
            로그인은 최대 24시간 유지됩니다. 시간이 지나면 자동 로그아웃되고,
            같은 구글 계정으로 바로 다시 들어올 수 있습니다.
          </p>
        </section>

        <section className="rounded-[1.8rem] border border-white/80 bg-white/95 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:rounded-[2.3rem] md:p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#16324f] md:text-2xl">
            구글 로그인
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#5a7085]">
            가족 계정 허용 목록에 있는 구글 계정만 접근할 수 있습니다.
          </p>
          <div className="mt-4 md:mt-6">
            <GoogleSignInButton
              className="inline-flex w-full items-center justify-center rounded-full border border-[#c7ebd4] bg-[#d8f3e1] px-6 py-3 text-sm font-semibold text-[#0f5132] shadow-[0_14px_32px_rgba(15,157,88,0.16)] transition hover:bg-[#c8ecd5]"
              next={normalizedNext}
            />
          </div>
          {error ? (
            <div className="mt-4 rounded-[1.6rem] border border-[#ffd8b0] bg-[#fff4e8] px-4 py-4 text-sm leading-6 text-[#9a3412]">
              {errorMessages[error] ?? "로그인을 계속 진행할 수 없습니다."}
              {detail ? (
                <p className="mt-2 break-all text-xs text-[#9a3412]">{detail}</p>
              ) : null}
            </div>
          ) : null}
          {error === "auth-callback-failed" ? (
            <div className="mt-4">
              <a
                className="inline-flex rounded-full border border-[#d8dee8] bg-white px-4 py-2.5 text-sm font-medium text-[#25314b] transition hover:bg-[#f8fafc]"
                href={`/auth/reset-session?next=${encodeURIComponent(normalizedNext)}`}
              >
                세션 초기화 후 다시 로그인
              </a>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
