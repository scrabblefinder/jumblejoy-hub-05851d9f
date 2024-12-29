import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

interface DailyPuzzle {
  date: string;
  caption: string;
  jumble_words: {
    id: string;
    jumbled_word: string;
    answer: string;
  }[];
}

interface JumbleData {
  jumbled_word: string;
  answer: string;
  daily_puzzles?: DailyPuzzle;
}

const JumbleAnswer = () => {
  const { word } = useParams();
  const [data, setData] = useState<JumbleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnswer = async () => {
      if (!word) {
        setError('No word provided');
        setLoading(false);
        return;
      }

      try {
        const { data: result, error: functionError } = await supabase.functions.invoke('get-jumble', {
          body: { word: word }
        });
        
        if (functionError) {
          throw functionError;
        }

        if (result) {
          setData(result);
          document.title = `${result.jumbled_word} - JumbleAnswers.com`;
        } else {
          setError('Word not found');
        }
      } catch (err) {
        console.error('Error fetching answer:', err);
        setError('Error fetching answer');
      } finally {
        setLoading(false);
      }
    };

    fetchAnswer();
  }, [word]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-jumble-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jumble-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-jumble-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 text-center">
            <div className="text-red-500">{error}</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedWords = data.daily_puzzles?.jumble_words?.filter(
    (w) => w.jumbled_word !== data.jumbled_word
  ) || [];

  return (
    <>
      <Helmet>
        <title>{`${data.jumbled_word} - JumbleAnswers.com`}</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-jumble-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden">
                <div className="bg-jumble-primary text-jumble-text p-4">
                  <h1 className="text-2xl font-bold text-center">Jumble Answer</h1>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="text-center">
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-jumble-text/80 mb-2">Jumbled Word:</h2>
                      <p className="text-4xl font-bold text-jumble-primary">{data.jumbled_word}</p>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-jumble-text/10"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-jumble-background px-4 text-sm text-jumble-text/60">
                          UNSCRAMBLES TO
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h2 className="text-xl font-semibold text-jumble-text/80 mb-2">Answer:</h2>
                      <p className="text-5xl font-bold text-green-500">{data.answer}</p>
                    </div>

                    {data.daily_puzzles && (
                      <>
                        <div className="mt-8 text-left">
                          <h3 className="text-xl font-semibold text-jumble-text/80 mb-2">From Puzzle:</h3>
                          <p className="text-jumble-text/60">
                            {new Date(data.daily_puzzles.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-jumble-primary mt-2">{data.daily_puzzles.caption}</p>
                        </div>

                        {relatedWords.length > 0 && (
                          <div className="mt-8 text-left">
                            <h3 className="text-xl font-semibold text-jumble-text/80 mb-4">
                              Other Words from this Puzzle:
                            </h3>
                            <div className="grid gap-4">
                              {relatedWords.map((relatedWord) => (
                                <Link
                                  key={relatedWord.jumbled_word}
                                  to={`/jumble/${relatedWord.jumbled_word.toLowerCase()}`}
                                  className="block bg-white/5 backdrop-blur-sm p-4 rounded-lg 
                                           hover:bg-white/10 transition-colors"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-jumble-primary">
                                      {relatedWord.jumbled_word}
                                    </span>
                                    <span className="text-green-500 font-semibold">
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
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Link
                  to="/"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-jumble-primary 
                           text-jumble-text hover:bg-jumble-primary/80 transition-colors"
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
    </>
  );
};

export default JumbleAnswer;