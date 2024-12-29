export interface DailyPuzzle {
  id: string;
  date: string;
  caption: string;
  image_url: string;
  solution: string;
  created_at: string;
  final_jumble?: string;
  final_jumble_answer?: string;
  jumble_words: {
    id: string;
    jumbled_word: string;
    answer: string;
    created_at: string;
    puzzle_id: string;
  }[];
}
