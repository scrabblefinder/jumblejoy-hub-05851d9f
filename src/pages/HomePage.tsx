import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JumblePuzzle from '../components/JumblePuzzle';
import Sidebar from '../components/Sidebar';

const HomePage = () => {
  const [expandedPuzzle, setExpandedPuzzle] = useState<string | null>('dec28');

  const { data: puzzles, isLoading } = useQuery({
    queryKey: ['daily-puzzles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_puzzles')
        .select(`
          *,
          jumble_words (*)
        `)
        .order('date', { ascending: false })
        .limit(2);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Latest Daily Jumble Answers</h1>
            
            {puzzles?.map((puzzle) => (
              <JumblePuzzle
                key={puzzle.id}
                date={new Date(puzzle.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
                words={puzzle.jumble_words}
                caption={puzzle.caption}
                imageUrl={puzzle.image_url}
                solution={puzzle.solution}
                isExpanded={expandedPuzzle === puzzle.id}
                onToggle={() => setExpandedPuzzle(expandedPuzzle === puzzle.id ? null : puzzle.id)}
              />
            ))}
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