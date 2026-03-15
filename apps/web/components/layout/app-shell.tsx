import type { ProfileSummary } from "@family-playground/types";
import type { ReactNode } from "react";
import Link from "next/link";
import { StatPill } from "@family-playground/ui";

interface AppShellProps {
  profile: ProfileSummary;
  children: ReactNode;
}

const navItems = [
  { href: "/lobby", label: "Lobby" },
  { href: "/games", label: "Games" },
  { href: "/ranking", label: "Ranking" },
  { href: "/profile", label: "Profile" },
];

export function AppShell({ profile, children }: AppShellProps) {
  return (
    <main className="min-h-screen px-5 py-6 text-slate-950 md:px-8 md:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[2.25rem] border border-white/70 bg-white/82 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-sky-700">
                Family Playground
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                Hello, {profile.displayName}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                A private catalog for your family. Rooms, rankings, and future
                games all sit inside the same platform shell.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <StatPill label="Total Score" value={String(profile.totalScore)} />
              <StatPill label="Games Played" value={String(profile.gamesPlayed)} />
            </div>
          </div>
          <nav className="mt-6 flex flex-wrap gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className="rounded-full border border-slate-900/8 bg-slate-100 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-950 hover:text-white"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
            <Link
              className="rounded-full border border-slate-900/8 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-rose-600 hover:text-white"
              href="/auth/sign-out"
            >
              Sign out
            </Link>
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}
