import { useState } from 'react';

const Sidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');

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
  );
};

export default Sidebar;