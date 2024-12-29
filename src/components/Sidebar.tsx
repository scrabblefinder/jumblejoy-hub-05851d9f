import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';

const Sidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [latestWords, setLatestWords] = useState<any[]>([]);
  const [latestDate, setLatestDate] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchLatestWords = async () => {
      try {
        const { data: latestPuzzle } = await supabase
          .from('daily_puzzles')
          .select('id, date')
          .order('date', { ascending: false })
          .limit(1)
          .single();

        if (latestPuzzle) {
          setLatestDate(latestPuzzle.date);
          
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

  useEffect(() => {
    const searchWords = async () => {
      if (searchTerm.length === 0) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      setShowResults(true);
      try {
        const { data: words, error } = await supabase
          .from('jumble_words')
          .select('jumbled_word')
          .ilike('jumbled_word', `%${searchTerm.toUpperCase()}%`)
          .limit(10);

        if (error) throw error;
        setSearchResults(words || []);
      } catch (error) {
        console.error('Error searching words:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchWords, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMMM dd yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const handleResultClick = (word: string) => {
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="bg-gray-100 p-4">
          <h2 className="text-xl font-bold text-gray-800">Search Jumble Words</h2>
        </div>
        <div className="p-4">
          <div className="relative">
            <div className="flex">
              <input 
                type="text" 
                placeholder="Type your jumbled word" 
                className="w-full p-3 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={() => {
                  // Delay hiding results to allow for click events
                  setTimeout(() => setShowResults(false), 200);
                }}
                onFocus={() => {
                  if (searchTerm) setShowResults(true);
                }}
              />
              <button 
                className="px-6 bg-[#0275d8] text-white rounded-r-md hover:bg-[#025aa5] transition-colors"
                onClick={() => setShowResults(true)}
              >
                SEARCH
              </button>
            </div>
            {showResults && searchTerm.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-gray-500">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-gray-500">No matches found</div>
                ) : (
                  searchResults.map((word, index) => (
                    <Link
                      key={index}
                      to={`/jumble/${word.jumbled_word.toLowerCase()}`}
                      className="block p-3 hover:bg-gray-100 border-b last:border-b-0 transition-colors"
                      onClick={() => handleResultClick(word.jumbled_word)}
                    >
                      <span className="text-[#0275d8] font-semibold">{word.jumbled_word}</span>
                    </Link>
                  ))
                )}
              </div>
            )}
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