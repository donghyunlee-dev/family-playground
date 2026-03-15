import type { ProfileSummary } from "@family-playground/types";
import type { ReactNode } from "react";
import Link from "next/link";
import { StatPill } from "@family-playground/ui";

interface AppShellProps {
  profile: ProfileSummary;
  children: ReactNode;
}

const navItems = [
  { href: "/lobby", label: "로비" },
  { href: "/games", label: "게임" },
  { href: "/ranking", label: "랭킹" },
  { href: "/profile", label: "프로필" },
];

export function AppShell({ profile, children }: AppShellProps) {
  return (
    <main className="min-h-screen px-4 py-4 text-slate-950 md:px-6 md:py-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 md:gap-6">
        <header className="rounded-[1.9rem] border border-[#ffdca8] bg-[#fffdf9] p-4 shadow-[0_18px_42px_rgba(245,158,11,0.1)] md:rounded-[2.5rem] md:p-6 md:shadow-[0_24px_70px_rgba(245,158,11,0.12)]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] tracking-[0.22em] text-[#f97316] md:text-xs md:tracking-[0.28em]">
                패밀리 플레이그라운드
              </p>
              <Link
                className="rounded-full border border-[#fecdd3] bg-[#fff1f3] px-3 py-2 text-sm font-medium text-[#be123c] transition hover:bg-[#ffe4e6] hover:text-[#9f1239]"
                href="/auth/sign-out"
              >
                로그아웃
              </Link>
            </div>
            <div className="flex flex-col gap-4 md:gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-[-0.04em] md:text-4xl">
                  {profile.displayName} 님
                </h1>
                <p className="mt-2 text-sm leading-6 text-[#5f6784] md:max-w-2xl">
                  가족용 게임 공간
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <StatPill label="누적 점수" value={String(profile.totalScore)} />
                <StatPill label="플레이 횟수" value={String(profile.gamesPlayed)} />
              </div>
            </div>
          </div>
          <nav className="mt-4 grid grid-cols-4 gap-2 md:mt-6 md:flex md:flex-wrap md:gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className="flex items-center justify-center rounded-[1rem] border border-[#ffd58c] bg-white px-3 py-2.5 text-sm font-medium text-[#34415f] transition hover:border-[#ffb84d] hover:bg-[#fff2cf] hover:text-[#1f2a44] md:rounded-full md:px-4 md:py-2"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}
