import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import JumblePuzzle from '../components/JumblePuzzle';
import { supabase } from '../integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";

const HomePage: React.FC = () => {
  const [latestPuzzle, setLatestPuzzle] = useState<any>(null);
  const [previousPuzzle, setPreviousPuzzle] = useState<any>(null);
  const [isExpandedPrevious, setIsExpandedPrevious] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPuzzles = async () => {
      try {
        console.log('Fetching puzzles...');
        const { data: puzzles, error: puzzlesError } = await supabase
          .from('daily_puzzles')
          .select(`
            *,
            jumble_words (
              id,
              jumbled_word,
              answer
            )
          `)
          .order('date', { ascending: false })
          .limit(2);

        if (puzzlesError) {
          console.error('Error fetching puzzles:', puzzlesError);
          toast({
            title: "Error",
            description: "Failed to load puzzles. Please try again later.",
            variant: "destructive",
          });
          return;
        }
        
        console.log('Fetched puzzles:', puzzles);
        
        if (puzzles && puzzles.length > 0) {
          setLatestPuzzle(puzzles[0]);
          if (puzzles.length > 1) {
            setPreviousPuzzle(puzzles[1]);
          }
        }
      } catch (error) {
        console.error('Error fetching puzzles:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchPuzzles();
  }, []);

  const formatPuzzleDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMMM dd yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Latest Daily Jumble Answers</h1>
            
            {latestPuzzle && (
              <JumblePuzzle 
                date={formatPuzzleDate(latestPuzzle.date)}
                words={latestPuzzle.jumble_words}
                caption={latestPuzzle.caption}
                imageUrl={latestPuzzle.image_url}
                solution={latestPuzzle.solution}
                isExpanded={true}
              />
            )}
            
            {previousPuzzle && (
              <JumblePuzzle 
                date={formatPuzzleDate(previousPuzzle.date)}
                words={previousPuzzle.jumble_words}
                caption={previousPuzzle.caption}
                imageUrl={previousPuzzle.image_url}
                solution={previousPuzzle.solution}
                isExpanded={isExpandedPrevious}
                onToggle={() => setIsExpandedPrevious(!isExpandedPrevious)}
              />
            )}
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

export default HomePage;