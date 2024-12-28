import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Answer = () => {
  const { word } = useParams();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['jumbleWord', word],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jumble_words')
        .select('jumbled_word, answer')
        .eq('jumbled_word', word?.toUpperCase())
        .single();
        
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <Link to="/" className="text-3xl font-bold text-[#0275d8] hover:opacity-80">
              JumbleAnswers.com
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <Link to="/" className="text-3xl font-bold text-[#0275d8] hover:opacity-80">
              JumbleAnswers.com
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">Error loading answer</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="text-3xl font-bold text-[#0275d8] hover:opacity-80">
            JumbleAnswers.com
          </Link>
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
                    <p className="text-4xl font-bold text-[#0275d8]">{data?.jumbled_word}</p>
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
                    <p className="text-5xl font-bold text-green-600">{data?.answer}</p>
                  </div>
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
  );
};

export default Answer;