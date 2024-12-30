import { Tables } from './database.types';

export type DailyPuzzle = Tables<'daily_puzzles'> & {
  jumble_words: Tables<'jumble_words'>[];
};

export type JumbleWord = Tables<'jumble_words'>;