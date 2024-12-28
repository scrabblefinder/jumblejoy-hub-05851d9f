import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

const JumbleAnswer = () => {
  const { word } = useParams();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['jumble', word],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jumble_words')
        .select(`
          *,
          daily_puzzles (
            date,
            caption,
            image_url
          )
        `)
        .eq('jumbled_word', word?.toUpperCase())
        .maybeSingle();

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error loading jumble answer</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Word not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#f8f9fa] border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <a href="/" className="text-3xl font-bold text-[#0275d8] hover:opacity-80">
              JumbleAnswers.com
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-[#0275d8] text-white p-4">
            <h1 className="text-2xl font-bold text-center">Jumble Answer</h1>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-600 mb-2">Jumbled Word:</h2>
              <p className="text-4xl font-bold text-[#0275d8]">{data.jumbled_word}</p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">UNSCRAMBLES TO</span>
              </div>
            </div>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-600 mb-2">Answer:</h2>
              <p className="text-5xl font-bold text-green-600">{data.answer}</p>
            </div>

            {data.daily_puzzles && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-600 mb-2">From Puzzle:</h3>
                <p className="text-gray-600">
                  {new Date(data.daily_puzzles.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-[#0275d8] mt-2">{data.daily_puzzles.caption}</p>
              </div>
            )}

            <div className="text-center mt-8">
              <a 
                href="/" 
                className="inline-block bg-[#0275d8] text-white px-6 py-3 rounded hover:bg-[#025aa5] transition-colors"
              >
                Back to Daily Puzzle
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JumbleAnswer;