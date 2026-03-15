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
    <div className="grid gap-6 lg:grid-cols-[1.16fr_0.84fr]">
      <div className="grid gap-6">
        <section className="rounded-[2.2rem] bg-[linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_46%,_#7dd3fc_100%)] p-6 text-white shadow-[0_26px_80px_rgba(37,99,235,0.16)] md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-100/90">
            Lobby
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-balance">
            Live rooms, shared progress, and one place to regroup.
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/15 bg-white/10 px-4 py-4">
              <p className="text-sm text-sky-50/80">Active rooms</p>
              <p className="mt-2 text-3xl font-semibold text-white">{rooms.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/15 bg-white/10 px-4 py-4">
              <p className="text-sm text-sky-50/80">Games visible</p>
              <p className="mt-2 text-3xl font-semibold text-white">{games.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/15 bg-white/10 px-4 py-4">
              <p className="text-sm text-sky-50/80">Family members ranked</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {leaderboard.length}
              </p>
            </div>
          </div>
        </section>

        <SectionCard
          eyebrow="Rooms"
          title="Active family rooms"
          description="Rooms move from waiting to playing to finished. Hosts create the room, family members join from the shared hub."
        >
          <RoomList rooms={rooms} />
        </SectionCard>

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
                  className="flex items-center justify-between rounded-[1.5rem] bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Rank {index + 1}
                    </p>
                    <p className="mt-1 font-medium text-slate-950">
                      {profile.displayName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{profile.totalScore}</p>
                    <p className="text-xs text-slate-500">
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
                className="rounded-[1.5rem] bg-slate-50 px-4 py-3 text-sm text-slate-700"
              >
                <strong className="text-slate-950">{game.title}</strong> ·{" "}
                {game.minPlayers}-{game.maxPlayers} players
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
