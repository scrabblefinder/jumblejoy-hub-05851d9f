import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type JumbleWord = Tables<'jumble_words'>;

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<JumbleWord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (searchTerm.length === 0) {
      setShowResults(false);
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    setShowResults(true);

    try {
      const { data, error } = await supabase
        .from('jumble_words')
        .select('*')
        .ilike('jumbled_word', `%${searchTerm}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (word: string) => {
    setShowResults(false);
    setSearchTerm('');
    navigate(`/jumble/${word.toLowerCase()}`);
  };

  return (
    <header className="bg-[#2f75d9] border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-3xl font-bold text-white hover:opacity-90 transition-opacity">
            JumbleAnswers.com
          </Link>
          
          <div className="relative flex items-center">
            <div className="flex">
              <input 
                type="text" 
                placeholder="Search for a jumbled word..."
                className="w-64 p-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value.length >= 1) {
                    handleSearch();
                  } else {
                    setShowResults(false);
                    setSearchResults([]);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                onBlur={() => {
                  setTimeout(() => setShowResults(false), 200);
                }}
                onFocus={() => {
                  if (searchTerm.length >= 1) handleSearch();
                }}
              />
              <button 
                className="px-4 bg-white text-[#2f75d9] font-semibold rounded-r-md hover:bg-gray-100 transition-colors"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>

            {showResults && searchTerm.length >= 1 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-gray-500">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-gray-500">No results found</div>
                ) : (
                  searchResults.map((word, index) => (
                    <button
                      key={index}
                      className="w-full text-left p-3 hover:bg-gray-100 border-b last:border-b-0 transition-colors"
                      onClick={() => handleResultClick(word.jumbled_word)}
                    >
                      <span className="text-[#2f75d9] font-semibold">{word.jumbled_word}</span>
                      <span className="text-gray-500 text-sm ml-2">Click to reveal answer</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;