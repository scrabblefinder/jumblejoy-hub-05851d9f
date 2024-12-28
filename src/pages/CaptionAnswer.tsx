import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

const CaptionAnswer = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const { data: puzzle, isLoading, error } = useQuery({
    queryKey: ['puzzle', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_puzzles')
        .select('*');
      
      if (error) throw error;

      // Find the puzzle where the slugified caption matches the URL slug
      const matchingPuzzle = data?.find(puzzle => createSlug(puzzle.caption) === slug);
      return matchingPuzzle || null;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0275d8]"></div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="text-[#0275d8] hover:text-[#025aa5]"
            >
              ← Go Back
            </Button>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Puzzle Not Found</h1>
            <p className="text-gray-600">Sorry, we couldn't find the puzzle you're looking for.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="text-[#0275d8] hover:text-[#025aa5]"
          >
            ← Go Back
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-[#0275d8] text-white p-4">
            <h1 className="text-2xl font-bold text-center">Caption Solution</h1>
          </div>
          
          <div className="p-8">
            <div className="flex gap-8">
              <div className="w-3/4">
                {/* Caption Section */}
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Caption:</h2>
                    <span className="text-sm text-gray-500">
                      Last seen: {new Date(puzzle?.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-xl text-[#0275d8] font-bold mb-4">{puzzle?.caption}</p>
                </div>

                {/* Solution Section */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-blue-800">Solution:</h2>
                    <span className="text-sm text-blue-600 bg-white px-3 py-1 rounded-full">
                      {puzzle?.solution?.length || 0} letters
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{puzzle?.solution}</p>
                </div>
              </div>

              {/* Image Section */}
              <div className="w-1/4">
                <div className="sticky top-4">
                  <img 
                    src={puzzle?.image_url}
                    alt="Puzzle Caption"
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CaptionAnswer;