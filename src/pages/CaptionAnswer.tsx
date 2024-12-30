import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { DailyPuzzle } from '@/integrations/supabase/types';

const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
    .trim();
};

const CaptionAnswer = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const { data: puzzle, isLoading, error } = useQuery<DailyPuzzle>({
    queryKey: ['puzzle', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_puzzles')
        .select(`
          *,
          jumble_words (*)
        `);
      
      if (error) throw error;

      const cleanSlug = createSlug(slug || '');
      const matchingPuzzle = data?.find(puzzle => {
        const puzzleSlug = createSlug(puzzle.caption);
        return puzzleSlug === cleanSlug;
      });

      return matchingPuzzle || null;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0275d8]"></div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Puzzle Not Found</h1>
            <p className="text-gray-600">Sorry, we couldn't find the puzzle you're looking for.</p>
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="text-[#0275d8] hover:text-[#025aa5]"
            >
              ← Go Back
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-[#0275d8] text-white p-4">
            <h1 className="text-2xl font-bold text-center">Clue Solution</h1>
          </div>
          
          <div className="p-8">
            <div className="flex gap-8">
              <div className="w-3/4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Caption:</h2>
                <p className="text-lg text-gray-600">{puzzle.caption}</p>
                <h2 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Solution:</h2>
                <p className="text-lg text-green-500">{puzzle.solution}</p>
                <h2 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Jumble Words:</h2>
                <ul>
                  {puzzle.jumble_words.map(word => (
                    <li key={word.id} className="text-lg text-gray-600">
                      {word.jumbled_word} - {word.answer}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="text-[#0275d8] hover:text-[#025aa5]"
          >
            ← Go Back
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CaptionAnswer;
