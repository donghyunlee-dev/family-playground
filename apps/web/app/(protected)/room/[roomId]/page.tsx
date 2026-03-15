import { EmptyState, SectionCard } from "@family-playground/ui";
import { requireAppSession } from "@/lib/auth";
import { getRoomById } from "@/lib/platform";
import { joinRoomAction, startRoomAction } from "./actions";

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

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <SectionCard
        eyebrow="Room"
        title={room.gameTitle}
        description="Rooms coordinate membership, host control, and game session lifecycle before individual game UIs take over."
      >
        <div className="grid gap-3 text-sm text-stone-700">
          <div className="rounded-2xl bg-stone-50 px-4 py-3">
            Status: {room.status}
          </div>
          <div className="rounded-2xl bg-stone-50 px-4 py-3">
            Host: {room.hostName}
          </div>
          <div className="rounded-2xl bg-stone-50 px-4 py-3">
            Players: {room.players.length}/{room.maxPlayers}
          </div>
          <div className="rounded-2xl bg-stone-50 px-4 py-3">
            Current session: {room.currentSessionId ?? "Not started"}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {canJoin ? (
            <form action={joinRoomAction.bind(null, room.id)}>
              <button
                className="rounded-full bg-stone-950 px-4 py-2 text-sm text-stone-50 transition hover:bg-stone-800"
                type="submit"
              >
                Join room
              </button>
            </form>
          ) : null}
          {canStart ? (
            <form action={startRoomAction.bind(null, room.id)}>
              <button
                className="rounded-full bg-orange-600 px-4 py-2 text-sm text-white transition hover:bg-orange-500"
                type="submit"
              >
                Start game session
              </button>
            </form>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Players"
        title="Room roster"
        description="Presence is tracked per room and will feed the realtime layer in the next phase."
      >
        <div className="space-y-3">
          {room.players.map((player) => (
            <article
              key={player.id}
              className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-stone-900">{player.displayName}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-500">
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
