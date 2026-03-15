import type { GameCatalogWithRoom } from "@family-playground/types";
import type { ReactNode } from "react";

interface GameCatalogCardProps {
  game: GameCatalogWithRoom;
  footer: ReactNode;
}

export function GameCatalogCard({ game, footer }: GameCatalogCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-stone-900/10 bg-white/80 p-5 shadow-[0_18px_40px_rgba(28,25,23,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-sky-700">
            {game.gameKey}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-stone-900">
            {game.title}
          </h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            game.enabled
              ? "bg-emerald-100 text-emerald-900"
              : "bg-stone-200 text-stone-600"
          }`}
        >
          {game.enabled ? "Enabled" : "Planned"}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-stone-600">{game.description}</p>
      <div className="mt-5 flex gap-3 text-sm text-stone-700">
        <span className="rounded-full bg-stone-100 px-3 py-1">
          {game.minPlayers} to {game.maxPlayers} players
        </span>
        {game.activeRoomId ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
            Room active: {game.activeRoomPlayerCount} players
          </span>
        ) : null}
      </div>
      {game.activeRoomId ? (
        <p className="mt-4 text-sm text-stone-600">
          Host: {game.activeRoomHostName ?? "Unknown"} · Status:{" "}
          {game.activeRoomStatus}
        </p>
      ) : null}
      <div className="mt-6">{footer}</div>
    </article>
  );
}
