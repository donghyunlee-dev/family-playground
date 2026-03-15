import { EmptyState, SectionCard } from "@family-playground/ui";
import { requireAppSession } from "@/lib/auth";
import { getRoomById } from "@/lib/platform";
import { finishRoomAction, joinRoomAction, leaveRoomAction, startRoomAction } from "./actions";

interface RoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomId } = await params;
  const { user } = await requireAppSession();
  const room = await getRoomById(roomId);

  if (!room) {
    return (
      <SectionCard
        eyebrow="Room"
        title="Room not found"
        description="The requested room does not exist or is no longer available."
      >
        <EmptyState
          title="Missing room"
          description="Return to the lobby and create a fresh room from the games catalog."
        />
      </SectionCard>
    );
  }

  const isMember = room.players.some((player) => player.userId === user.id);
  const canJoin =
    room.status === "waiting" && !isMember && room.players.length < room.maxPlayers;
  const canStart =
    room.status === "waiting" &&
    room.hostUserId === user.id &&
    room.players.length >= room.minPlayers;
  const canFinish = room.status === "playing" && room.hostUserId === user.id;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
      <div className="grid gap-6">
        <section className="rounded-[2.2rem] bg-[linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_46%,_#7dd3fc_100%)] p-6 text-white shadow-[0_26px_80px_rgba(37,99,235,0.16)] md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-100/90">
            Room
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-balance">
            {room.gameTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-sky-50/85">
            This room stays attached to the game. Family members join here,
            sessions start from here, and when a round ends the same room can
            wait for the next round as long as someone remains inside.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/15 bg-white/10 px-4 py-4">
              <p className="text-sm text-sky-50/78">Status</p>
              <p className="mt-2 text-2xl font-semibold text-white">{room.status}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/15 bg-white/10 px-4 py-4">
              <p className="text-sm text-sky-50/78">Players</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {room.players.length}/{room.maxPlayers}
              </p>
            </div>
          </div>
        </section>

        <SectionCard
          eyebrow="Session"
          title="Room controls"
          description="Host actions drive the room lifecycle until the game-specific realtime UI is added."
        >
          <div className="grid gap-3 text-sm text-slate-700">
            <div className="rounded-[1.5rem] bg-slate-50 px-4 py-3">
              Host: {room.hostName}
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 px-4 py-3">
              Current session: {room.currentSessionId ?? "Not started"}
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 px-4 py-3">
              Start requirement: at least {room.minPlayers} players in the room
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {canJoin ? (
              <form action={joinRoomAction.bind(null, room.id)}>
                <button
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
                  type="submit"
                >
                  Join room
                </button>
              </form>
            ) : null}
            {canStart ? (
              <form action={startRoomAction.bind(null, room.id)}>
                <button
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm text-white transition hover:bg-emerald-500"
                  type="submit"
                >
                  Start session
                </button>
              </form>
            ) : null}
            {canFinish ? (
              <form action={finishRoomAction.bind(null, room.id)}>
                <button
                  className="rounded-full bg-amber-500 px-4 py-2 text-sm text-white transition hover:bg-amber-400"
                  type="submit"
                >
                  Finish session
                </button>
              </form>
            ) : null}
            {isMember ? (
              <form action={leaveRoomAction.bind(null, room.id)}>
                <button
                  className="rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
                  type="submit"
                >
                  Leave room
                </button>
              </form>
            ) : null}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="Players"
        title="Room roster"
        description="Presence is tracked per room now and will feed the realtime layer in the next phase."
      >
        <div className="space-y-3">
          {room.players.map((player) => (
            <article
              key={player.id}
              className="flex items-center justify-between rounded-[1.6rem] bg-slate-50 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-slate-950">{player.displayName}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {player.isHost ? "Host" : "Player"}
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-900">
                {player.presenceStatus}
              </span>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
