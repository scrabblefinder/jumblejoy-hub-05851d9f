import { Database } from './database.types';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

export type DailyPuzzle = Tables<'daily_puzzles'> & {
  jumble_words: Tables<'jumble_words'>[];
};

export type JumbleWord = Tables<'jumble_words'>;