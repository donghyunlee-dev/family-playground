"use client";

import {
  createRoomRealtimeMessage,
  getRoomChannelName,
  type RoomPresenceState,
  type RealtimeEventType,
} from "@family-playground/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

interface RoomRealtimePanelProps {
  roomId: string;
  gameId: string;
  userId: string;
  displayName: string;
  roomStatus: "waiting" | "playing" | "finished";
  currentSessionId: string | null;
  isHost: boolean;
}

const broadcastEvents: RealtimeEventType[] = [
  "player_join",
  "player_leave",
  "game_start",
  "turn_update",
  "game_event",
  "game_end",
  "score_update",
];

export function RoomRealtimePanel({
  roomId,
  gameId,
  userId,
  displayName,
  roomStatus,
  currentSessionId,
  isHost,
}: RoomRealtimePanelProps) {
  const router = useRouter();
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isSubscribedRef = useRef(false);
  const previousRoomStatusRef = useRef(roomStatus);
  const previousSessionIdRef = useRef(currentSessionId);
  const [connectionState, setConnectionState] = useState("연결 중");
  const [presenceCount, setPresenceCount] = useState(1);
  const [lastEventLabel, setLastEventLabel] = useState("방 연결 대기 중");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase.channel(getRoomChannelName(roomId), {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    const scheduleRefresh = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      refreshTimeoutRef.current = setTimeout(() => {
        router.refresh();
      }, 150);
    };

    const updatePresenceCount = () => {
      const presenceState = channel.presenceState<RoomPresenceState>();
      const activeUsers = new Set<string>();

      Object.values(presenceState).forEach((entries) => {
        entries.forEach((entry) => {
          activeUsers.add(entry.user_id);
        });
      });

      setPresenceCount(activeUsers.size || 1);
    };

    channel
      .on("presence", { event: "sync" }, () => {
        updatePresenceCount();
        scheduleRefresh();
      })
      .on("presence", { event: "join" }, () => {
        updatePresenceCount();
        scheduleRefresh();
      })
      .on("presence", { event: "leave" }, () => {
        updatePresenceCount();
        scheduleRefresh();
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_players",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          scheduleRefresh();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_rooms",
          filter: `id=eq.${roomId}`,
        },
        () => {
          scheduleRefresh();
        },
      );

    broadcastEvents.forEach((eventType) => {
      channel.on("broadcast", { event: eventType }, () => {
        setLastEventLabel(
          eventType === "game_start"
            ? "게임 시작이 감지되었습니다"
            : eventType === "game_end"
              ? "게임 종료가 감지되었습니다"
              : eventType === "player_join"
                ? "참가자 변경이 감지되었습니다"
                : "실시간 이벤트가 반영되었습니다",
        );
        scheduleRefresh();
      });
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        isSubscribedRef.current = true;
        setConnectionState("실시간 연결됨");
        await channel.track({
          user_id: userId,
          display_name: displayName,
          room_id: roomId,
          status: "online",
          joined_at: new Date().toISOString(),
        } satisfies RoomPresenceState);

        await channel.send({
          type: "broadcast",
          event: "player_join",
          payload: createRoomRealtimeMessage("player_join", roomId, userId, {
            player_id: userId,
            display_name: displayName,
          }),
        });

        setLastEventLabel("실시간 연결이 완료되었습니다");
        scheduleRefresh();
        return;
      }

      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        isSubscribedRef.current = false;
        setConnectionState("실시간 재연결 필요");
        return;
      }

      if (status === "CLOSED") {
        isSubscribedRef.current = false;
        setConnectionState("실시간 연결 종료");
      }
    });

    channelRef.current = channel;

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      void channel.send({
        type: "broadcast",
        event: "player_leave",
        payload: createRoomRealtimeMessage("player_leave", roomId, userId, {
          player_id: userId,
        }),
      });
      void channel.untrack();
      void supabase.removeChannel(channel);
      channelRef.current = null;
      isSubscribedRef.current = false;
    };
  }, [displayName, roomId, router, userId]);

  useEffect(() => {
    const channel = channelRef.current;

    if (!channel || !isSubscribedRef.current || !isHost) {
      previousRoomStatusRef.current = roomStatus;
      previousSessionIdRef.current = currentSessionId;
      return;
    }

    const previousStatus = previousRoomStatusRef.current;
    if (
      previousStatus === "waiting" &&
      roomStatus === "playing" &&
      currentSessionId
    ) {
      void channel.send({
        type: "broadcast",
        event: "game_start",
        payload: createRoomRealtimeMessage("game_start", roomId, userId, {
          game_id: gameId,
          session_id: currentSessionId,
        }),
      });
      setLastEventLabel("게임 시작 이벤트 전송됨");
    }

    previousRoomStatusRef.current = roomStatus;
    previousSessionIdRef.current = currentSessionId;
  }, [currentSessionId, gameId, isHost, roomId, roomStatus, userId]);

  return (
    <div className="rounded-[1.5rem] bg-[#eef8ff] px-4 py-3 text-sm text-[#35516f]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>실시간 상태</span>
        <span>{connectionState}</span>
      </div>
      <p className="mt-2">
        현재 이 방을 보고 있는 인원: {presenceCount}명
      </p>
      <p className="mt-1 text-xs text-[#4b6c8d]">
        최근 이벤트: {lastEventLabel}
      </p>
      <p className="mt-1 text-[11px] text-[#6a84a0]">
        채널 {getRoomChannelName(roomId)}
      </p>
    </div>
  );
}
