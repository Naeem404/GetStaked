export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          pool_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          pool_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          pool_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_messages: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          persona: Database["public"]["Enums"]["coach_persona"]
          trigger_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          persona: Database["public"]["Enums"]["coach_persona"]
          trigger_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          persona?: Database["public"]["Enums"]["coach_persona"]
          trigger_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_habits: {
        Row: {
          created_at: string | null
          habit_date: string
          id: string
          pools_completed: number | null
          proofs_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          habit_date: string
          id?: string
          pools_completed?: number | null
          proofs_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          habit_date?: string
          id?: string
          pools_completed?: number | null
          proofs_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_members: {
        Row: {
          best_streak: number | null
          completed_at: string | null
          current_streak: number | null
          days_completed: number | null
          days_missed: number | null
          failed_at: string | null
          id: string
          joined_at: string | null
          last_proof_date: string | null
          pool_id: string
          stake_tx_signature: string | null
          status: Database["public"]["Enums"]["member_status"] | null
          user_id: string
          winnings: number | null
        }
        Insert: {
          best_streak?: number | null
          completed_at?: string | null
          current_streak?: number | null
          days_completed?: number | null
          days_missed?: number | null
          failed_at?: string | null
          id?: string
          joined_at?: string | null
          last_proof_date?: string | null
          pool_id: string
          stake_tx_signature?: string | null
          status?: Database["public"]["Enums"]["member_status"] | null
          user_id: string
          winnings?: number | null
        }
        Update: {
          best_streak?: number | null
          completed_at?: string | null
          current_streak?: number | null
          days_completed?: number | null
          days_missed?: number | null
          failed_at?: string | null
          id?: string
          joined_at?: string | null
          last_proof_date?: string | null
          pool_id?: string
          stake_tx_signature?: string | null
          status?: Database["public"]["Enums"]["member_status"] | null
          user_id?: string
          winnings?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_members_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pools: {
        Row: {
          category: Database["public"]["Enums"]["pool_category"] | null
          created_at: string | null
          creator_id: string
          current_players: number | null
          description: string | null
          duration_days: number
          emoji: string | null
          ends_at: string | null
          escalating_stakes: boolean | null
          escrow_address: string | null
          frequency: Database["public"]["Enums"]["pool_frequency"] | null
          id: string
          invite_code: string | null
          is_hot: boolean | null
          is_private: boolean | null
          max_players: number
          name: string
          pot_size: number | null
          proof_description: string
          settled_at: string | null
          stake_amount: number
          starts_at: string | null
          status: Database["public"]["Enums"]["pool_status"] | null
          updated_at: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["pool_category"] | null
          created_at?: string | null
          creator_id: string
          current_players?: number | null
          description?: string | null
          duration_days: number
          emoji?: string | null
          ends_at?: string | null
          escalating_stakes?: boolean | null
          escrow_address?: string | null
          frequency?: Database["public"]["Enums"]["pool_frequency"] | null
          id?: string
          invite_code?: string | null
          is_hot?: boolean | null
          is_private?: boolean | null
          max_players?: number
          name: string
          pot_size?: number | null
          proof_description: string
          settled_at?: string | null
          stake_amount: number
          starts_at?: string | null
          status?: Database["public"]["Enums"]["pool_status"] | null
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["pool_category"] | null
          created_at?: string | null
          creator_id?: string
          current_players?: number | null
          description?: string | null
          duration_days?: number
          emoji?: string | null
          ends_at?: string | null
          escalating_stakes?: boolean | null
          escrow_address?: string | null
          frequency?: Database["public"]["Enums"]["pool_frequency"] | null
          id?: string
          invite_code?: string | null
          is_hot?: boolean | null
          is_private?: boolean | null
          max_players?: number
          name?: string
          pot_size?: number | null
          proof_description?: string
          settled_at?: string | null
          stake_amount?: number
          starts_at?: string | null
          status?: Database["public"]["Enums"]["pool_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pools_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          best_streak: number | null
          coach_persona: Database["public"]["Enums"]["coach_persona"] | null
          coach_voice_enabled: boolean | null
          created_at: string | null
          current_streak: number | null
          display_name: string | null
          id: string
          sol_balance: number | null
          total_pools_joined: number | null
          total_pools_won: number | null
          total_proofs_submitted: number | null
          total_proofs_verified: number | null
          total_sol_earned: number | null
          total_sol_staked: number | null
          updated_at: string | null
          username: string | null
          wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          best_streak?: number | null
          coach_persona?: Database["public"]["Enums"]["coach_persona"] | null
          coach_voice_enabled?: boolean | null
          created_at?: string | null
          current_streak?: number | null
          display_name?: string | null
          id: string
          sol_balance?: number | null
          total_pools_joined?: number | null
          total_pools_won?: number | null
          total_proofs_submitted?: number | null
          total_proofs_verified?: number | null
          total_sol_earned?: number | null
          total_sol_staked?: number | null
          updated_at?: string | null
          username?: string | null
          wallet_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          best_streak?: number | null
          coach_persona?: Database["public"]["Enums"]["coach_persona"] | null
          coach_voice_enabled?: boolean | null
          created_at?: string | null
          current_streak?: number | null
          display_name?: string | null
          id?: string
          sol_balance?: number | null
          total_pools_joined?: number | null
          total_pools_won?: number | null
          total_proofs_submitted?: number | null
          total_proofs_verified?: number | null
          total_sol_earned?: number | null
          total_sol_staked?: number | null
          updated_at?: string | null
          username?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      proofs: {
        Row: {
          ai_confidence: number | null
          ai_flags: Json | null
          ai_reasoning: string | null
          created_at: string | null
          id: string
          image_url: string
          member_id: string
          pool_id: string
          proof_date: string | null
          status: Database["public"]["Enums"]["proof_status"] | null
          submitted_at: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          ai_confidence?: number | null
          ai_flags?: Json | null
          ai_reasoning?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          member_id: string
          pool_id: string
          proof_date?: string | null
          status?: Database["public"]["Enums"]["proof_status"] | null
          submitted_at?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          ai_confidence?: number | null
          ai_flags?: Json | null
          ai_reasoning?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          member_id?: string
          pool_id?: string
          proof_date?: string | null
          status?: Database["public"]["Enums"]["proof_status"] | null
          submitted_at?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proofs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "pool_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proofs_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proofs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          pool_id: string | null
          status: string | null
          tx_signature: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          pool_id?: string | null
          status?: string | null
          tx_signature?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          pool_id?: string | null
          status?: string | null
          tx_signature?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_global_streak: {
        Args: { p_user_id: string }
        Returns: {
          best_streak: number
          current_streak: number
        }[]
      }
      check_missed_proofs: { Args: Record<string, never>; Returns: undefined }
      process_proof_verification: {
        Args: {
          p_confidence: number
          p_flags?: Json
          p_proof_id: string
          p_reasoning: string
          p_status: Database["public"]["Enums"]["proof_status"]
        }
        Returns: undefined
      }
      settle_pool: { Args: { p_pool_id: string }; Returns: undefined }
    }
    Enums: {
      coach_persona: "drill_sergeant" | "hype_beast" | "gentle_guide"
      member_status: "active" | "failed" | "completed" | "withdrawn"
      pool_category:
        | "fitness"
        | "health"
        | "education"
        | "wellness"
        | "productivity"
        | "creative"
        | "other"
      pool_frequency: "daily" | "5x_week" | "3x_week"
      pool_status: "waiting" | "active" | "settling" | "completed" | "cancelled"
      proof_status: "pending" | "approved" | "rejected" | "flagged"
      transaction_type:
        | "stake_deposit"
        | "stake_refund"
        | "winnings_claim"
        | "penalty"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never
