import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import JumblePuzzle from '../components/JumblePuzzle';
import { supabase } from '../integrations/supabase/client';

const HomePage = () => {
  const [puzzleDec28, setPuzzleDec28] = useState<any>(null);
  const [puzzleDec27, setPuzzleDec27] = useState<any>(null);
  const [isExpanded27, setIsExpanded27] = useState(false);

  useEffect(() => {
    const fetchPuzzles = async () => {
      try {
        // Fetch Dec 28 puzzle
        const { data: dec28Data, error: dec28Error } = await supabase
          .from('daily_puzzles')
          .select(`
            *,
            jumble_words (
              id,
              jumbled_word,
              answer
            )
          `)
          .eq('date', '2024-12-28')
          .single();

        if (dec28Error) throw dec28Error;
        setPuzzleDec28(dec28Data);

        // Fetch Dec 27 puzzle
        const { data: dec27Data, error: dec27Error } = await supabase
          .from('daily_puzzles')
          .select(`
            *,
            jumble_words (
              id,
              jumbled_word,
              answer
            )
          `)
          .eq('date', '2024-12-27')
          .single();

        if (dec27Error) throw dec27Error;
        setPuzzleDec27(dec27Data);
      } catch (error) {
        console.error('Error fetching puzzles:', error);
      }
    };

    fetchPuzzles();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-jumble-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-jumble-text mb-6">Latest Daily Jumble Answers</h1>
            
            {puzzleDec28 && (
              <JumblePuzzle 
                date="December 28 2024"
                words={puzzleDec28.jumble_words}
                caption={puzzleDec28.caption}
                imageUrl={puzzleDec28.image_url}
                solution={puzzleDec28.solution}
                isExpanded={true}
              />
            )}
            
            {puzzleDec27 && (
              <JumblePuzzle 
                date="December 27 2024"
                words={puzzleDec27.jumble_words}
                caption={puzzleDec27.caption}
                imageUrl={puzzleDec27.image_url}
                solution={puzzleDec27.solution}
                isExpanded={isExpanded27}
                onToggle={() => setIsExpanded27(!isExpanded27)}
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