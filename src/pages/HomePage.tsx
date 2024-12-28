import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import JumblePuzzle from '../components/JumblePuzzle';
import { supabase } from '../integrations/supabase/client';

const HomePage = () => {
  const [puzzleDec28, setPuzzleDec28] = useState<any>(null);
  const [puzzleDec26, setPuzzleDec26] = useState<any>(null);
  const [isExpanded26, setIsExpanded26] = useState(false);

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
          .maybeSingle();

        if (dec28Error) throw dec28Error;
        setPuzzleDec28(dec28Data);

        // Fetch Dec 26 puzzle
        const { data: dec26Data, error: dec26Error } = await supabase
          .from('daily_puzzles')
          .select(`
            *,
            jumble_words (
              id,
              jumbled_word,
              answer
            )
          `)
          .eq('date', '2024-12-26')
          .maybeSingle();

        if (dec26Error) throw dec26Error;
        setPuzzleDec26(dec26Data);
      } catch (error) {
        console.error('Error fetching puzzles:', error);
      }
    };

    fetchPuzzles();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Latest Daily Jumble Answers</h1>
            
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
            
            {puzzleDec26 && (
              <JumblePuzzle 
                date="December 26 2024"
                words={puzzleDec26.jumble_words}
                caption={puzzleDec26.caption}
                imageUrl={puzzleDec26.image_url}
                solution={puzzleDec26.solution}
                isExpanded={isExpanded26}
                onToggle={() => setIsExpanded26(!isExpanded26)}
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