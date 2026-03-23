import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { buildSignedOutLoginHref } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureFamilyAccess, getActiveRoomForUser } from "@/lib/platform";
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
    const access = await ensureFamilyAccess(user);

    if (access.allowed) {
      const activeRoom = await getActiveRoomForUser(user.id);

      redirect(
        next
          ? normalizedNext
          : activeRoom
            ? getRoomPath(activeRoom.id, activeRoom.status)
            : "/lobby",
      );
    }

    redirect(buildSignedOutLoginHref(access.reason, normalizedNext));
  }

  return (
    <main className="min-h-screen px-4 py-4 text-slate-950 md:px-6 md:py-8">
      <div className="mx-auto grid max-w-3xl gap-4 md:gap-5">
        <section className="rounded-[2rem] border border-[#ffdca8] bg-[#fffdf9] p-5 text-[#26324b] shadow-[0_20px_52px_rgba(245,158,11,0.12)] md:rounded-[2.5rem] md:p-10 md:shadow-[0_28px_90px_rgba(245,158,11,0.14)]">
          <p className="text-sm font-medium text-[#f97316]">로그인</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-balance md:mt-4 md:text-4xl">
            가족 계정으로
            <br className="md:hidden" />
            로그인
          </h1>
        </section>

        <section className="rounded-[1.8rem] border border-[#ffdca8] bg-white/90 p-4 shadow-[0_18px_40px_rgba(245,158,11,0.08)] md:rounded-[2.3rem] md:p-6 md:shadow-[0_24px_70px_rgba(245,158,11,0.1)]">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#26324b] md:text-2xl">
            구글 로그인
          </h2>
          <div className="mt-4 md:mt-6">
            <GoogleSignInButton next={normalizedNext} />
          </div>
          {error ? (
            <div className="mt-4 rounded-[1.6rem] border border-[#fecaca] bg-[#fef2f2] px-4 py-4 text-sm leading-6 text-[#b91c1c]">
              {errorMessages[error] ?? "로그인을 계속 진행할 수 없습니다."}
              {detail ? (
                <p className="mt-2 break-all text-xs text-[#991b1b]">{detail}</p>
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
