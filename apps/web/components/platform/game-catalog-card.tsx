import type { GameCatalogWithRoom } from "@family-playground/types";
import type { ReactNode } from "react";

interface GameCatalogCardProps {
  game: GameCatalogWithRoom;
  isPlayable: boolean;
  footer: ReactNode;
}

export function GameCatalogCard({
  game,
  isPlayable,
  footer,
}: GameCatalogCardProps) {
  return (
    <article className="overflow-hidden rounded-[2.1rem] border border-[#ffdca8] bg-white/92 shadow-[0_24px_60px_rgba(245,158,11,0.12)]">
      <div className="border-b border-[#ffe7be] bg-[#fff8ea] p-4 text-[#26324b] md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.24em] text-[#f97316]">
              {game.gameKey}
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] md:text-2xl">
              {game.title}
            </h3>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              isPlayable
                ? "bg-white/70 text-[#1f2a44]"
                : "bg-white/45 text-[#4b556f]"
            }`}
          >
            {isPlayable ? "플레이 가능" : "준비 중"}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#26324b]/85 md:mt-4 md:leading-7">{game.description}</p>
      </div>
      <div className="p-4 md:p-5">
        <div className="flex flex-wrap gap-3 text-sm text-[#4f5d7c]">
          <span className="rounded-full bg-[#fff2cf] px-3 py-1">
            {game.minPlayers}명 ~ {game.maxPlayers}명
          </span>
          <span
            className={`rounded-full px-3 py-1 ${
              game.activeRoomId
                ? "bg-[#ffe3b3] text-[#9a5800]"
                : "bg-[#ddf7e8] text-[#156c4c]"
            }`}
          >
            {game.activeRoomId
              ? `현재 방 인원 ${game.activeRoomPlayerCount}명`
              : "열린 방 없음"}
          </span>
        </div>
        <div className="mt-3 rounded-[1.3rem] bg-[#fff9ec] px-4 py-3 text-sm leading-6 text-[#5f6784] md:mt-4 md:rounded-[1.5rem] md:py-4 md:leading-7">
          {game.activeRoomId ? (
            <>
              방장: {game.activeRoomHostName ?? "알 수 없음"} · 상태:{" "}
              {game.activeRoomStatus === "waiting"
                ? "대기 중"
                : game.activeRoomStatus === "playing"
                  ? "진행 중"
                  : game.activeRoomStatus}
            </>
          ) : (
            <>아직 열린 방이 없습니다. 나중에 실제 게임이 붙으면 여기서 방을 만들 수 있습니다.</>
          )}
        </div>
        <div className="mt-4 [&_button]:w-full [&_a]:w-full [&_a]:justify-center sm:[&_button]:w-auto sm:[&_a]:w-auto">
          {footer}
        </div>
      </div>
    </article>
  );
}
