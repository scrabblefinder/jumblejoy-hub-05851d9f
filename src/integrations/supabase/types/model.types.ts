import { Database } from './database.types';

export interface DailyPuzzle extends Database['public']['Tables']['daily_puzzles']['Row'] {
  jumble_words?: Database['public']['Tables']['jumble_words']['Row'][];
  finalJumble?: string;
  final_jumble?: string;
  final_jumble_answer?: string;
}

export interface JumbleWord extends Database['public']['Tables']['jumble_words']['Row'] {}