import { redirect } from "next/navigation";
import Link from "next/link";
import { buildSignedOutLoginHref } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureFamilyAccess } from "@/lib/platform";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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
      <div className="mx-auto grid max-w-4xl gap-4 md:gap-5">
        <section className="overflow-hidden rounded-[2rem] border border-[#ffdca8] bg-[#fffdf9] px-5 py-6 text-[#26324b] shadow-[0_20px_52px_rgba(245,158,11,0.12)] md:rounded-[2.7rem] md:px-10 md:py-12 md:shadow-[0_30px_90px_rgba(245,158,11,0.14)]">
          <div className="grid gap-5 md:gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-medium text-[#f97316]">가족 전용 게임 놀이터</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-balance md:mt-4 md:text-5xl">
                함께 노는
                <br className="md:hidden" />
                패밀리 플레이그라운드
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#485877] md:mt-5 md:text-base md:leading-8">
                구글 로그인 후 방에 모여 같이 즐기는 가족용 게임 공간입니다.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 md:mt-8">
                <Link
                  className="w-full rounded-full border border-[#ffd58c] bg-[#ffd666] px-5 py-3 text-center text-sm font-semibold text-[#25314b] transition hover:bg-[#ffc94f] hover:text-[#1f2a44] sm:w-auto"
                  href="/login"
                >
                  구글 계정으로 시작하기
                </Link>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.5rem] bg-white/78 p-4 shadow-[0_14px_28px_rgba(255,143,171,0.14)] md:rounded-[2rem] md:p-5">
                <p className="text-sm text-[#f97316]">현재 상태</p>
                <p className="mt-2 text-xl font-semibold text-[#26324b] md:text-2xl">
                  아직 게임은 연결되지 않았어요
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-[#fff8ea]/92 p-4 shadow-[0_14px_28px_rgba(144,219,244,0.12)] md:rounded-[2rem] md:p-5">
                <p className="text-sm text-[#f97316]">순서</p>
                <div className="mt-3 grid gap-2 text-sm text-[#4f5d7c]">
                  <div className="rounded-[1rem] bg-white px-3 py-2.5">로그인</div>
                  <div className="rounded-[1rem] bg-white px-3 py-2.5">방 참가</div>
                  <div className="rounded-[1rem] bg-white px-3 py-2.5">게임 시작</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 md:gap-5">
          <article className="rounded-[1.7rem] border border-[#ffdca8] bg-white/90 p-4 shadow-[0_16px_36px_rgba(245,158,11,0.08)] md:rounded-[2.2rem] md:p-6">
            <p className="text-xs tracking-[0.2em] text-[#f97316]">핸드폰</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#26324b] md:mt-3 md:text-2xl">
              작은 화면에서도 바로 누르기 쉽게
            </h2>
          </article>

          <article className="rounded-[1.7rem] border border-dashed border-[#fbbf24] bg-[#fff9ec]/90 p-4 md:rounded-[2.2rem] md:p-6">
            <p className="text-xs tracking-[0.2em] text-[#f97316]">태블릿</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#26324b] md:mt-3 md:text-2xl">
              넓은 화면에서는 두 칸으로 보기 쉽게
            </h2>
          </article>
        </section>
      </div>
    </main>
  );
}
