import { Database } from './database.types'

export type Tables = Database['public']['Tables']

export type DailyPuzzle = Tables['daily_puzzles']['Row']
export type JumbleWord = Tables['jumble_words']['Row']

export type { Database }