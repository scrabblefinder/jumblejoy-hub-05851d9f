import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

const CaptionAnswer = () => {
  const { caption } = useParams();
  
  const { data: puzzle, isLoading } = useQuery({
    queryKey: ['puzzle', caption],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_puzzles')
        .select('*')
        .eq('caption', decodeURIComponent(caption || ''))
        .single();
      
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

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-[#0275d8] text-white p-4">
            <h1 className="text-2xl font-bold text-center">Caption Solution</h1>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-600 mb-2">Caption:</h2>
              <p className="text-2xl font-bold text-[#0275d8]">{puzzle?.caption}</p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">SOLUTION</span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{puzzle?.solution}</p>
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
      </main>
    </div>
  );
};

export default CaptionAnswer;