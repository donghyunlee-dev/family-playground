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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "game_rooms_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "game_rooms_host_user_id_fkey";
            columns: ["host_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "game_rooms_current_session_id_fkey";
            columns: ["current_session_id"];
            isOneToOne: false;
            referencedRelation: "game_sessions";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "room_players_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "game_rooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "room_players_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "game_sessions_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "game_rooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "game_sessions_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "game_scores_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "game_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "game_scores_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "score_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "score_history_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "score_history_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "game_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      game_assets: {
        Row: {
          id: string;
          game_id: string;
          asset_type: string;
          url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          asset_type: string;
          url: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["game_assets"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "game_assets_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_game_room: {
        Args: {
          p_game_id: string;
          p_host_user_id: string;
        };
        Returns: string;
      };
      join_game_room: {
        Args: {
          p_room_id: string;
          p_user_id: string;
        };
        Returns: string;
      };
      start_game_room_session: {
        Args: {
          p_room_id: string;
          p_host_user_id: string;
        };
        Returns: string;
      };
      finish_game_room_session: {
        Args: {
          p_room_id: string;
          p_host_user_id: string;
        };
        Returns: string;
      };
      leave_game_room: {
        Args: {
          p_room_id: string;
          p_user_id: string;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
