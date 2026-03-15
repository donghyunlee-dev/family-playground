import type { RoomSummary } from "@family-playground/types";
import Link from "next/link";
import { EmptyState } from "@family-playground/ui";

interface RoomListProps {
  rooms: RoomSummary[];
}

export function RoomList({ rooms }: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <EmptyState
        title="No active rooms"
        description="Create a new room from the games page to start a waiting lobby for your family."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {rooms.map((room) => (
        <article
          key={room.id}
          className="rounded-[1.5rem] border border-stone-900/10 bg-stone-50 p-4"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-orange-700">
                {room.status}
              </p>
              <h3 className="mt-2 text-xl font-semibold">{room.gameTitle}</h3>
              <p className="mt-2 text-sm text-stone-600">
                Host: {room.hostName} · Players: {room.players.length}/
                {room.maxPlayers}
              </p>
            </div>
            <Link
              className="inline-flex w-fit rounded-full bg-stone-950 px-4 py-2 text-sm text-stone-50 transition hover:bg-stone-800"
              href={`/room/${room.id}`}
            >
              Open room
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
