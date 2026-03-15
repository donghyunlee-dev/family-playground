import { redirect } from "next/navigation";
import Link from "next/link";
import { fallbackGames } from "@/lib/mock";
import { buildSignedOutLoginHref } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureFamilyAccess } from "@/lib/platform";

export const dynamic = "force-dynamic";

const featuredHighlights = [
  "One shared room per game, so everyone joins the same live space.",
  "Persistent family profiles, rankings, and session history.",
  "Platform-first architecture that lets new games plug in cleanly.",
];

const editorialShelves = [
  {
    eyebrow: "Now ready",
    title: "Shared game rooms",
    body: "A family member opens the room once, everyone else joins from the catalog. No duplicate lobbies, no guessing which room is the right one.",
  },
  {
    eyebrow: "Built in",
    title: "Google sign-in + family access",
    body: "Authentication, profile bootstrap, and protected navigation all sit inside the platform shell instead of inside each game.",
  },
  {
    eyebrow: "Next up",
    title: "Reusable score pipeline",
    body: "Games will award platform points through a single results flow so future games do not reinvent ranking logic.",
  },
];

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
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,_#eaf2ff_0%,_#f7fbff_38%,_#f6f1e8_100%)] px-5 py-6 text-slate-950 md:px-8 md:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[2.5rem] border border-white/60 bg-white/80 p-4 shadow-[0_30px_90px_rgba(43,78,135,0.12)] backdrop-blur md:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
            <div className="rounded-[2rem] bg-[linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_45%,_#38bdf8_100%)] p-7 text-white md:p-10">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.32em] text-sky-100/90">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
                  Family Playground
                </span>
                <span>Editorial Pick</span>
              </div>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-0.04em] text-balance md:text-6xl">
                Your family’s private App Store for game nights.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-sky-50/90 md:text-lg">
                One shared catalog, one room per game, one ranking system. The
                platform handles login, rooms, profiles, and scoring so each new
                game can plug into a stable system.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-50"
                  href="/login"
                >
                  Continue with Google
                </Link>
                <Link
                  className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/16"
                  href="/games"
                >
                  Open catalog
                </Link>
              </div>
              <div className="mt-8 grid gap-3 md:grid-cols-3">
                {featuredHighlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.5rem] border border-white/15 bg-white/8 px-4 py-4 text-sm leading-6 text-sky-50/88"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <article className="rounded-[2rem] bg-[linear-gradient(180deg,_#fffefb_0%,_#eef6ff_100%)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <p className="text-xs uppercase tracking-[0.28em] text-sky-700">
                  Featured collection
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
                  Launch-ready platform pieces
                </h2>
                <div className="mt-5 space-y-3">
                  {editorialShelves.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[1.5rem] border border-slate-900/6 bg-white/90 px-4 py-4"
                    >
                      <p className="text-[0.7rem] uppercase tracking-[0.28em] text-sky-700">
                        {item.eyebrow}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[2rem] bg-slate-950 p-6 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-sky-200">
                      In rotation
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">
                      Early game lineup
                    </h2>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-sky-100">
                    2 enabled
                  </span>
                </div>
                <div className="mt-5 grid gap-3">
                  {fallbackGames.slice(0, 4).map((game, index) => (
                    <div
                      key={game.id}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-3"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#60a5fa_0%,_#22d3ee_100%)] text-sm font-semibold text-slate-950">
                        0{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{game.title}</p>
                        <p className="text-sm text-sky-100/75">
                          {game.minPlayers}-{game.maxPlayers} players
                        </p>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-sky-100">
                        {game.enabled ? "Open" : "Soon"}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-[2rem] border border-white/60 bg-white/78 p-6 shadow-[0_16px_50px_rgba(59,130,246,0.08)]">
            <p className="text-xs uppercase tracking-[0.26em] text-sky-700">
              Accounts
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Google in, platform profile out
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Sign-in, profile bootstrap, and session restore all happen once at
              the platform layer and stay consistent for every future game.
            </p>
          </article>

          <article className="rounded-[2rem] border border-white/60 bg-white/78 p-6 shadow-[0_16px_50px_rgba(59,130,246,0.08)]">
            <p className="text-xs uppercase tracking-[0.26em] text-sky-700">
              Rooms
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              One active room per game
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              The catalog shows when a room is already live, so everyone heads
              to the same space instead of splitting into duplicates.
            </p>
          </article>

          <article className="rounded-[2rem] border border-white/60 bg-white/78 p-6 shadow-[0_16px_50px_rgba(59,130,246,0.08)]">
            <p className="text-xs uppercase tracking-[0.26em] text-sky-700">
              Expansion
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Add games without rewriting the shell
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              `packages/game-*` can stay focused on rules and UI because auth,
              rooms, persistence, and rankings already live in the core platform.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
