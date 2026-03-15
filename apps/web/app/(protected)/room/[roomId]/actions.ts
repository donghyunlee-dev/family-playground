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
  const { error } = await supabase.from("room_players").insert({
    room_id: roomId,
    user_id: user.id,
    is_host: false,
    presence_status: "online",
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
  const { data: session, error: sessionError } = await supabase
    .from("game_sessions")
    .insert({
      room_id: room.id,
      game_id: room.gameId,
      status: "in_progress",
    })
    .select("*")
    .single();

  if (sessionError || !session) {
    throw sessionError ?? new Error("Unable to create game session.");
  }

  const { error: roomError } = await supabase
    .from("game_rooms")
    .update({
      status: "playing",
      current_session_id: session.id,
    })
    .eq("id", room.id);

  if (roomError) {
    throw roomError;
  }

  revalidatePath("/lobby");
  revalidatePath("/games");
  revalidatePath(`/room/${roomId}`);
  redirect(`/room/${roomId}`);
}
