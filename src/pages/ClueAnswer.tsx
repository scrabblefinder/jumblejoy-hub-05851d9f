import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import ClueContent from '@/components/clue/ClueContent';
import RelatedClues from '@/components/clue/RelatedClues';
import { useToast } from "@/components/ui/use-toast";

const createSlug = (text: string) => {
  if (!text) {
    console.log('Warning: Empty text provided to createSlug');
    return '';
  }
  
  // First, normalize the text by removing special characters and converting to lowercase
  const normalized = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
  
  console.log('Created slug:', normalized, 'from text:', text);
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
        console.error('No slug provided');
        throw new Error('No caption provided');
      }
      
      console.log('Fetching puzzle for slug:', slug);
      
      const { data, error } = await supabase
        .from('daily_puzzles')
        .select(`
          *,
          jumble_words (*)
        `);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No puzzles found');
        throw new Error('No puzzles found');
      }

      // Log all puzzles and their slugs for debugging
      console.log('Found', data.length, 'puzzles');
      const decodedSlug = decodeURIComponent(slug);
      console.log('Decoded URL slug:', decodedSlug);
      
      // Find the puzzle with matching caption
      const matchingPuzzle = data.find(puzzle => {
        const puzzleSlug = createSlug(puzzle.caption);
        console.log('Comparing slugs:', {
          puzzleSlug,
          decodedSlug,
          caption: puzzle.caption,
          matches: puzzleSlug.includes(decodedSlug) || decodedSlug.includes(puzzleSlug)
        });
        // Use includes instead of exact match to handle truncated slugs
        return puzzleSlug.includes(decodedSlug) || decodedSlug.includes(puzzleSlug);
      });

      if (!matchingPuzzle) {
        console.error('No matching puzzle found for slug:', decodedSlug);
        toast({
          title: "Puzzle Not Found",
          description: "We couldn't find the puzzle you're looking for.",
          variant: "destructive",
        });
        return null;
      }

      console.log('Found matching puzzle:', matchingPuzzle);
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

  if (error || !puzzle) {
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