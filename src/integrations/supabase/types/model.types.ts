import { Database } from './database.types';

export type DailyPuzzle = Database['public']['Tables']['daily_puzzles']['Row'];
export type JumbleWord = Database['public']['Tables']['jumble_words']['Row'];
export type AdminUser = Database['public']['Tables']['admin_users']['Row'];