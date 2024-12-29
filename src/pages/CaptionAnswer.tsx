import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import ClueContent from '@/components/clue/ClueContent';
import RelatedClues from '@/components/clue/RelatedClues';

const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
};

const CaptionAnswer = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const { data: puzzle, isLoading, error } = useQuery({
    queryKey: ['puzzle', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_puzzles')
        .select('*');
      
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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jumble-primary"></div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-jumble-text mb-4">Puzzle Not Found</h1>
            <p className="text-jumble-text/60 mb-8">Sorry, we couldn't find the puzzle you're looking for.</p>
            <Button
              onClick={() => navigate(-1)}
              className="bg-[#2f75d9] text-white hover:bg-[#2f75d9]/90 transition-colors"
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
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-[#2f75d9] text-white p-4">
            <h1 className="text-2xl font-bold text-center">Clue Solution</h1>
          </div>
          
          <div className="p-8">
            <div className="flex gap-8">
              <ClueContent puzzle={puzzle} />

              <div className="w-1/4">
                <div className="sticky top-4">
                  <img 
                    src={puzzle.image_url}
                    alt="Puzzle Clue"
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>

            <RelatedClues 
              relatedPuzzles={relatedPuzzles || []} 
              currentDate={new Date(puzzle.date)} 
            />
          </div>
        </div>

        <div className="mt-4">
          <Button
            onClick={() => navigate(-1)}
            className="bg-[#2f75d9] text-white hover:bg-[#2f75d9]/90 transition-colors"
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