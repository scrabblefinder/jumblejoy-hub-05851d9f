import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/utils/dateUtils";

const DailyPuzzle = () => {
  const { data: puzzle, isLoading, error } = useQuery({
    queryKey: ['dailyPuzzle'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_puzzles')
        .select(`
          *,
          jumble_words (
            jumbled_word,
            answer
          )
        `)
        .eq('date', today)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Failed to load puzzle. Please try again later.
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="text-gray-500">
        No puzzle available for today.
      </div>
    );
  }

  const handleWordClick = (word: string) => {
    window.location.href = `/jumble/${word.toLowerCase()}`;
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden mb-8">
      <div className="bg-[#0275d8] text-white p-4 text-xl">
        <h2>Daily Jumble {formatDate(puzzle.date)}</h2>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex gap-8">
          <div className="w-3/4 space-y-4">
            {puzzle.jumble_words.map((word) => (
              <div key={word.jumbled_word} className="jumble-word">
                <button
                  onClick={() => handleWordClick(word.jumbled_word)}
                  className="text-[#0275d8] hover:underline text-left"
                >
                  {word.jumbled_word}
                </button>
              </div>
            ))}
          </div>
          <div className="w-1/4">
            <img
              src={puzzle.image_url}
              alt="Daily Jumble Puzzle"
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
        <div className="border-t pt-4">
          <p className="text-[#0275d8] text-lg">{puzzle.caption}</p>
        </div>
      </div>
    </div>
  );
};

export default DailyPuzzle;