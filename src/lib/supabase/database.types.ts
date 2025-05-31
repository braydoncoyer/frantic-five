// lib/supabase/database.types.ts
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
      words: {
        Row: {
          id: number;
          word: string;
          used: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          word: string;
          used?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          word?: string;
          used?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      daily_words: {
        Row: {
          id: number;
          date: string;
          word_id: number;
          initial_top_word_id: number;
          initial_bottom_word_id: number;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          date: string;
          word_id: number;
          initial_top_word_id: number;
          initial_bottom_word_id: number;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          date?: string;
          word_id?: number;
          initial_top_word_id?: number;
          initial_bottom_word_id?: number;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "daily_words_word_id_fkey";
            columns: ["word_id"];
            referencedRelation: "words";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "daily_words_initial_top_word_id_fkey";
            columns: ["initial_top_word_id"];
            referencedRelation: "words";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "daily_words_initial_bottom_word_id_fkey";
            columns: ["initial_bottom_word_id"];
            referencedRelation: "words";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      insert_initial_words: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      set_daily_word: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      add_new_words: {
        Args: {
          new_words: string[];
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
