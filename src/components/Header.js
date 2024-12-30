export function renderHeader() {
  const header = document.getElementById('header');
  
  header.innerHTML = `
    <header class="bg-[#2f75d9] border-b">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <a href="/" class="text-3xl font-bold text-white hover:opacity-90 transition-opacity">
            JumbleAnswers.com
          </a>
          
          <div class="relative flex items-center">
            <div class="flex">
              <input 
                type="text" 
                id="searchInput"
                placeholder="Search for a jumbled word..."
                class="w-64 p-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button 
                id="searchButton"
                class="px-4 bg-white text-[#2f75d9] font-semibold rounded-r-md hover:bg-gray-100 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `;

  // Add event listeners
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  
  searchButton.addEventListener('click', handleSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
}

async function handleSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput.value.trim();
  
  if (searchTerm) {
    try {
      const { data, error } = await supabase
        .from('jumble_words')
        .select('*')
        .ilike('jumbled_word', `%${searchTerm}%`)
        .limit(5);

      if (error) throw error;
      
      if (data && data.length > 0) {
        window.location.href = `/jumble/${data[0].jumbled_word.toLowerCase()}`;
      } else {
        // Show no results found message
        const resultsDiv = document.createElement('div');
        resultsDiv.className = 'absolute left-0 right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-50';
        resultsDiv.innerHTML = '<div class="p-3 text-gray-500">No results found</div>';
        
        const searchContainer = searchInput.parentElement;
        searchContainer.appendChild(resultsDiv);
        
        setTimeout(() => {
          resultsDiv.remove();
        }, 3000);
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  }
}