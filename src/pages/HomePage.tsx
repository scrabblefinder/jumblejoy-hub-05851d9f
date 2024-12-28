import React, { useEffect, useState } from 'react';
import { initializeSearch, updatePuzzleUI } from '../utils/jumbleUtils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

const HomePage = () => {
  const [accordionState, setAccordionState] = useState<{ [key: string]: boolean }>({});
  
  const toggleAccordion = (id: string) => {
    setAccordionState(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const { data: puzzles } = useQuery({
    queryKey: ['daily-puzzles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_puzzles')
        .select(`
          *,
          jumble_words (
            jumbled_word,
            answer
          )
        `)
        .order('date', { ascending: false })
        .limit(2);

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    initializeSearch();
    
    if (puzzles && puzzles.length > 0) {
      // Update Dec 28 puzzle
      updatePuzzleUI(puzzles[0], 'dec28');
      
      // Update Dec 27 puzzle if available
      if (puzzles.length > 1) {
        updatePuzzleUI(puzzles[1], 'dec27');
      }
    }
  }, [puzzles]);

  return (
    <>
      <header className="bg-[#f8f9fa] border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="text-3xl font-bold text-[#0275d8] hover:opacity-90 transition-opacity">JumbleAnswers.com</a>
            </div>
            <div className="flex gap-2">
              <a href="#" className="p-2 hover:opacity-80">
                <img src="https://dailyjumbleanswers.com/wp-content/themes/jumble/images/facebook.png" alt="Facebook" className="h-8 w-8" />
              </a>
              <a href="#" className="p-2 hover:opacity-80">
                <img src="https://dailyjumbleanswers.com/wp-content/themes/jumble/images/twitter.png" alt="Twitter" className="h-8 w-8" />
              </a>
              <a href="#" className="p-2 hover:opacity-80">
                <img src="https://dailyjumbleanswers.com/wp-content/themes/jumble/images/google.png" alt="Google" className="h-8 w-8" />
              </a>
              <a href="#" className="p-2 hover:opacity-80">
                <img src="https://dailyjumbleanswers.com/wp-content/themes/jumble/images/pinterest.png" alt="Pinterest" className="h-8 w-8" />
              </a>
              <a href="#" className="p-2 hover:opacity-80">
                <img src="https://dailyjumbleanswers.com/wp-content/themes/jumble/images/email.png" alt="Email" className="h-8 w-8" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Latest Daily Jumble Answers</h1>
            
            {/* December 28 Puzzle */}
            <div className="bg-white rounded-lg overflow-hidden mb-8">
              <div className="bg-[#0275d8] text-white p-4 text-xl text-center">
                <a href="#" className="hover:underline">Daily Jumble December 28 2024 Answers</a>
              </div>
              <div className="p-4 space-y-4 border-x border-b">
                <div className="flex gap-8">
                  <div id="jumble-words-dec28" className="w-3/4 space-y-4">
                    {/* Jumble words will be inserted here by JavaScript */}
                  </div>
                  
                  <div className="w-1/4 flex flex-col items-center space-y-4">
                    <div className="w-[74%]">
                      <img 
                        src="https://assets.amuniversal.com/786dc2f09ec0013d8360005056a9545d" 
                        alt="Daily Jumble Puzzle" 
                        className="w-full rounded-lg shadow-lg"
                      />
                    </div>
                    <div className="border-t pt-4 w-full">
                      <p id="puzzle-caption-dec28" className="text-[#0275d8] text-lg"></p>
                    </div>
                  </div>
                </div>
                
                <div id="solution-container-dec28" className="hidden border-t pt-4">
                  <p id="puzzle-solution-dec28" className="text-[#0275d8] font-bold"></p>
                </div>
              </div>
            </div>

            {/* December 27 Puzzle */}
            <div className="bg-white rounded-lg overflow-hidden mb-8">
              <div className="bg-[#0275d8] text-white p-4 text-xl flex justify-between items-center">
                <span className="w-full text-center">Daily Jumble December 27 2024 Answers</span>
                <button 
                  onClick={() => toggleAccordion('dec27')} 
                  className="text-2xl hover:opacity-80 transition-opacity focus:outline-none ml-2"
                >
                  <span>{accordionState['dec27'] ? '-' : '+'}</span>
                </button>
              </div>
              <div className={accordionState['dec27'] ? '' : 'hidden'}>
                <div className="p-4 space-y-4 border-x border-b">
                  <div className="flex gap-8">
                    <div id="jumble-words-dec27" className="w-3/4 space-y-4">
                      {/* Jumble words will be inserted here by JavaScript */}
                    </div>
                    
                    <div className="w-1/4 flex flex-col items-center space-y-4">
                      <div className="w-[74%]">
                        <img 
                          src="https://assets.amuniversal.com/75efe9c09ec0013d8360005056a9545d" 
                          alt="Daily Jumble Puzzle" 
                          className="w-full rounded-lg shadow-lg"
                        />
                      </div>
                      <div className="border-t pt-4 w-full">
                        <p id="puzzle-caption-dec27" className="text-[#0275d8] text-lg"></p>
                      </div>
                    </div>
                  </div>
                  
                  <div id="solution-container-dec27" className="hidden border-t pt-4">
                    <p id="puzzle-solution-dec27" className="text-[#0275d8] font-bold"></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-1">
            {/* Search moved to sidebar top */}
            <div className="bg-white rounded-lg overflow-hidden mb-8">
              <div className="bg-gray-100 p-4">
                <h2 className="text-xl font-bold text-gray-800">Search Jumble Words</h2>
              </div>
              <div className="p-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Type your jumbled word" 
                    className="w-full p-3 border rounded-md"
                  />
                  <button className="absolute right-0 top-0 h-full px-6 bg-[#0275d8] text-white rounded-r-md hover:bg-[#025aa5]">
                    SEARCH
                  </button>
                </div>
              </div>
            </div>

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
            
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="bg-gray-100 p-4">
                <h2 className="text-xl font-bold text-gray-800">Jumble Clues</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="bg-gray-100 p-4 rounded">
                    <p className="text-[#0275d8]" id="puzzle-date"></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#222222] text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">About JumbleAnswers.com</h3>
              <p className="text-gray-300">
                Your daily source for Jumble puzzle solutions. We help you unscramble words and solve the daily cartoon caption.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-300 hover:text-white">Home</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Latest Answers</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">How to Play</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
              <div className="flex gap-4">
                <a href="#" className="text-gray-300 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-300 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-300 hover:text-white">Email</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 JumbleAnswers.com. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default HomePage;
