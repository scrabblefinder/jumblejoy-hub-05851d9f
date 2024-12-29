import { Database } from './database.types';

export type Tables = Database['public']['Tables'];

export type DailyPuzzle = Tables['daily_puzzles']['Row'] & {
  jumble_words: JumbleWord[];
};

export type JumbleWord = Tables['jumble_words']['Row'];

export type AdminUser = Tables['admin_users']['Row'];

export * from './database.types';