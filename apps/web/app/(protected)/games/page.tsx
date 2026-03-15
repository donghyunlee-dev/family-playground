import { SectionCard } from "@family-playground/ui";
import { GameCatalogCard } from "@/components/platform/game-catalog-card";
import Link from "next/link";
import { requireAppSession } from "@/lib/auth";
import { getActiveRoomForUser, listGamesWithRoomState } from "@/lib/platform";
import { createRoomAction } from "./actions";

export default async function GamesPage() {
  const { user } = await requireAppSession();
  const [games, userActiveRoom] = await Promise.all([
    listGamesWithRoomState(),
    getActiveRoomForUser(user.id),
  ]);

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[2.2rem] bg-[linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_46%,_#7dd3fc_100%)] p-6 text-white shadow-[0_26px_80px_rgba(37,99,235,0.16)] md:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-sky-100/90">
          Game Catalog
        </p>
        <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-balance">
          Browse games like a featured shelf, then jump into the live room.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-sky-50/85 md:text-base">
          Each game owns a single active room. If someone already opened it, the
          catalog switches to a join action so the family always lands in the
          same place.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-sky-50">
            {games.filter((game) => game.enabled).length} enabled titles
          </div>
          <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-sky-50">
            {games.filter((game) => game.activeRoomId).length} live rooms
          </div>
          <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-sky-50">
            {userActiveRoom ? "You are currently in a room" : "You are free to host"}
          </div>
        </div>
      </section>

      <SectionCard
        eyebrow="Browse"
        title="Featured family games"
        description="Room state is surfaced directly in the catalog so a family member can tell at a glance whether to host, join, or wait for a later phase."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {games.map((game) => (
            <GameCatalogCard
              key={game.id}
              game={game}
              footer={
                game.enabled ? (
                  game.activeRoomId ? (
                    <Link
                      className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
                      href={`/room/${game.activeRoomId}`}
                    >
                      Join active room
                    </Link>
                  ) : userActiveRoom ? (
                    <div className="rounded-full bg-slate-200 px-4 py-2 text-sm text-slate-600">
                      Leave your current room before creating another one
                    </div>
                  ) : (
                    <form action={createRoomAction}>
                      <input name="gameId" type="hidden" value={game.id} />
                      <button
                        className="rounded-full bg-slate-950 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
                        type="submit"
                      >
                        Create room
                      </button>
                    </form>
                  )
                ) : (
                  <div className="rounded-full bg-slate-200 px-4 py-2 text-sm text-slate-600">
                    Planned for a later phase
                  </div>
                )
              }
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
