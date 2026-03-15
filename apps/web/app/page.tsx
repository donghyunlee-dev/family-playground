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
    <main className="min-h-screen px-5 py-6 text-slate-950 md:px-8 md:py-10">
      <div className="mx-auto grid max-w-5xl gap-5">
        <section className="overflow-hidden rounded-[2.7rem] border border-[#ffdca8] bg-[#fffdf9] px-7 py-10 text-[#26324b] shadow-[0_30px_90px_rgba(245,158,11,0.14)] md:px-10 md:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-medium text-[#f97316]">가족 전용 게임 놀이터</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-balance md:text-5xl">
                부모와 아이가 함께 노는
                <br />
                패밀리 플레이그라운드
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#485877]">
                복잡한 설명보다 바로 알아보기 쉬운 가족용 게임 공간을 만들고
                있습니다. 지금은 로그인과 방, 점수판 같은 공통 기능을 먼저
                준비하는 단계입니다.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="rounded-full border border-[#ffd58c] bg-[#ffd666] px-5 py-3 text-sm font-semibold text-[#25314b] transition hover:bg-[#ffc94f] hover:text-[#1f2a44]"
                  href="/login"
                >
                  구글 계정으로 시작하기
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[2rem] bg-white/78 p-5 shadow-[0_18px_40px_rgba(255,143,171,0.18)]">
                <p className="text-sm text-[#f97316]">오늘의 상태</p>
                <p className="mt-2 text-2xl font-semibold text-[#26324b]">
                  아직 게임은 연결되지 않았어요
                </p>
                <p className="mt-3 text-sm leading-7 text-[#5f6784]">
                  빈 공간이 보이는 것이 정상입니다. 게임을 붙이기 전에 로그인,
                  가족 계정 확인, 방 이동부터 안정적으로 맞추고 있습니다.
                </p>
              </div>
              <div className="rounded-[2rem] bg-[#fff8ea]/92 p-5 shadow-[0_18px_40px_rgba(144,219,244,0.16)]">
                <p className="text-sm text-[#f97316]">준비 순서</p>
                <div className="mt-3 grid gap-3 text-sm text-[#4f5d7c]">
                  <div className="rounded-[1.4rem] bg-white px-4 py-3">1. 가족 로그인</div>
                  <div className="rounded-[1.4rem] bg-white px-4 py-3">2. 방 생성과 참가</div>
                  <div className="rounded-[1.4rem] bg-white px-4 py-3">3. 실제 게임 연결</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <article className="rounded-[2.2rem] border border-[#ffdca8] bg-white/90 p-6 shadow-[0_20px_60px_rgba(245,158,11,0.1)]">
            <p className="text-xs tracking-[0.24em] text-[#f97316]">지금 보이는 것</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#26324b]">
              게임이 없어도 이해되는 화면으로 바꾸는 중입니다
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5f6784]">
              아이가 봐도 바로 이해할 수 있도록 큰 제목, 색감 있는 카드, 간단한
              문장 위주로 정리하고 있습니다.
            </p>
          </article>

          <article className="rounded-[2.2rem] border border-dashed border-[#fbbf24] bg-[#fff9ec]/90 p-6">
            <p className="text-xs tracking-[0.24em] text-[#f97316]">다음 단계</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#26324b]">
              메모리 카드와 끝말잇기가 들어올 자리
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5f6784]">
              게임 화면은 아직 비어 있어야 맞습니다. 플랫폼 정리가 끝나면 게임을
              하나씩 추가해서 같은 구조 안에서 돌게 만들 예정입니다.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
