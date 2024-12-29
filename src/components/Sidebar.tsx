import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import CalendarSection from './sidebar/CalendarSection';

const Sidebar = () => {
  const [latestWords, setLatestWords] = useState<any[]>([]);
  const [finalJumble, setFinalJumble] = useState<string | null>(null);
  const [latestDate, setLatestDate] = useState<string>('');

  useEffect(() => {
    const fetchLatestWords = async () => {
      try {
        const { data: latestPuzzle } = await supabase
          .from('daily_puzzles')
          .select('id, date, final_jumble')
          .order('date', { ascending: false })
          .limit(1)
          .single();

        if (latestPuzzle) {
          setLatestDate(latestPuzzle.date);
          setFinalJumble(latestPuzzle.final_jumble);
          
          const { data: words } = await supabase
            .from('jumble_words')
            .select('jumbled_word')
            .eq('puzzle_id', latestPuzzle.id)
            .order('created_at', { ascending: true });

          if (words) {
            setLatestWords(words);
          }
        }
      } catch (error) {
        console.error('Error fetching latest words:', error);
      }
    };

    fetchLatestWords();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMMM dd yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return (
    <div className="space-y-8">
      <CalendarSection />

      <div className="bg-white rounded-lg overflow-hidden">
        <div className="bg-gray-100 p-4">
          <h2 className="text-xl font-bold text-gray-800">About the Game</h2>
        </div>
        <div className="p-4">
          <img 
            src="https://dailyjumbleanswers.com/assets/img/game-icon.png?ezimgfmt=ng%3Awebp%2Fngcb1%2Frs%3Adevice%2Frscb1-1"
            alt="Daily Jumble Game Icon"
            className="float-left mr-4 mb-2 w-16 h-16"
          />
          <p className="text-gray-600">
            Daily Jumble is one of the most popular word games which has maintained top rankings on both iOS and Android stores and the web. In case you haven't downloaded yet the game and would like to do so you can click the respective images below and you will be redirected to the download page.
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="bg-gray-100 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Latest Jumble</h2>
          {latestDate && (
            <p className="text-[#0275d8] font-medium">{formatDate(latestDate)}</p>
          )}
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {latestDate && (
              <div className="bg-white p-4 rounded border">
                <ul className="space-y-2">
                  {latestWords.map((word, index) => (
                    <li 
                      key={index} 
                      className="flex items-center space-x-2"
                    >
                      <span className="text-[#0275d8] text-lg">•</span>
                      <Link 
                        to={`/jumble/${word.jumbled_word.toLowerCase()}`}
                        className="text-gray-700 hover:text-[#0275d8] hover:underline transition-colors"
                      >
                        {word.jumbled_word}
                      </Link>
                    </li>
                  ))}
                  {finalJumble && (
                    <li className="flex items-center space-x-2 mt-4 pt-4 border-t">
                      <span className="text-[#0275d8] text-lg">•</span>
                      <Link 
                        to={`/jumble/${finalJumble.toLowerCase()}`}
                        className="text-[#0275d8] font-medium hover:underline transition-colors"
                      >
                        {finalJumble}
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;