import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JumblePuzzle from '../components/JumblePuzzle';
import { Button } from "@/components/ui/button";
import { DailyPuzzle } from '@/integrations/supabase/types';

const DailyPost = () => {
  const { date } = useParams();
  
  const { data: puzzle, isLoading, error } = useQuery<DailyPuzzle>({
    queryKey: ['daily_puzzle', date],
    queryFn: async () => {
      if (!date) throw new Error('No date provided');
      
      // Parse the date from URL format (YYYYMMDD) to database format (YYYY-MM-DD)
      const parsedDate = new Date(
        parseInt(date.substring(0, 4)),
        parseInt(date.substring(4, 6)) - 1,
        parseInt(date.substring(6, 8))
      );
      
      const formattedDate = parsedDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_puzzles')
        .select(`
          *,
          jumble_words (
            id,
            jumbled_word,
            answer
          )
        `)
        .eq('date', formattedDate)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Puzzle not found');
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
            <p className="text-gray-600 mb-8">Sorry, we couldn't find the puzzle for this date.</p>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
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

  const formattedDate = new Date(puzzle.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="text-[#0275d8] hover:text-[#025aa5]"
          >
            ← Go Back
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Daily Jumble {formattedDate} Answers
        </h1>

        <JumblePuzzle
          date={formattedDate}
          words={puzzle.jumble_words || []}
          caption={puzzle.caption}
          imageUrl={puzzle.image_url}
          solution={puzzle.solution}
          isExpanded={true}
        />
      </main>

      <Footer />
    </div>
  );
};

export default DailyPost;