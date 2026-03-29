"use client";

import type { ProfileSummary } from "@family-playground/types";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const initials = profile.displayName.slice(0, 2);

  return (
    <main className="min-h-screen px-4 py-4 text-slate-950 md:px-6 md:py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:gap-6">
        <header className="overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(135deg,#f4fff5_0%,#ffffff_46%,#eef5ff_100%)] p-4 shadow-[0_28px_90px_rgba(37,99,235,0.12)] md:rounded-[2.7rem] md:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.3em] text-[#0f9d58] md:text-xs">
                  FAMILY PLAYGROUND
                </p>
              </div>
              <Link
                className="rounded-full border border-[#dbe7f3] bg-white/90 px-4 py-2 text-sm font-medium text-[#29435c] transition hover:bg-white"
                href="/auth/sign-out"
              >
                로그아웃
              </Link>
            </div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                {profile.avatarUrl ? (
                  <div
                    aria-label={`${profile.displayName} 아바타`}
                    className="h-16 w-16 rounded-[1.6rem] border border-white/80 bg-cover bg-center shadow-[0_14px_28px_rgba(37,99,235,0.14)] md:h-20 md:w-20"
                    role="img"
                    style={{ backgroundImage: `url(${profile.avatarUrl})` }}
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-[1.6rem] bg-[linear-gradient(135deg,#34a853,#4285f4)] text-xl font-semibold text-white shadow-[0_14px_28px_rgba(37,99,235,0.18)] md:h-20 md:w-20 md:text-2xl">
                    {initials}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-[#0f9d58]">Account</p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-[-0.05em] text-[#17324e] md:text-4xl">
                    {profile.displayName}
                  </h1>
                  <p className="mt-2 text-sm text-[#5f7390]">
                    점수와 플레이 기록이 이 계정에 계속 쌓입니다.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <StatPill label="누적 점수" value={String(profile.totalScore)} />
                <StatPill label="플레이 횟수" value={String(profile.gamesPlayed)} />
              </div>
            </div>
          </div>
          <nav className="mt-5 grid grid-cols-4 gap-2 md:mt-6 md:flex md:flex-wrap md:gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className={`flex items-center justify-center rounded-[1rem] px-3 py-2.5 text-sm font-medium transition md:rounded-full md:px-4 md:py-2 ${
                  pathname.startsWith(item.href)
                    ? "border border-[#c7ebd4] bg-[#dff5e7] text-[#0f5132]"
                    : "border border-[#dbe7f3] bg-white/90 text-[#4c647d] hover:border-[#9dc4ef] hover:bg-[#edf5ff] hover:text-[#17324e]"
                }`}
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
