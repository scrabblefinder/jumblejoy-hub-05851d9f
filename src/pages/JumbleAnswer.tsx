import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { Button } from "@/components/ui/button";
import { format, parseISO } from 'date-fns';

const JumbleAnswer = () => {
  const { word } = useParams();
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['jumble', word],
    queryFn: async () => {
      if (!word) throw new Error('No word provided');
      
      const { data, error } = await supabase.functions.invoke('get-jumble', {
        body: { word: word }
      });
      
      if (error) throw error;
      if (!data) throw new Error('Word not found');
      return data;
    },
  });

  const createSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleCaptionClick = () => {
    if (data?.daily_puzzles?.caption) {
      const slug = createSlug(data.daily_puzzles.caption);
      navigate(`/clue/${slug}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2f75d9]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="text-red-500">{(error as Error)?.message || 'An error occurred'}</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedWords = data.daily_puzzles?.jumble_words?.filter(
    (w) => w.jumbled_word !== data.jumbled_word
  ) || [];

  // Format the date properly
  const formattedDate = data.daily_puzzles?.date 
    ? format(parseISO(data.daily_puzzles.date), 'MMMM d, yyyy')
    : '';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="bg-[#2f75d9] text-white p-4">
                <h1 className="text-2xl font-bold text-center">Jumble Answer</h1>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="text-center">
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Jumbled Word:</h2>
                    <p className="text-4xl font-bold text-[#2f75d9]">{data.jumbled_word}</p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-sm text-gray-500">
                        UNSCRAMBLES TO
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Answer:</h2>
                    <p className="text-5xl font-bold text-green-500">{data.answer}</p>
                  </div>

                  {data.daily_puzzles && (
                    <>
                      <div className="mt-8 text-left">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">From Puzzle:</h3>
                        <p className="text-gray-600">
                          {formattedDate}
                        </p>
                        <button 
                          onClick={handleCaptionClick}
                          className="text-[#2f75d9] mt-2 hover:underline text-left"
                        >
                          {data.daily_puzzles.caption}
                        </button>
                      </div>

                      {relatedWords.length > 0 && (
                        <div className="mt-8 text-left">
                          <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Other Words from this Puzzle:
                          </h3>
                          <div className="grid gap-4">
                            {relatedWords.map((relatedWord) => (
                              <Link
                                key={relatedWord.jumbled_word}
                                to={`/jumble/${relatedWord.jumbled_word.toLowerCase()}`}
                                className="block bg-gray-50 p-4 rounded-lg 
                                         hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-xl font-bold text-[#2f75d9]">
                                    {relatedWord.jumbled_word}
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-8 ml-4">
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-[#2f75d9] 
                         text-white hover:bg-[#2f75d9]/80 transition-colors"
              >
                Back to Daily Puzzle
              </Link>
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

export default JumbleAnswer;