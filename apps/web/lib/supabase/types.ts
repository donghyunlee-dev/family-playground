export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      family_members: {
        Row: {
          id: string;
          email: string;
          user_id: string | null;
          role: "admin" | "member";
          joined_at: string;
          is_allowed: boolean;
          invited_by: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          user_id?: string | null;
          role?: "admin" | "member";
          joined_at?: string;
          is_allowed?: boolean;
          invited_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["family_members"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
          total_score: number;
          games_played: number;
          last_seen_at: string | null;
          is_active: boolean;
        };
        Insert: {
          id: string;
          email: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
          total_score?: number;
          games_played?: number;
          last_seen_at?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      games: {
        Row: {
          id: string;
          game_key: string;
          title: string;
          description: string;
          thumbnail_url: string | null;
          min_players: number;
          max_players: number;
          enabled: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          game_key: string;
          title: string;
          description: string;
          thumbnail_url?: string | null;
          min_players: number;
          max_players: number;
          enabled?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["games"]["Insert"]>;
      };
      game_rooms: {
        Row: {
          id: string;
          game_id: string;
          host_user_id: string;
          status: "waiting" | "playing" | "finished";
          created_at: string;
          updated_at: string;
          current_session_id: string | null;
        };
        Insert: {
          id?: string;
          game_id: string;
          host_user_id: string;
          status?: "waiting" | "playing" | "finished";
          created_at?: string;
          updated_at?: string;
          current_session_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["game_rooms"]["Insert"]>;
      };
      room_players: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          joined_at: string;
          is_host: boolean;
          presence_status: "online" | "away" | "offline";
          left_at: string | null;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          joined_at?: string;
          is_host?: boolean;
          presence_status?: "online" | "away" | "offline";
          left_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["room_players"]["Insert"]>;
      };
      game_sessions: {
        Row: {
          id: string;
          room_id: string;
          game_id: string;
          started_at: string;
          ended_at: string | null;
          status: "created" | "in_progress" | "completed" | "abandoned";
          result_payload: Json | null;
        };
        Insert: {
          id?: string;
          room_id: string;
          game_id: string;
          started_at?: string;
          ended_at?: string | null;
          status?: "created" | "in_progress" | "completed" | "abandoned";
          result_payload?: Json | null;
        };
        Update: Partial<Database["public"]["Tables"]["game_sessions"]["Insert"]>;
      };
      game_scores: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          score: number;
          rank: number | null;
          awarded_points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          score: number;
          rank?: number | null;
          awarded_points?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["game_scores"]["Insert"]>;
      };
      score_history: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          score_delta: number;
          created_at: string;
          reason: string;
          session_id: string | null;
          running_total: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          score_delta: number;
          created_at?: string;
          reason: string;
          session_id?: string | null;
          running_total: number;
        };
        Update: Partial<Database["public"]["Tables"]["score_history"]["Insert"]>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
