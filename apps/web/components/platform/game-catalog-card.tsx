import type { GameCatalogWithRoom } from "@family-playground/types";
import type { ReactNode } from "react";

interface GameCatalogCardProps {
  game: GameCatalogWithRoom;
  footer: ReactNode;
}

export function GameCatalogCard({ game, footer }: GameCatalogCardProps) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/88 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div className="bg-[linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_50%,_#7dd3fc_100%)] p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-sky-100/85">
              {game.gameKey}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
              {game.title}
            </h3>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              game.enabled
                ? "bg-white/18 text-white"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {game.enabled ? "Enabled" : "Planned"}
          </span>
        </div>
        <p className="mt-4 text-sm leading-7 text-sky-50/85">{game.description}</p>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-3 text-sm text-slate-700">
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {game.minPlayers} to {game.maxPlayers} players
          </span>
          <span
            className={`rounded-full px-3 py-1 ${
              game.activeRoomId
                ? "bg-amber-100 text-amber-900"
                : "bg-emerald-100 text-emerald-900"
            }`}
          >
            {game.activeRoomId
              ? `${game.activeRoomPlayerCount} players in room`
              : "Room available"}
          </span>
        </div>
        <div className="mt-4 rounded-[1.4rem] bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
          {game.activeRoomId ? (
            <>
              Host: {game.activeRoomHostName ?? "Unknown"} · Status:{" "}
              {game.activeRoomStatus}
            </>
          ) : (
            <>No active room yet. The first family member to open it becomes the host.</>
          )}
        </div>
        <div className="mt-5">{footer}</div>
      </div>
    </article>
  );
}
