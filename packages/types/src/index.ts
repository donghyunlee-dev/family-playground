export type RoomStatus = "waiting" | "playing" | "finished";
export type FamilyRole = "admin" | "member";
export type PresenceStatus = "online" | "away" | "offline";
export type RealtimeEventType =
  | "player_join"
  | "player_leave"
  | "game_start"
  | "turn_update"
  | "game_event"
  | "game_end"
  | "score_update";

export interface PlayerJoinPayload {
  player_id: string;
  display_name: string;
}

export interface PlayerLeavePayload {
  player_id: string;
}

export interface GameStartPayload {
  game_id: string;
  session_id: string;
}

export interface TurnUpdatePayload {
  player_id: string;
}

export interface GameEventPayload {
  type: string;
  [key: string]: unknown;
}

export interface GameEndPayload {
  session_id?: string;
  results: Array<{
    player_id: string;
    score: number;
    rank: number;
  }>;
}

export interface ScoreUpdatePayload {
  user_id: string;
  score_delta: number;
  new_total_score: number;
}

export interface RoomPresenceState {
  user_id: string;
  display_name: string;
  room_id: string;
  status: PresenceStatus;
  joined_at: string;
}

export interface RealtimeMessage<TPayload = unknown> {
  event_type: RealtimeEventType;
  room_id: string;
  user_id: string;
  payload: TPayload;
  timestamp: string;
}

export type RoomRealtimePayloadMap = {
  player_join: PlayerJoinPayload;
  player_leave: PlayerLeavePayload;
  game_start: GameStartPayload;
  turn_update: TurnUpdatePayload;
  game_event: GameEventPayload;
  game_end: GameEndPayload;
  score_update: ScoreUpdatePayload;
};

export type RoomRealtimeMessage<TEvent extends RealtimeEventType = RealtimeEventType> =
  RealtimeMessage<RoomRealtimePayloadMap[TEvent]> & {
    event_type: TEvent;
  };

export function getRoomChannelName(roomId: string) {
  return `room:${roomId}`;
}

export function createRoomRealtimeMessage<TEvent extends RealtimeEventType>(
  eventType: TEvent,
  roomId: string,
  userId: string,
  payload: RoomRealtimePayloadMap[TEvent],
): RoomRealtimeMessage<TEvent> {
  return {
    event_type: eventType,
    room_id: roomId,
    user_id: userId,
    payload,
    timestamp: new Date().toISOString(),
  };
}

export interface GamePlayer {
  id: string;
  name: string;
  score: number;
}

export interface GameResult {
  winnerIds: string[];
  scores: Record<string, number>;
}

export interface GameDefinition<TState, TEvent> {
  id: string;
  title: string;
  summary?: string;
  minPlayers: number;
  maxPlayers: number;
  createInitialState: () => TState;
  applyEvent: (state: TState, event: TEvent) => TState;
  isGameFinished: (state: TState) => boolean;
  calculateResult: (state: TState) => GameResult;
}

export interface ProfileSummary {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  totalScore: number;
  gamesPlayed: number;
  lastSeenAt: string | null;
}

export interface FamilyMemberAccess {
  id: string;
  email: string;
  userId: string | null;
  role: FamilyRole;
  isAllowed: boolean;
}

export interface GameCatalogEntry {
  id: string;
  gameKey: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  minPlayers: number;
  maxPlayers: number;
  enabled: boolean;
}

export interface GameCatalogWithRoom extends GameCatalogEntry {
  activeRoomId: string | null;
  activeRoomStatus: RoomStatus | null;
  activeRoomPlayerCount: number;
  activeRoomHostName: string | null;
}

export interface RoomPlayerSummary {
  id: string;
  roomId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  joinedAt: string;
  isHost: boolean;
  presenceStatus: PresenceStatus;
}

export interface RoomSummary {
  id: string;
  gameId: string;
  gameKey: string;
  gameTitle: string;
  hostUserId: string;
  hostName: string;
  status: RoomStatus;
  createdAt: string;
  currentSessionId: string | null;
  minPlayers: number;
  maxPlayers: number;
  players: RoomPlayerSummary[];
}

export interface ScoreHistoryEntry {
  id: string;
  gameTitle: string;
  scoreDelta: number;
  reason: string;
  runningTotal: number;
  createdAt: string;
}
