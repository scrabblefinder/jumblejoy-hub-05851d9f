import { supabase } from "./integrations/supabase/client";
import { formatDate } from './utils/dateUtils';
import { parseJumbleCallback, parseJumbleXML } from './utils/parseUtils';

// Initialize search functionality
function initializeSearch() {
  const searchInput = document.querySelector('input[type="text"]');
  if (!searchInput) return;
  
  const searchButton = searchInput.nextElementSibling;
  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'absolute w-full bg-white border rounded-md mt-1 shadow-lg z-50 max-h-60 overflow-y-auto hidden';
  searchInput.parentNode.appendChild(resultsContainer);

  async function showResults(query) {
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

  searchInput.addEventListener('input', () => handleSearch(searchInput.value));
  searchInput.addEventListener('focus', () => handleSearch(searchInput.value));
  searchInput.addEventListener('blur', () => {
    setTimeout(() => resultsContainer.classList.add('hidden'), 200);
  });
  searchButton.addEventListener('click', (e) => {
    e.preventDefault();
    handleSearch(searchInput.value);
  });

  async function handleSearch(query) {
    if (query.length === 0) {
      resultsContainer.classList.add('hidden');
      return;
    }
    await showResults(query.toUpperCase());
  }
}

// Initialize the puzzles
async function initializePuzzles() {
  try {
    // Fetch Dec 28 puzzle
    const { data: puzzleDec28, error: puzzleErrorDec28 } = await supabase
      .from('daily_puzzles')
      .select(`
        *,
        jumble_words (
          jumbled_word,
          answer
        )
      `)
      .eq('date', '2024-12-28')
      .single();

    if (puzzleErrorDec28) throw puzzleErrorDec28;

    // Fetch Dec 27 puzzle
    const { data: puzzleDec27, error: puzzleErrorDec27 } = await supabase
      .from('daily_puzzles')
      .select(`
        *,
        jumble_words (
          jumbled_word,
          answer
        )
      `)
      .eq('date', '2024-12-27')
      .single();

    if (puzzleErrorDec27) throw puzzleErrorDec27;

    // Process Dec 28 XML data
    const xmlData = {
      date: { v: "20241228" },
      clues: {
        c1: { j: "RUGDO", a: "GOURD", circle: "2,5" },
        c2: { j: "PWRIE", a: "WIPER", circle: "3,4" },
        c3: { j: "ACLBTO", a: "COBALT", circle: "2,6" },
        c4: { j: "LYRURF", a: "FLURRY", circle: "3,5" }
      },
      caption: { v1: { t: "As \"The Wave\" went around the stadium, whole sections of fans were —" } },
      solution: { s1: { layout: "UPROOTED", a: "UPROOTED" } }
    };

    const processedDataDec28 = parseJumbleXML(xmlData);
    
    // Process Dec 27 JSON data
    const sampleData = {
      "Date": "20241227",
      "Clues": {
        "c1": "KAENL", "c2": "LUGTI", "c3": "BLIUFA", "c4": "CONOHH",
        "a1": "ANKLE", "a2": "GUILT", "a3": "FIBULA", "a4": "HONCHO",
        "o1": "2,3,5", "o2": "2,4,5", "o3": "2,3,6", "o4": "3,5"
      },
      "Caption": {
        "v1": "Brain transplants might be possible in the future, but for now the idea is —"
      },
      "Solution": {
        "s1": "UNTHINKABLE",
        "k1": "UNTHINKABLE"
      },
      "Image": "https://assets.amuniversal.com/75efe9c09ec0013d8360005056a9545d"
    };

    const processedDataDec27 = parseJumbleCallback(sampleData);
    
    // Update Dec 28 UI with XML data
    updatePuzzleUI({ ...puzzleDec28, finalJumble: processedDataDec28.finalJumble }, 'dec28');
    
    // Update Dec 27 UI with JSON data
    updatePuzzleUI({ ...puzzleDec27, finalJumble: processedDataDec27.finalJumble }, 'dec27');

  } catch (error) {
    console.error('Failed to initialize puzzles:', error);
  }
}

// Helper function to update puzzle UI
function updatePuzzleUI(puzzle, suffix) {
  const puzzleDateEl = document.getElementById(`puzzle-date-${suffix}`);
  const puzzleCaptionEl = document.getElementById(`puzzle-caption-${suffix}`);
  const jumbleWordsContainer = document.getElementById(`jumble-words-${suffix}`);
  const solutionContainer = document.getElementById(`solution-container-${suffix}`);
  const puzzleSolution = document.getElementById(`puzzle-solution-${suffix}`);

  if (puzzleDateEl) {
    puzzleDateEl.textContent = `Daily Puzzle - ${formatDate(puzzle.date)}`;
  }
  
  if (puzzleCaptionEl) {
    const captionSlug = puzzle.caption
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
      
    puzzleCaptionEl.innerHTML = `
      <a href="/jumble/${captionSlug}" class="text-[#0275d8] hover:underline cursor-pointer">
        ${puzzle.caption}
      </a>
    `;
  }

  if (jumbleWordsContainer && puzzle.jumble_words) {
    let wordsHtml = puzzle.jumble_words
      .map(({ jumbled_word }) => `
        <div class="jumble-word flex justify-between items-center">
          <div class="text-lg text-gray-800">${jumbled_word}</div>
          <div class="text-sm text-gray-500">${jumbled_word.length} Letters</div>
        </div>
      `)
      .join('');

    // Add the final jumbled word if available, with the same styling
    if (puzzle.finalJumble) {
      wordsHtml += `
        <div class="jumble-word flex justify-between items-center">
          <div class="text-lg text-gray-800">${puzzle.finalJumble}</div>
          <div class="text-sm text-gray-500">${puzzle.finalJumble.length} Letters</div>
        </div>
      `;
    }

    jumbleWordsContainer.innerHTML = wordsHtml;
  }

  if (solutionContainer && puzzleSolution) {
    puzzleSolution.textContent = puzzle.solution;
  }
}

// Toggle accordion functionality
window.toggleAccordion = function(id) {
  const content = document.getElementById(`accordion-content-${id}`);
  const icon = document.getElementById(`accordion-icon-${id}`);
  
  if (content && icon) {
    content.classList.toggle('hidden');
    icon.textContent = content.classList.contains('hidden') ? '+' : '-';
  }
};

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  initializePuzzles();
  initializeSearch();
});
