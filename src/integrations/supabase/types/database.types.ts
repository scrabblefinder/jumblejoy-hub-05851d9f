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
      admin_users: {
        Row: {
          created_at: string;
          id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          user_id?: string;
        };
      };
      daily_puzzles: {
        Row: {
          caption: string;
          created_at: string;
          date: string;
          id: string;
          image_url: string;
          solution: string;
        };
        Insert: {
          caption: string;
          created_at?: string;
          date: string;
          id?: string;
          image_url: string;
          solution: string;
        };
        Update: {
          caption?: string;
          created_at?: string;
          date?: string;
          id?: string;
          image_url?: string;
          solution?: string;
        };
      };
      jumble_words: {
        Row: {
          answer: string;
          created_at: string;
          id: string;
          jumbled_word: string;
          puzzle_id: string | null;
        };
        Insert: {
          answer: string;
          created_at?: string;
          id?: string;
          jumbled_word: string;
          puzzle_id?: string | null;
        };
        Update: {
          answer?: string;
          created_at?: string;
          id?: string;
          jumbled_word?: string;
          puzzle_id?: string | null;
        };
      };
    };
  };
}