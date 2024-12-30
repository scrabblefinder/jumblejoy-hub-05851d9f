import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { DailyPuzzle } from '@/integrations/supabase/types/base.types';

const CaptionAnswer = () => {
  const { caption } = useParams();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['caption', caption],
    queryFn: async () => {
      if (!caption) throw new Error('No caption provided');
      
      const { data, error } = await supabase.functions.invoke('get-caption', {
        body: { caption: caption }
      });
      
      if (error) throw error;
      if (!data) throw new Error('Caption not found');
      return data;
    },
  });

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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center">Caption Answer</h1>
          <p className="text-xl text-center mt-4">{data.answer}</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-[#2f75d9] text-white hover:bg-[#2f75d9]/80 transition-colors mt-6"
          >
            Back to Daily Puzzle
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CaptionAnswer;

