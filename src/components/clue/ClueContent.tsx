import { DailyPuzzle } from '@/integrations/supabase/types/model.types';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';

const countLetters = (word: string) => {
  return word.replace(/\s/g, '').length;
};

interface ClueContentProps {
  puzzle?: DailyPuzzle;
}

const ClueContent = ({ puzzle: propsPuzzle }: ClueContentProps) => {
  const { slug } = useParams();

  const { data: puzzle, isLoading, error } = useQuery({
    queryKey: ['puzzle', slug],
    queryFn: async () => {
      if (!slug && !propsPuzzle) {
        throw new Error('No puzzle identifier provided');
      }

      // If puzzle is passed as prop, use it directly
      if (propsPuzzle) {
        return propsPuzzle;
      }

      try {
        console.log('Fetching puzzle for slug:', slug);
        
        const { data: puzzle, error: puzzleError } = await supabase
          .from('daily_puzzles')
          .select(`
            id,
            date,
            caption,
            image_url,
            solution,
            created_at,
            final_jumble,
            final_jumble_answer,
            slug,
            jumble_words (
              id,
              puzzle_id,
              jumbled_word,
              answer,
              created_at
            )
          `)
          .eq('slug', slug)
          .maybeSingle();
        
        if (puzzleError) {
          console.error('Error fetching puzzle:', puzzleError);
          throw puzzleError;
        }

        if (!puzzle) {
          console.error('No puzzle found for slug:', slug);
          throw new Error('Puzzle not found');
        }

        console.log('Found puzzle:', puzzle);
        return puzzle;
      } catch (err) {
        console.error('Error in puzzle query:', err);
        throw err;
      }
    },
    meta: {
      errorMessage: "Failed to fetch puzzle"
    }
  });

  if (isLoading) {
    return (
      <div className="w-3/4 animate-pulse">
        <div className="bg-gray-100 h-40 rounded-lg mb-6"></div>
        <div className="bg-gray-100 h-40 rounded-lg"></div>
      </div>
    );
  }

  if (error || !puzzle) {
    return (
      <div className="w-3/4">
        <div className="bg-red-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800">Error</h2>
          <p className="text-red-600">{error?.message || 'Failed to load puzzle'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-3/4">
      {/* Clue Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Clue:</h2>
          <span className="text-sm text-gray-500">
            Last seen: {new Date(puzzle.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
        <Link to={`/clue/${puzzle.slug}`} className="hover:text-blue-600">
          <p className="text-xl text-[#0275d8] font-bold mb-4">{puzzle.caption}</p>
        </Link>
      </div>

      {/* Solution Section */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-blue-800">Solution:</h2>
          <span className="text-sm text-blue-600 bg-white px-3 py-1 rounded-full">
            {countLetters(puzzle.solution)} letters
          </span>
        </div>
        <p className="text-2xl font-bold text-green-600">{puzzle.solution}</p>
      </div>
    </div>
  );
};

export default ClueContent;