import { DailyPuzzle } from '@/integrations/supabase/types/model.types';
import { Link } from 'react-router-dom';
import { createSlug } from '@/utils/slugUtils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const countLetters = (word: string) => {
  return word.replace(/\s/g, '').length;
};

interface ClueContentProps {
  puzzle?: DailyPuzzle;
}

const ClueContent = ({ puzzle: propsPuzzle }: ClueContentProps) => {
  const { slug } = useParams();
  const { toast } = useToast();

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

      console.log('Fetching puzzles to match slug:', slug);
      
      const { data: puzzles, error: puzzlesError } = await supabase
        .from('daily_puzzles')
        .select(`
          *,
          jumble_words (*)
        `);
      
      if (puzzlesError) {
        console.error('Error fetching puzzles:', puzzlesError);
        throw puzzlesError;
      }

      if (!puzzles || puzzles.length === 0) {
        throw new Error('No puzzles found');
      }

      // Find the puzzle with matching caption-based slug
      const normalizedSlug = slug.toLowerCase().replace(/-+$/, ''); // Remove trailing dashes
      const matchingPuzzle = puzzles.find(p => {
        const puzzleSlug = createSlug(p.caption);
        console.log('Comparing slugs:', { puzzleSlug, normalizedSlug });
        return puzzleSlug === normalizedSlug;
      });

      if (!matchingPuzzle) {
        throw new Error('Puzzle not found');
      }

      return matchingPuzzle;
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
        <Link to={`/clue/${createSlug(puzzle.caption)}`} className="hover:text-blue-600">
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