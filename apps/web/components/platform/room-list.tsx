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
        title="현재 열려 있는 방이 없습니다"
        description="게임 페이지에서 방을 만들면 가족들이 같은 대기방으로 들어올 수 있습니다."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {rooms.map((room) => (
        <article
          key={room.id}
          className="rounded-[1.9rem] border border-[#ffdca8] bg-[linear-gradient(180deg,_#ffffff_0%,_#fff7e9_100%)] p-5 shadow-[0_18px_50px_rgba(245,158,11,0.1)]"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs tracking-[0.22em] text-[#f97316]">
                {room.status === "waiting"
                  ? "대기 중"
                  : room.status === "playing"
                    ? "진행 중"
                    : "종료됨"}
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[#26324b]">
                {room.gameTitle}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#5f6784]">
                방장: {room.hostName} · 인원: {room.players.length}/{room.maxPlayers}
              </p>
            </div>
            <Link
              className="inline-flex w-fit rounded-full border border-[#ffd58c] bg-[#ffd666] px-4 py-2 text-sm font-medium text-[#25314b] transition hover:bg-[#ffc94f] hover:text-[#1f2a44]"
              href={`/room/${room.id}`}
            >
              방 열기
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
