import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import ClueContent from '@/components/clue/ClueContent';
import RelatedClues from '@/components/clue/RelatedClues';
import { useToast } from "@/hooks/use-toast";
import { createSlug } from '@/utils/slugUtils';

const ClueAnswer = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: puzzle, isLoading, error } = useQuery({
    queryKey: ['puzzle', slug],
    queryFn: async () => {
      if (!slug) {
        toast({
          title: "Error",
          description: "No puzzle identifier provided",
          variant: "destructive",
        });
        return null;
      }

      try {
        // First fetch all puzzles to find the matching one by caption
        const { data: puzzles, error: puzzlesError } = await supabase
          .from('daily_puzzles')
          .select('*');
        
        if (puzzlesError) {
          console.error('Error fetching puzzles:', puzzlesError);
          throw puzzlesError;
        }

        if (!puzzles || puzzles.length === 0) {
          console.error('No puzzles found');
          throw new Error('No puzzles found');
        }

        // Find the puzzle with matching caption-based slug
        const matchingPuzzle = puzzles.find(p => {
          const puzzleSlug = createSlug(p.caption);
          return puzzleSlug === slug;
        });

        if (!matchingPuzzle) {
          console.error('No matching puzzle found for slug:', slug);
          throw new Error('Puzzle not found');
        }

        // Now fetch the complete puzzle data with jumble words using the UUID
        const { data: fullPuzzle, error: fullPuzzleError } = await supabase
          .from('daily_puzzles')
          .select(`
            *,
            jumble_words (*)
          `)
          .eq('id', matchingPuzzle.id)
          .maybeSingle();

        if (fullPuzzleError) {
          console.error('Error fetching full puzzle:', fullPuzzleError);
          throw fullPuzzleError;
        }

        if (!fullPuzzle) {
          console.error('No full puzzle data found for id:', matchingPuzzle.id);
          throw new Error('Puzzle details not found');
        }

        return fullPuzzle;
      } catch (err) {
        console.error('Error in puzzle query:', err);
        toast({
          title: "Error",
          description: err.message || "Failed to fetch puzzle",
          variant: "destructive",
        });
        return null;
      }
    },
  });

  // Fetch related puzzles separately
  const { data: relatedPuzzles } = useQuery({
    queryKey: ['related_puzzles', puzzle?.date],
    enabled: !!puzzle?.date,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_puzzles')
        .select('*')
        .eq('date', puzzle.date)
        .neq('id', puzzle.id)
        .limit(3);
      
      if (error) throw error;
      return data;
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
            <p className="text-gray-600 mb-4">
              Sorry, we couldn't find the puzzle you're looking for. The URL might be incomplete or incorrect.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="text-[#0275d8] hover:text-[#025aa5]"
            >
              ← Go to Homepage
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

            {relatedPuzzles && relatedPuzzles.length > 0 && (
              <RelatedClues clues={relatedPuzzles} />
            )}
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

export default ClueAnswer;