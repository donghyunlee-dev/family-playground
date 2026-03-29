"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAppSession } from "@/lib/auth";
import { ensureCanonicalGameSettings, getActiveRoomForUser } from "@/lib/platform";
import { getRoomPath } from "@/lib/room-routes";
import { createSupabaseAdminClient } from "@/lib/supabase/config";

export async function createRoomAction(formData: FormData) {
  const { user } = await requireAppSession();
  const gameId = String(formData.get("gameId") ?? "");

  await ensureCanonicalGameSettings();

  if (!gameId) {
    throw new Error("Missing game id.");
  }

  const supabase = createSupabaseAdminClient();
  const userActiveRoom = await getActiveRoomForUser(user.id);

  if (userActiveRoom) {
    redirect(getRoomPath(userActiveRoom.id, userActiveRoom.status));
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
    redirect(
      getRoomPath(
        existingRoom.id,
        existingRoom.status as "waiting" | "playing" | "finished",
      ),
    );
  }

  const { data: roomId, error: roomError } = await supabase.rpc(
    "create_game_room",
    {
      p_game_id: game.id,
      p_host_user_id: user.id,
    },
  );

  if (roomError || !roomId) {
    throw roomError ?? new Error("Unable to create room.");
  }

  revalidatePath("/games");
  revalidatePath("/lobby");
  revalidatePath(`/room/${roomId}`);
  redirect(`/room/${roomId}`);
}
