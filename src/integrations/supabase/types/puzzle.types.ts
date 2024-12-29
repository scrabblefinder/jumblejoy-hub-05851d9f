import { Database } from './database.types';

export type DailyPuzzle = Database['public']['Tables']['daily_puzzles']['Row'] & {
  jumble_words?: JumbleWord[];
};

export type JumbleWord = Database['public']['Tables']['jumble_words']['Row'];