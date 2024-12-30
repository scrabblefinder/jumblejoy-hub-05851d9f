import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import JumblePuzzle from '../components/JumblePuzzle';
import { Button } from "@/components/ui/button";
import { DailyPuzzle } from '@/integrations/supabase/types/base.types';
import { format, parseISO } from 'date-fns';
import MetaTags from '../components/MetaTags';

const DailyPost = () => {
  const { date } = useParams();
  
  const { data: puzzle, isLoading, error } = useQuery<DailyPuzzle>({
    queryKey: ['daily_puzzle', date],
    queryFn: async () => {
      if (!date) throw new Error('No date provided');
      
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
            answer,
            created_at,
            puzzle_id
          )
        `)
        .eq('date', formattedDate)
        .maybeSingle();  // Changed from .single() to .maybeSingle()

      if (error) throw error;
      if (!data) throw new Error('Puzzle not found');
      return data as DailyPuzzle;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2f75d9]"></div>
      </div>
    );
  }

  if (error || !puzzle) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Puzzle Not Found</h1>
            <p className="text-gray-600 mb-8">Sorry, we couldn't find the puzzle for this date.</p>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
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

  const formatPuzzleDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'MMMM d, yyyy');
  };

  const formatUrlDate = (dateString: string) => {
    const date = parseISO(dateString);
    const month = format(date, 'MMMM').toLowerCase();
    const day = format(date, 'd');
    const year = format(date, 'yyyy');
    return `/daily-jumble-${month}-${day}-${year}-answers`;
  };

  const formattedDate = formatPuzzleDate(puzzle.date);
  const dateUrl = formatUrlDate(puzzle.date);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MetaTags 
        title={`Daily Jumble ${formattedDate} Answers`}
        description={`Please find all the Daily Jumble ${formattedDate} Answers and Solutions in our website.`}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <JumblePuzzle
              date={formattedDate}
              dateUrl={dateUrl}
              words={puzzle.jumble_words || []}
              caption={puzzle.caption}
              imageUrl={puzzle.image_url}
              solution={puzzle.solution}
              finalJumble={puzzle.final_jumble}
              isExpanded={true}
            />

            <div className="mt-8 mb-4">
              <Button
                onClick={() => window.history.back()}
                className="bg-[#2f75d9] text-white hover:bg-[#2f75d9]/90 transition-colors"
              >
                ← Go Back
              </Button>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <Sidebar />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DailyPost;