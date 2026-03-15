export type RoomStatus = "waiting" | "playing" | "finished";
export type FamilyRole = "admin" | "member";
export type PresenceStatus = "online" | "away" | "offline";

export interface RealtimeMessage<TPayload = unknown> {
  event_type:
    | "player_join"
    | "player_leave"
    | "game_start"
    | "turn_update"
    | "game_event"
    | "game_end"
    | "score_update";
  room_id: string;
  user_id: string;
  payload: TPayload;
  timestamp: string;
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
