import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

const HomePage = () => {
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
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Latest Daily Jumble Answers</h1>
      {puzzles?.map((puzzle) => (
        <div key={puzzle.id} className="bg-white rounded-lg shadow-lg mb-8">
          <div className="bg-[#0275d8] text-white p-4">
            <h2 className="text-xl">
              Daily Jumble {new Date(puzzle.date).toLocaleDateString()}
            </h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                {puzzle.jumble_words?.map((word) => (
                  <Link
                    key={word.id}
                    to={`/jumble/${word.jumbled_word.toLowerCase()}`}
                    className="block bg-gray-50 p-4 rounded-lg mb-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-[#0275d8]">
                        {word.jumbled_word}
                      </span>
                      <span className="text-sm text-gray-500">
                        {word.jumbled_word.length} letters
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <div>
                <img
                  src={puzzle.image_url}
                  alt="Daily Jumble Puzzle"
                  className="w-full rounded-lg shadow-md"
                />
                <p className="mt-4 text-[#0275d8]">{puzzle.caption}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomePage;