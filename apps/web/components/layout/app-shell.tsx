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
  const isPlayRoute = pathname.includes("/play");

  return (
    <main
      className={`min-h-screen text-slate-950 ${
        isPlayRoute ? "px-3 py-3 md:px-4 md:py-4" : "px-4 py-4 md:px-6 md:py-6"
      }`}
    >
      <div
        className={`mx-auto flex flex-col ${
          isPlayRoute ? "max-w-6xl gap-3" : "max-w-6xl gap-4 md:gap-6"
        }`}
      >
        <header
          className={
            isPlayRoute
              ? "sticky top-3 z-40 rounded-[1.4rem] border border-white/10 bg-[rgba(12,18,31,0.88)] px-4 py-3 shadow-[0_18px_40px_rgba(2,6,23,0.35)] backdrop-blur"
              : "overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(135deg,#f4fff5_0%,#ffffff_46%,#eef5ff_100%)] p-4 shadow-[0_28px_90px_rgba(37,99,235,0.12)] md:rounded-[2.7rem] md:p-6"
          }
        >
          {isPlayRoute ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex items-center gap-3">
                  {profile.avatarUrl ? (
                    <div
                      aria-label={`${profile.displayName} 아바타`}
                      className="h-10 w-10 rounded-full border border-white/15 bg-cover bg-center"
                      role="img"
                      style={{ backgroundImage: `url(${profile.avatarUrl})` }}
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#34a853,#4285f4)] text-sm font-semibold text-white">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-[0.24em] text-[#7dd3fc]">
                      PLAYER
                    </p>
                    <p className="truncate text-sm font-semibold text-white">
                      {profile.displayName}
                    </p>
                  </div>
                </div>
              </div>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <div className="rounded-full bg-white/8 px-3 py-1.5 text-xs text-slate-200">
                  점수 {profile.totalScore}
                </div>
                <div className="rounded-full bg-white/8 px-3 py-1.5 text-xs text-slate-200">
                  플레이 {profile.gamesPlayed}
                </div>
                <Link
                  className="rounded-full border border-sky-300/30 bg-sky-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-sky-300"
                  href="/lobby"
                >
                  로비
                </Link>
              </div>
              <Link
                aria-label="로그아웃"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-white text-slate-950 transition hover:bg-slate-100"
                href="/auth/sign-out"
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M16 17l5-5-5-5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M21 12H9"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </Link>
            </div>
          ) : (
            <>
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
            </>
          )}
        </header>
        {children}
      </div>
    </main>
  );
}
