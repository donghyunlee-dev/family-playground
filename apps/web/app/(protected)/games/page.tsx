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
    <SectionCard
      eyebrow="Games"
      title="Game catalog"
      description="Each game keeps a single active room. If someone already created it, everyone else joins that room instead of creating another one."
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
                    className="inline-flex rounded-full bg-stone-950 px-4 py-2 text-sm text-stone-50 transition hover:bg-stone-800"
                    href={`/room/${game.activeRoomId}`}
                  >
                    Join active room
                  </Link>
                ) : userActiveRoom ? (
                  <div className="rounded-full bg-stone-200 px-4 py-2 text-sm text-stone-600">
                    Leave your current room before creating another one
                  </div>
                ) : (
                  <form action={createRoomAction}>
                    <input name="gameId" type="hidden" value={game.id} />
                    <button
                      className="rounded-full bg-stone-950 px-4 py-2 text-sm text-stone-50 transition hover:bg-stone-800"
                      type="submit"
                    >
                      Create room
                    </button>
                  </form>
                )
              ) : (
                <div className="rounded-full bg-stone-200 px-4 py-2 text-sm text-stone-600">
                  Planned for a later phase
                </div>
              )
            }
          />
        ))}
      </div>
    </SectionCard>
  );
}
