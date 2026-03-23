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
  const thumbnailLabel = game.title
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="overflow-hidden rounded-[1.8rem] border border-[#d8dee8] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <div className="flex gap-4 p-4 md:gap-5 md:p-5">
        <div className="shrink-0">
          {game.thumbnailUrl ? (
            <div
              className="h-24 w-24 rounded-[1.4rem] bg-cover bg-center md:h-28 md:w-28"
              style={{ backgroundImage: `url(${game.thumbnailUrl})` }}
            />
          ) : (
            <div className="flex h-24 w-24 items-end rounded-[1.4rem] bg-[linear-gradient(160deg,#1f2937,#475569)] p-3 text-white md:h-28 md:w-28">
              <div>
                <p className="text-[10px] tracking-[0.2em] text-white/70">
                  GAME
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                  {thumbnailLabel}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 text-[#1f2937]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] tracking-[0.18em] text-[#64748b]">
                {game.gameKey}
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[#0f172a] md:text-xl">
                {game.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#475569]">
                {game.description}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                isPlayable
                  ? "bg-[#e6f6ec] text-[#17603a]"
                  : "bg-[#eef2f6] text-[#526173]"
              }`}
            >
              {isPlayable ? "플레이 가능" : "준비 중"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-[#334155]">
              {game.minPlayers}명 ~ {game.maxPlayers}명
            </span>
            <span
              className={`rounded-full px-3 py-1 ${
                game.activeRoomId
                  ? "bg-[#fff4e5] text-[#9a5b13]"
                  : "bg-[#ecfdf3] text-[#1f6b45]"
              }`}
            >
              {game.activeRoomId
                ? `열린 방 ${game.activeRoomPlayerCount}명`
                : "열린 방 없음"}
            </span>
          </div>

          <div className="mt-3 rounded-[1.2rem] bg-[#f8fafc] px-4 py-3 text-sm leading-6 text-[#475569]">
            {game.activeRoomId ? (
              <>
                방장 {game.activeRoomHostName ?? "알 수 없음"} ·{" "}
                {game.activeRoomStatus === "waiting" ? "대기방 열림" : "게임 진행 중"}
              </>
            ) : (
              <>-</>
            )}
          </div>

          <div className="mt-4 [&_button]:w-full [&_a]:w-full [&_a]:justify-center sm:[&_button]:w-auto sm:[&_a]:w-auto">
            {footer}
          </div>
        </div>
      </div>
    </article>
  );
}
