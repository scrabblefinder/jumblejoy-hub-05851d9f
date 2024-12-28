import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

interface DailyPuzzle {
  date: string;
  caption: string;
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
        const response = await fetch(`https://jznccczfjmatdxdrvszk.supabase.co/functions/v1/get-jumble?word=${word}`);
        const result = await response.json();
        
        if (response.ok) {
          setData(result);
          // Update page title
          document.title = `${result.jumbled_word} - JumbleAnswers.com`;
        } else {
          setError(result.error || 'Word not found');
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0275d8]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const formatPuzzleDate = (dateString: string) => {
    const puzzleDate = new Date(dateString);
    // Ensure the date is interpreted in the local timezone
    puzzleDate.setMinutes(puzzleDate.getMinutes() + puzzleDate.getTimezoneOffset());
    
    return puzzleDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>{`${data.jumbled_word} - JumbleAnswers.com`}</title>
      </Helmet>

      <div className="min-h-screen bg-white text-gray-800">
        <header className="bg-[#f8f9fa] border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-3xl font-bold text-[#0275d8] hover:opacity-80">
                JumbleAnswers.com
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="bg-[#0275d8] text-white p-4 text-xl">
                  Jumble Answer
                </div>
                <div className="p-8 space-y-6 border-x border-b">
                  <div className="text-center">
                    <div className="mb-8">
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
                    <div className="mt-8">
                      <h2 className="text-xl font-semibold text-gray-600 mb-2">Answer:</h2>
                      <p className="text-5xl font-bold text-green-600">{data.answer}</p>
                    </div>
                    {data.daily_puzzles && (
                      <div className="mt-8 text-left">
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">From Puzzle:</h3>
                        <p className="text-gray-600">{formatPuzzleDate(data.daily_puzzles.date)}</p>
                        <p className="text-[#0275d8] mt-2">{data.daily_puzzles.caption}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-center mt-8">
                    <Link
                      to="/"
                      className="inline-block bg-[#0275d8] text-white px-6 py-3 rounded hover:bg-[#025aa5] transition-colors"
                    >
                      Back to Daily Puzzle
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg overflow-hidden mb-8">
                <div className="bg-gray-100 p-4">
                  <h2 className="text-xl font-bold text-gray-800">About the Game</h2>
                </div>
                <div className="p-4">
                  <p className="text-gray-600">
                    Daily Jumble is one of the most popular word games which has maintained top rankings on both iOS and Android stores and the web. In case you haven't downloaded yet the game and would like to do so you can click the respective images below and you will be redirected to the download page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default JumbleAnswer;