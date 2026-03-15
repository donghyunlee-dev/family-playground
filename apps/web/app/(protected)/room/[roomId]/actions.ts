"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAppSession } from "@/lib/auth";
import { getActiveRoomForUser, getRoomById } from "@/lib/platform";
import { createSupabaseAdminClient } from "@/lib/supabase/config";

export async function joinRoomAction(roomId: string) {
  const { user } = await requireAppSession();
  const room = await getRoomById(roomId);

  if (!room) {
    throw new Error("Room not found.");
  }

  if (room.status !== "waiting") {
    throw new Error("Only waiting rooms can be joined.");
  }

  if (room.players.some((player) => player.userId === user.id)) {
    redirect(`/room/${roomId}`);
  }

  const userActiveRoom = await getActiveRoomForUser(user.id);

  if (userActiveRoom && userActiveRoom.id !== roomId) {
    redirect(`/room/${userActiveRoom.id}`);
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
  redirect(`/room/${roomId}`);
}

export async function finishRoomAction(roomId: string) {
  const { user } = await requireAppSession();
  const room = await getRoomById(roomId);

  if (!room) {
    throw new Error("Room not found.");
  }

  if (room.hostUserId !== user.id) {
    throw new Error("Only the host can finish the session.");
  }

  if (room.status !== "playing" || !room.currentSessionId) {
    throw new Error("Room does not have an active session.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.rpc("finish_game_room_session", {
    p_room_id: room.id,
    p_host_user_id: user.id,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/lobby");
  revalidatePath("/games");
  revalidatePath(`/room/${roomId}`);
  redirect(`/room/${roomId}`);
}

export async function leaveRoomAction(roomId: string) {
  const { user } = await requireAppSession();
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
