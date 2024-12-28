import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { Button } from "@/components/ui/button";

const JumbleWord = () => {
  const { word } = useParams();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['jumble', word],
    queryFn: async () => {
      if (!word) throw new Error('No word provided');
      
      const { data, error } = await supabase
        .from('jumble_words')
        .select(`
          *,
          daily_puzzles (
            date,
            caption,
            image_url,
            jumble_words (
              id,
              jumbled_word,
              answer
            )
          )
        `)
        .eq('jumbled_word', word.toUpperCase())
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Word not found');
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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-500">Error: {(error as Error).message}</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedWords = data.daily_puzzles?.jumble_words?.filter(
    (w: { jumbled_word: string }) => w.jumbled_word !== word?.toUpperCase()
  ) || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-[#0275d8] text-white p-4">
                <h1 className="text-2xl font-bold text-center">Jumble Answer</h1>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-600 mb-2">Jumbled Word:</h2>
                  <p className="text-4xl font-bold text-[#0275d8]">{word?.toUpperCase()}</p>
                  <p className="mt-2 text-gray-500">({word?.length} letters)</p>
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
                  <p className="mt-2 text-gray-500">({data.answer.length} letters)</p>
                </div>

                {data.daily_puzzles && (
                  <>
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

                    {relatedWords.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-600 mb-4">Other Words from this Puzzle:</h3>
                        <div className="grid gap-4">
                          {relatedWords.map((relatedWord: { jumbled_word: string; answer: string }) => (
                            <Link
                              key={relatedWord.jumbled_word}
                              to={`/jumble/${relatedWord.jumbled_word.toLowerCase()}`}
                              className="block bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-[#0275d8]">
                                  {relatedWord.jumbled_word}
                                </span>
                                <span className="text-green-600 font-semibold">
                                  {relatedWord.answer}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="text-[#0275d8] hover:text-[#025aa5]"
                  >
                    ← Go Back
                  </Button>
                </div>
              </div>
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

export default JumbleWord;