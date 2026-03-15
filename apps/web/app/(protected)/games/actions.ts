"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAppSession } from "@/lib/auth";
import { getActiveRoomForUser } from "@/lib/platform";
import { createSupabaseAdminClient } from "@/lib/supabase/config";

export async function createRoomAction(formData: FormData) {
  const { user } = await requireAppSession();
  const gameId = String(formData.get("gameId") ?? "");

  if (!gameId) {
    throw new Error("Missing game id.");
  }

  const supabase = createSupabaseAdminClient();
  const userActiveRoom = await getActiveRoomForUser(user.id);

  if (userActiveRoom) {
    redirect(`/room/${userActiveRoom.id}`);
  }

  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .eq("enabled", true)
    .single();

  if (gameError || !game) {
    throw new Error("Game is not available for room creation.");
  }

  const { data: existingRoom } = await supabase
    .from("game_rooms")
    .select("*")
    .eq("game_id", game.id)
    .in("status", ["waiting", "playing"])
    .maybeSingle();

  if (existingRoom) {
    redirect(`/room/${existingRoom.id}`);
  }

  const { data: room, error: roomError } = await supabase
    .from("game_rooms")
    .insert({
      game_id: game.id,
      host_user_id: user.id,
      status: "waiting",
    })
    .select("*")
    .single();

  if (roomError || !room) {
    throw roomError ?? new Error("Unable to create room.");
  }

  const { error: roomPlayerError } = await supabase.from("room_players").insert({
    room_id: room.id,
    user_id: user.id,
    is_host: true,
    presence_status: "online",
  });

  if (roomPlayerError) {
    throw roomPlayerError;
  }

  revalidatePath("/games");
  revalidatePath("/lobby");
  revalidatePath(`/room/${room.id}`);
  redirect(`/room/${room.id}`);
}
