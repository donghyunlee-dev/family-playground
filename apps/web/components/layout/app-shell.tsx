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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.16),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.14),_transparent_28%),linear-gradient(180deg,_#fff8ef_0%,_#fffdf8_38%,_#f2eee7_100%)] px-6 py-8 text-stone-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-[2rem] border border-stone-900/10 bg-white/80 p-6 shadow-[0_16px_60px_rgba(28,25,23,0.08)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-orange-700">
                Family Playground
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                Hello, {profile.displayName}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
                A private multiplayer hub for your family. Rooms, rankings, and
                future games all live inside the same platform shell.
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
                className="rounded-full border border-stone-900/10 bg-stone-100 px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-950 hover:text-stone-50"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
            <Link
              className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-sm text-stone-700 transition hover:bg-rose-600 hover:text-white"
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
