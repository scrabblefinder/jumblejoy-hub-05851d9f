import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import JumblePuzzle from '../components/JumblePuzzle';
import { supabase } from '../integrations/supabase/client';
import { format } from 'date-fns';

const HomePage: React.FC = () => {
  const [latestPuzzle, setLatestPuzzle] = useState<any>(null);
  const [previousPuzzle, setPreviousPuzzle] = useState<any>(null);
  const [isExpandedPrevious, setIsExpandedPrevious] = useState(false);

  useEffect(() => {
    const fetchPuzzles = async () => {
      try {
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
          .in('date', ['2024-12-27', '2024-12-28'])
          .order('date', { ascending: false });

        if (puzzlesError) throw puzzlesError;
        
        if (puzzles && puzzles.length >= 2) {
          const dec28Puzzle = puzzles.find(p => p.date === '2024-12-28');
          const dec27Puzzle = puzzles.find(p => p.date === '2024-12-27');
          
          if (dec28Puzzle && dec27Puzzle) {
            setLatestPuzzle(dec28Puzzle);
            setPreviousPuzzle(dec27Puzzle);
          }
        }
      } catch (error) {
        console.error('Error fetching puzzles:', error);
      }
    };

    fetchPuzzles();
  }, []);

  const formatPuzzleDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM dd yyyy');
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