import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import ClueContent from '@/components/clue/ClueContent';
import RelatedClues from '@/components/clue/RelatedClues';
import { useToast } from "@/hooks/use-toast";

const createSlug = (text: string) => {
  if (!text) {
    console.error('Warning: Empty text provided to createSlug');
    return '';
  }
  
  // First, normalize the text by removing special characters and converting to lowercase
  const normalized = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
  
  return normalized;
};

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

      const { data, error } = await supabase
        .from('daily_puzzles')
        .select(`
          *,
          jumble_words (*)
        `);
      
      if (error) {
        console.error('Supabase error:', error);
        toast({
          title: "Error",
          description: "Failed to fetch puzzle data",
          variant: "destructive",
        });
        throw error;
      }

      if (!data || data.length === 0) {
        toast({
          title: "Error",
          description: "No puzzles found in database",
          variant: "destructive",
        });
        return null;
      }

      // Decode and clean the URL slug
      const decodedSlug = decodeURIComponent(slug).toLowerCase();
      
      // Find puzzle where either the URL contains the puzzle slug or vice versa
      const matchingPuzzle = data.find(puzzle => {
        if (!puzzle.caption) return false;
        
        const puzzleSlug = createSlug(puzzle.caption);
        // Check if either slug contains the other
        return puzzleSlug.includes(decodedSlug) || decodedSlug.includes(puzzleSlug);
      });

      if (!matchingPuzzle) {
        toast({
          title: "Puzzle Not Found",
          description: "We couldn't find the puzzle you're looking for",
          variant: "destructive",
        });
        return null;
      }

      return matchingPuzzle;
    },
  });

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