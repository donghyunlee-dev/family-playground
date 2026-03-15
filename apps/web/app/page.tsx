import { redirect } from "next/navigation";
import Link from "next/link";
import { SectionCard } from "@family-playground/ui";
import { fallbackGames } from "@/lib/mock";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureFamilyAccess } from "@/lib/platform";

const setupSteps = [
  "Sign in with Google through Supabase Auth.",
  "Pass the family allowlist check based on your approved email.",
  "Create rooms from the game catalog and share platform points across sessions.",
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
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_32%),linear-gradient(180deg,_#fff8ef_0%,_#fffdf8_40%,_#f4efe5_100%)] px-6 py-10 text-stone-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-[2rem] border border-stone-900/10 bg-white/75 p-8 shadow-[0_20px_80px_rgba(120,53,15,0.12)] backdrop-blur">
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-orange-700">
              Family Multiplayer Platform
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance">
              A private game hub for your family, built around rooms, rankings,
              and reusable game modules.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700">
              The foundation now includes Supabase-backed authentication, family
              allowlist rules, protected app routes, and a modular path for
              future games.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {setupSteps.map((step, index) => (
                <span
                  key={step}
                  className="rounded-full border border-stone-900/10 bg-stone-950 px-4 py-2 text-sm text-stone-50"
                >
                  {index + 1}. {step}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
                href="/login"
              >
                Enter with Google
              </Link>
              <Link
                className="rounded-full border border-stone-900/10 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                href="/games"
              >
                View game catalog
              </Link>
            </div>
          </div>
          <SectionCard
            eyebrow="Platform Rules"
            title="Family-only access"
            description="Google sign-in is required, but only approved family members are allowed through protected routes."
          >
            <div className="space-y-3 text-sm text-stone-700">
              <div className="rounded-xl bg-emerald-100 px-3 py-2 text-emerald-900">
                Session restore, protected routes, and family allowlist checks
                are wired into the platform shell.
              </div>
              <div className="rounded-xl bg-stone-100 px-3 py-2">
                Scores are designed to accumulate at the family platform level,
                independent from raw per-game scoring.
              </div>
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <SectionCard
            eyebrow="Games"
            title="Initial game packages"
            description="New games can be added later as isolated packages while keeping auth, rooms, and ranking logic in the platform core."
          >
            <div className="grid gap-4 md:grid-cols-2">
              {fallbackGames.slice(0, 2).map((game) => (
                <article
                  key={game.id}
                  className="rounded-2xl border border-stone-900/10 bg-stone-50 p-4"
                >
                  <h2 className="text-xl font-semibold">{game.title}</h2>
                  <p className="mt-2 text-sm text-stone-600">
                    Players: {game.minPlayers} to {game.maxPlayers}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-stone-700">
                    {game.description}
                  </p>
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Architecture"
            title="Required repository layers"
            description="The structure below mirrors the documentation so future game work stays predictable."
          >
            <div className="grid gap-3 text-sm text-stone-700">
              <div className="rounded-2xl bg-stone-100 px-4 py-3">
                apps/web: Next.js UI, auth screens, lobby, room routes
              </div>
              <div className="rounded-2xl bg-stone-100 px-4 py-3">
                packages/*: shared types, Supabase client, game engine, game
                packages
              </div>
              <div className="rounded-2xl bg-stone-100 px-4 py-3">
                supabase/*: migrations, functions, local config, seed data
              </div>
            </div>
          </SectionCard>
        </section>
      </div>
    </main>
  );
}
