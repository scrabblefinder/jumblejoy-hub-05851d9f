import { supabase } from "../integrations/supabase/client";

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const initializeSearch = () => {
  const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
  if (!searchInput) return;
  
  const searchButton = searchInput.nextElementSibling;
  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'absolute w-full bg-white border rounded-md mt-1 shadow-lg z-50 max-h-60 overflow-y-auto hidden';
  searchInput.parentNode?.appendChild(resultsContainer);

  async function showResults(query: string) {
    const { data: words, error } = await supabase
      .from('jumble_words')
      .select('jumbled_word, answer')
      .ilike('jumbled_word', `%${query}%`)
      .limit(10);

    if (error) {
      console.error('Error fetching results:', error);
      return;
    }

    resultsContainer.innerHTML = !words || words.length === 0
      ? '<div class="p-3 text-gray-500">No matches found</div>'
      : words
          .map(({ jumbled_word, answer }) => `
            <a href="/jumble/${jumbled_word.toLowerCase()}" 
               class="block p-3 hover:bg-gray-100 border-b last:border-b-0">
              <span class="text-[#0275d8] font-semibold">${jumbled_word}</span>
              <span class="text-gray-500 ml-2">→</span>
              <span class="text-green-600 font-semibold ml-2">${answer}</span>
            </a>
          `)
          .join('');
    
    resultsContainer.classList.remove('hidden');
  }

  const handleSearch = async (query: string) => {
    if (query.length === 0) {
      resultsContainer.classList.add('hidden');
      return;
    }
    await showResults(query.toUpperCase());
  };

  searchInput.addEventListener('input', () => handleSearch(searchInput.value));
  searchInput.addEventListener('focus', () => handleSearch(searchInput.value));
  searchInput.addEventListener('blur', () => {
    setTimeout(() => resultsContainer.classList.add('hidden'), 200);
  });
  if (searchButton) {
    searchButton.addEventListener('click', (e) => {
      e.preventDefault();
      handleSearch(searchInput.value);
    });
  }
};

export const updatePuzzleUI = (puzzle: any, suffix: string) => {
  const puzzleDateEl = document.getElementById(`puzzle-date-${suffix}`);
  const puzzleCaptionEl = document.getElementById(`puzzle-caption-${suffix}`);
  const jumbleWordsContainer = document.getElementById(`jumble-words-${suffix}`);
  const solutionContainer = document.getElementById(`solution-container-${suffix}`);
  const puzzleSolution = document.getElementById(`puzzle-solution-${suffix}`);

  if (puzzleDateEl) {
    puzzleDateEl.textContent = `Daily Puzzle - ${formatDate(puzzle.date)}`;
  }
  
  if (puzzleCaptionEl && puzzle.caption) {
    puzzleCaptionEl.innerHTML = `
      <a href="/jumble/${puzzle.caption.toLowerCase()}" class="text-[#0275d8] hover:underline cursor-pointer">
        ${puzzle.caption}
      </a>
    `;
  }

  if (jumbleWordsContainer && puzzle.jumble_words) {
    let wordsHtml = puzzle.jumble_words
      .map(({ jumbled_word, answer }: { jumbled_word: string; answer: string }) => `
        <div class="jumble-word bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
          <div class="flex justify-between items-center mb-2">
            <a href="/jumble/${jumbled_word.toLowerCase()}" class="flex-1">
              <div class="text-xl font-semibold text-gray-800 hover:text-[#0275d8] transition-colors">
                ${jumbled_word}
              </div>
            </a>
            <div class="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
              ${jumbled_word.length} Letters
            </div>
          </div>
          <div class="flex items-center gap-2 text-green-600">
            <span class="text-gray-400">→</span>
            <span class="font-medium">${answer}</span>
          </div>
        </div>
      `)
      .join('');

    if (puzzle.finalJumble) {
      wordsHtml += `
        <div class="jumble-word bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors mt-4">
          <div class="flex justify-between items-center mb-2">
            <a href="/jumble/${puzzle.finalJumble.toLowerCase()}" class="flex-1">
              <div class="text-xl font-semibold text-[#0275d8] hover:opacity-80 transition-colors">
                ${puzzle.finalJumble}
              </div>
            </a>
            <div class="text-sm text-blue-600 bg-white px-3 py-1 rounded-full">
              ${puzzle.finalJumble.length} Letters
            </div>
          </div>
          <div class="flex items-center gap-2 text-blue-600">
            <span class="text-blue-300">→</span>
            <span class="font-medium">${puzzle.solution}</span>
          </div>
        </div>
      `;
    }

    jumbleWordsContainer.innerHTML = wordsHtml;
  }

  if (solutionContainer && puzzleSolution) {
    puzzleSolution.textContent = puzzle.solution;
  }
};