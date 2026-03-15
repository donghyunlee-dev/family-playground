import { EmptyState, SectionCard } from "@family-playground/ui";
import { RoomList } from "@/components/platform/room-list";
import { listGames, getLeaderboard, listOpenRooms } from "@/lib/platform";

export default async function LobbyPage() {
  const [games, leaderboard, rooms] = await Promise.all([
    listGames(),
    getLeaderboard(4),
    listOpenRooms(),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <SectionCard
        eyebrow="Lobby"
        title="Active family rooms"
        description="Rooms move from waiting to playing to finished. Hosts create the room, family members join from the shared hub."
      >
        <RoomList rooms={rooms} />
      </SectionCard>

      <div className="grid gap-6">
        <SectionCard
          eyebrow="Leaderboard"
          title="Current family ranking"
          description="Platform points accumulate across games and stay separate from raw per-game scores."
        >
          {leaderboard.length === 0 ? (
            <EmptyState
              title="No ranking data yet"
              description="Once family members finish games, cumulative points and recent history will appear here."
            />
          ) : (
            <div className="space-y-3">
              {leaderboard.map((profile, index) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                      Rank {index + 1}
                    </p>
                    <p className="mt-1 font-medium">{profile.displayName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{profile.totalScore}</p>
                    <p className="text-xs text-stone-500">
                      {profile.gamesPlayed} games
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          eyebrow="Catalog Preview"
          title="Games in rotation"
          description="Only enabled games can create new rooms. Additional games can be added later without restructuring the platform."
        >
          <div className="grid gap-3">
            {games.slice(0, 4).map((game) => (
              <div
                key={game.id}
                className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700"
              >
                <strong className="text-stone-900">{game.title}</strong> ·{" "}
                {game.minPlayers}-{game.maxPlayers} players
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
