import type {
  FamilyMemberAccess,
  GameCatalogEntry,
  GameCatalogWithRoom,
  ProfileSummary,
  RoomPlayerSummary,
  RoomSummary,
  ScoreHistoryEntry,
} from "@family-playground/types";
import type { User } from "@supabase/supabase-js";
import { cache } from "react";
import { fallbackGames } from "@/lib/mock";
import { createSupabaseAdminClient } from "@/lib/supabase/config";

function getDisplayName(user: User) {
  const metadata = user.user_metadata as Record<string, string | undefined>;

  return (
    metadata.full_name ??
    metadata.name ??
    metadata.user_name ??
    user.email?.split("@")[0] ??
    "Family Player"
  );
}

export const ensureFamilyAccess = cache(async (user: User) => {
  const supabase = createSupabaseAdminClient();
  const email = user.email?.toLowerCase();

  if (!email) {
    return {
      allowed: false as const,
      reason: "missing-email",
      member: null,
      profile: null,
    };
  }

  const { data: member, error: memberError } = await supabase
    .from("family_members")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (memberError) {
    throw memberError;
  }

  let effectiveMember = member;

  if (!effectiveMember) {
    const { count, error: countError } = await supabase
      .from("family_members")
      .select("*", { count: "exact", head: true });

    if (countError) {
      throw countError;
    }

    if ((count ?? 0) === 0) {
      const { data: bootstrappedMember, error: bootstrapError } = await supabase
        .from("family_members")
        .insert({
          email,
          user_id: user.id,
          role: "admin",
          is_allowed: true,
        })
        .select("*")
        .single();

      if (bootstrapError || !bootstrappedMember) {
        throw bootstrapError ?? new Error("Unable to bootstrap family admin.");
      }

      effectiveMember = bootstrappedMember;
    }
  }

  if (!effectiveMember || !effectiveMember.is_allowed) {
    return {
      allowed: false as const,
      reason: "not-allowed",
      member: null,
      profile: null,
    };
  }

  if (effectiveMember.user_id && effectiveMember.user_id !== user.id) {
    return {
      allowed: false as const,
      reason: "email-claimed",
      member: null,
      profile: null,
    };
  }

  const displayName = getDisplayName(user);
  const avatarUrl =
    ((user.user_metadata as Record<string, string | undefined>).avatar_url ??
      (user.user_metadata as Record<string, string | undefined>).picture) ||
    null;

  const { error: membershipUpdateError } = await supabase
    .from("family_members")
    .update({
      user_id: user.id,
    })
    .eq("id", effectiveMember.id);

  if (membershipUpdateError) {
    throw membershipUpdateError;
  }

  const profilePayload = {
    id: user.id,
    email,
    display_name: displayName,
    avatar_url: avatarUrl,
    is_active: true,
    last_seen_at: new Date().toISOString(),
  };

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" });

  if (profileError) {
    throw profileError;
  }

  const { data: profile, error: profileFetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileFetchError) {
    throw profileFetchError;
  }

  return {
    allowed: true as const,
    reason: null,
    member: mapFamilyMember(effectiveMember),
    profile: mapProfile(profile),
  };
});

export async function listGames(): Promise<GameCatalogEntry[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return fallbackGames;
  }

  return data.map((game) => ({
    id: game.id,
    gameKey: game.game_key,
    title: game.title,
    description: game.description,
    thumbnailUrl: game.thumbnail_url,
    minPlayers: game.min_players,
    maxPlayers: game.max_players,
    enabled: game.enabled,
  }));
}

export async function listGamesWithRoomState(): Promise<GameCatalogWithRoom[]> {
  const [games, rooms] = await Promise.all([listGames(), listOpenRooms()]);

  return games.map((game) => {
    const activeRoom =
      rooms.find(
        (room) =>
          room.gameId === game.id &&
          (room.status === "waiting" || room.status === "playing"),
      ) ?? null;

    return {
      ...game,
      activeRoomId: activeRoom?.id ?? null,
      activeRoomStatus: activeRoom?.status ?? null,
      activeRoomPlayerCount: activeRoom?.players.length ?? 0,
      activeRoomHostName: activeRoom?.hostName ?? null,
    };
  });
}

export async function getLeaderboard(limit = 5): Promise<ProfileSummary[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("total_score", { ascending: false })
    .order("games_played", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return data.map(mapProfile);
}

export async function listOpenRooms(): Promise<RoomSummary[]> {
  const supabase = createSupabaseAdminClient();
  const { data: rooms, error: roomsError } = await supabase
    .from("game_rooms")
    .select("*")
    .neq("status", "finished")
    .order("created_at", { ascending: false });

  if (roomsError || !rooms) {
    return [];
  }

  const roomIds = rooms.map((room) => room.id);
  const gameIds = [...new Set(rooms.map((room) => room.game_id))];
  const userIds = [...new Set(rooms.map((room) => room.host_user_id))];

  const [{ data: games }, { data: players }, { data: profiles }] =
    await Promise.all([
      supabase.from("games").select("*").in("id", gameIds),
      roomIds.length > 0
        ? supabase
            .from("room_players")
            .select("*")
            .in("room_id", roomIds)
            .is("left_at", null)
        : Promise.resolve({ data: [], error: null }),
      userIds.length > 0
        ? supabase.from("profiles").select("*").in("id", userIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  const profileIds = new Set(players?.map((player) => player.user_id) ?? []);
  const missingProfileIds = [...profileIds].filter(
    (id) => !(profiles ?? []).some((profile) => profile.id === id),
  );

  const { data: playerProfiles } =
    missingProfileIds.length > 0
      ? await supabase.from("profiles").select("*").in("id", missingProfileIds)
      : { data: [] };

  const allProfiles = [...(profiles ?? []), ...(playerProfiles ?? [])];

  return rooms.map((room) =>
    mapRoom(
      room,
      games?.find((game) => game.id === room.game_id) ?? null,
      (players ?? []).filter((player) => player.room_id === room.id),
      allProfiles,
    ),
  );
}

export async function getRoomById(roomId: string): Promise<RoomSummary | null> {
  const supabase = createSupabaseAdminClient();
  const { data: room, error } = await supabase
    .from("game_rooms")
    .select("*")
    .eq("id", roomId)
    .maybeSingle();

  if (error || !room) {
    return null;
  }

  const [{ data: game }, { data: players }, { data: profiles }] =
    await Promise.all([
      supabase.from("games").select("*").eq("id", room.game_id).single(),
      supabase
        .from("room_players")
        .select("*")
        .eq("room_id", roomId)
        .is("left_at", null),
      supabase.from("profiles").select("*"),
    ]);

  return mapRoom(room, game ?? null, players ?? [], profiles ?? []);
}

export async function getActiveRoomForUser(userId: string): Promise<RoomSummary | null> {
  const rooms = await listOpenRooms();

  return (
    rooms.find((room) =>
      room.players.some((player) => player.userId === userId),
    ) ?? null
  );
}

export async function getRecentScoreHistory(
  userId: string,
  limit = 10,
): Promise<ScoreHistoryEntry[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("score_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    return [];
  }

  const gameIds = [...new Set(data.map((entry) => entry.game_id))];
  const { data: games } =
    gameIds.length > 0
      ? await supabase.from("games").select("*").in("id", gameIds)
      : { data: [] };

  return data.map((entry) => ({
    id: entry.id,
    gameTitle:
      games?.find((game) => game.id === entry.game_id)?.title ?? "Unknown Game",
    scoreDelta: entry.score_delta,
    reason: entry.reason,
    runningTotal: entry.running_total,
    createdAt: entry.created_at,
  }));
}

function mapProfile(row: {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  total_score: number;
  games_played: number;
  last_seen_at: string | null;
}) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    totalScore: row.total_score,
    gamesPlayed: row.games_played,
    lastSeenAt: row.last_seen_at,
  };
}

function mapFamilyMember(row: {
  id: string;
  email: string;
  user_id: string | null;
  role: "admin" | "member";
  is_allowed: boolean;
}) {
  return {
    id: row.id,
    email: row.email,
    userId: row.user_id,
    role: row.role,
    isAllowed: row.is_allowed,
  } satisfies FamilyMemberAccess;
}

function mapRoom(
  room: {
    id: string;
    game_id: string;
    host_user_id: string;
    status: "waiting" | "playing" | "finished";
    created_at: string;
    current_session_id: string | null;
  },
  game: {
    game_key: string;
    title: string;
    min_players: number;
    max_players: number;
  } | null,
  players: Array<{
    id: string;
    room_id: string;
    user_id: string;
    joined_at: string;
    is_host: boolean;
    presence_status: "online" | "away" | "offline";
  }>,
  profiles: Array<{
    id: string;
    display_name: string;
    avatar_url: string | null;
  }>,
) {
  const mappedPlayers: RoomPlayerSummary[] = players.map((player) => ({
    id: player.id,
    roomId: player.room_id,
    userId: player.user_id,
    displayName:
      profiles.find((profile) => profile.id === player.user_id)?.display_name ??
      "Family Player",
    avatarUrl:
      profiles.find((profile) => profile.id === player.user_id)?.avatar_url ??
      null,
    joinedAt: player.joined_at,
    isHost: player.is_host,
    presenceStatus: player.presence_status,
  }));

  return {
    id: room.id,
    gameId: room.game_id,
    gameKey: game?.game_key ?? "unknown",
    gameTitle: game?.title ?? "Unknown Game",
    hostUserId: room.host_user_id,
    hostName:
      profiles.find((profile) => profile.id === room.host_user_id)?.display_name ??
      "Host",
    status: room.status,
    createdAt: room.created_at,
    currentSessionId: room.current_session_id,
    minPlayers: game?.min_players ?? 1,
    maxPlayers: game?.max_players ?? 4,
    players: mappedPlayers,
  } satisfies RoomSummary;
}
