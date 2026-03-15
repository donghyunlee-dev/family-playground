import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { buildSignedOutLoginHref } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureFamilyAccess } from "@/lib/platform";

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
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, detail } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const access = await ensureFamilyAccess(user);

    if (access.allowed) {
      redirect("/lobby");
    }

    redirect(buildSignedOutLoginHref(access.reason));
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
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#4d5c7a] md:mt-5 md:text-base md:leading-8">
            로그인만 성공하면 바로 로비로 이동합니다.
          </p>
        </section>

        <section className="rounded-[1.8rem] border border-[#ffdca8] bg-white/90 p-4 shadow-[0_18px_40px_rgba(245,158,11,0.08)] md:rounded-[2.3rem] md:p-6 md:shadow-[0_24px_70px_rgba(245,158,11,0.1)]">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#26324b] md:text-2xl">
            구글 로그인
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#5f6784] md:mt-3 md:leading-7">
            버튼을 누르면 구글 로그인으로 이동합니다.
          </p>
          <div className="mt-4 md:mt-6">
            <GoogleSignInButton />
          </div>
          {error ? (
            <div className="mt-4 rounded-[1.6rem] border border-[#fecdd3] bg-[#fff1f3] px-4 py-4 text-sm leading-6 text-[#9f1239]">
              {errorMessages[error] ?? "로그인을 계속 진행할 수 없습니다."}
              {detail ? (
                <p className="mt-2 break-all text-xs text-[#881337]">{detail}</p>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="rounded-[1.8rem] border border-dashed border-[#fbbf24] bg-[#fff9ec]/92 p-4 md:rounded-[2.1rem] md:p-6">
          <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#26324b] md:text-xl">
            확인할 것
          </h2>
          <div className="mt-3 grid gap-2 text-sm leading-6 text-[#5f6784] md:mt-4 md:gap-3 md:leading-7">
            <div className="rounded-[1rem] bg-white px-3 py-2.5 md:rounded-[1.4rem] md:px-4 md:py-3">
              1. Google 로그인이 켜져 있어야 합니다.
            </div>
            <div className="rounded-[1rem] bg-white px-3 py-2.5 md:rounded-[1.4rem] md:px-4 md:py-3">
              2. Redirect URL이 맞아야 합니다.
            </div>
            <div className="rounded-[1rem] bg-white px-3 py-2.5 md:rounded-[1.4rem] md:px-4 md:py-3">
              3. 통과하면 바로 로비로 이동합니다.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
