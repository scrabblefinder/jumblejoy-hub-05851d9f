import { Database } from './database.types';

export type DailyPuzzle = Database['public']['Tables']['daily_puzzles']['Row'] & {
  jumble_words?: Database['public']['Tables']['jumble_words']['Row'][];
  finalJumble?: string;
  final_jumble?: string;
  final_jumble_answer?: string;
};

export type JumbleWord = Database['public']['Tables']['jumble_words']['Row'];
export type AdminUser = Database['public']['Tables']['admin_users']['Row'];