"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAppSession } from "@/lib/auth";
import {
  ensureCanonicalGameSettings,
  getActiveRoomForUser,
  getRoomById,
} from "@/lib/platform";
import { getRoomPath } from "@/lib/room-routes";
import {
  parseSessionFinishPayload,
  toSessionFinishRpcPayload,
} from "@/lib/session-result";
import type { Json } from "@/lib/supabase/types";
import { createSupabaseAdminClient } from "@/lib/supabase/config";

export async function joinRoomAction(roomId: string) {
  const { user } = await requireAppSession();
  await ensureCanonicalGameSettings();
  const room = await getRoomById(roomId);

  if (!room) {
    throw new Error("Room not found.");
  }

  if (room.status !== "waiting") {
    throw new Error("Only waiting rooms can be joined.");
  }

  if (room.players.some((player) => player.userId === user.id)) {
    redirect(getRoomPath(roomId, room.status));
  }

  const userActiveRoom = await getActiveRoomForUser(user.id);

  if (userActiveRoom && userActiveRoom.id !== roomId) {
    redirect(getRoomPath(userActiveRoom.id, userActiveRoom.status));
  }

  if (room.players.length >= room.maxPlayers) {
    throw new Error("Room is full.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.rpc("join_game_room", {
    p_room_id: roomId,
    p_user_id: user.id,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/lobby");
  revalidatePath("/games");
  revalidatePath(`/room/${roomId}`);
  redirect(`/room/${roomId}`);
}

export async function startRoomAction(roomId: string) {
  const { user } = await requireAppSession();
  await ensureCanonicalGameSettings();
  const room = await getRoomById(roomId);

  if (!room) {
    throw new Error("Room not found.");
  }

  if (room.hostUserId !== user.id) {
    throw new Error("Only the host can start the game.");
  }

  if (room.status !== "waiting") {
    throw new Error("Room is not in waiting state.");
  }

  if (room.players.length < room.minPlayers) {
    throw new Error("Not enough players to start.");
  }

  const supabase = createSupabaseAdminClient();
  const { data: sessionId, error: sessionError } = await supabase.rpc(
    "start_game_room_session",
    {
      p_room_id: room.id,
      p_host_user_id: user.id,
    },
  );

  if (sessionError || !sessionId) {
    throw sessionError ?? new Error("Unable to create game session.");
  }

  revalidatePath("/lobby");
  revalidatePath("/games");
  revalidatePath(`/room/${roomId}`);
  redirect(`/room/${roomId}/play`);
}

export async function finishRoomAction(roomId: string, formData: FormData) {
  const { user } = await requireAppSession();
  await ensureCanonicalGameSettings();
  const room = await getRoomById(roomId);

  if (!room) {
    throw new Error("Room not found.");
  }

  if (room.hostUserId !== user.id) {
    throw new Error("Only the host can finish the session.");
  }

  const sessionId = String(formData.get("sessionId") ?? "");
  const resultPayload = String(formData.get("resultPayload") ?? "");

  if (!sessionId || !resultPayload) {
    throw new Error("Missing session finish payload.");
  }

  const parsedPayload = parseSessionFinishPayload(resultPayload);

  if (parsedPayload.sessionId !== sessionId) {
    throw new Error("Session finish payload does not match the submitted session.");
  }

  if (parsedPayload.gameKey !== room.gameKey) {
    throw new Error("Session finish payload does not match the room game.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.rpc("finish_game_room_session", {
    p_room_id: room.id,
    p_host_user_id: user.id,
    p_session_id: parsedPayload.sessionId,
    p_result_payload: toSessionFinishRpcPayload(parsedPayload) as unknown as Json,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/lobby");
  revalidatePath("/games");
  revalidatePath("/ranking");
  revalidatePath("/profile");
  revalidatePath(`/room/${roomId}`);
  redirect(`/room/${roomId}`);
}

export async function leaveRoomAction(roomId: string) {
  const { user } = await requireAppSession();
  await ensureCanonicalGameSettings();
  const room = await getRoomById(roomId);

  if (!room) {
    redirect("/lobby");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.rpc("leave_game_room", {
    p_room_id: room.id,
    p_user_id: user.id,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/lobby");
  revalidatePath("/games");
  revalidatePath(`/room/${roomId}`);
  redirect("/lobby");
}
