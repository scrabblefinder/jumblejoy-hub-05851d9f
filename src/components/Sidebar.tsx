import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';

const Sidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [latestWords, setLatestWords] = useState<any[]>([]);
  const [latestDate, setLatestDate] = useState<string>('');

  useEffect(() => {
    const fetchLatestWords = async () => {
      try {
        // First get the latest puzzle
        const { data: latestPuzzle } = await supabase
          .from('daily_puzzles')
          .select('id, date')
          .order('date', { ascending: false })
          .limit(1)
          .single();

        if (latestPuzzle) {
          setLatestDate(latestPuzzle.date);
          
          // Then get all jumbled words for this puzzle
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
      return dateString;
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="bg-gray-100 p-4">
          <h2 className="text-xl font-bold text-gray-800">Search Jumble Words</h2>
        </div>
        <div className="p-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Type your jumbled word" 
              className="w-full p-3 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-0 top-0 h-full px-6 bg-[#0275d8] text-white rounded-r-md hover:bg-[#025aa5]">
              SEARCH
            </button>
          </div>
        </div>
      </div>

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
        <div className="bg-gray-100 p-4">
          <h2 className="text-xl font-bold text-gray-800">Latest Jumble</h2>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {latestDate && (
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-[#0275d8] font-medium mb-2">{formatDate(latestDate)}</p>
                <ul className="space-y-2">
                  {latestWords.map((word, index) => (
                    <li key={index} className="text-gray-700">
                      {word.jumbled_word}
                    </li>
                  ))}
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