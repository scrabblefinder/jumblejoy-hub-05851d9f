import { Database } from './database.types';
export type Tables = Database['public']['Tables'];
export type AdminUser = Tables['admin_users']['Row'];

// Export types from base.types.ts
export { JumbleWord, DailyPuzzle } from './base.types';

// Re-export database types
export * from './database.types';