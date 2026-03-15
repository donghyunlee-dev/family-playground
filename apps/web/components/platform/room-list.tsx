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
          className="rounded-[1.8rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-sky-700">
                {room.status}
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-slate-950">
                {room.gameTitle}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Host: {room.hostName} · Players: {room.players.length}/
                {room.maxPlayers}
              </p>
            </div>
            <Link
              className="inline-flex w-fit rounded-full bg-slate-950 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
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
