import { supabase } from "./integrations/supabase/client";
import { formatDate } from './utils/dateUtils';

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

    if (!words || words.length === 0) {
      resultsContainer.innerHTML = '<div class="p-3 text-gray-500">No matches found</div>';
    } else {
      resultsContainer.innerHTML = words
        .map(({ jumbled_word, answer }) => `
          <a href="/jumble/${jumbled_word.toLowerCase()}" 
             class="block p-3 hover:bg-gray-100 border-b last:border-b-0">
            <span class="text-[#0275d8] font-semibold">${jumbled_word}</span>
            <span class="text-gray-500 ml-2">→</span>
            <span class="text-green-600 font-semibold ml-2">${answer}</span>
          </a>
        `)
        .join('');
    }
    resultsContainer.classList.remove('hidden');
  }

  function hideResults() {
    setTimeout(() => {
      resultsContainer.classList.add('hidden');
    }, 200);
  }

  async function handleSearch() {
    const query = searchInput.value.toUpperCase();
    if (query.length === 0) {
      hideResults();
      return;
    }
    await showResults(query);
  }

  searchInput.addEventListener('input', handleSearch);
  searchInput.addEventListener('focus', handleSearch);
  searchInput.addEventListener('blur', hideResults);
  searchButton.addEventListener('click', (e) => {
    e.preventDefault();
    handleSearch();
  });
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

    // Update Dec 28 UI
    updatePuzzleUI(puzzleDec28, 'dec28');
    
    // Update Dec 27 UI
    updatePuzzleUI(puzzleDec27, 'dec27');

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
    jumbleWordsContainer.innerHTML = puzzle.jumble_words
      .map(({ jumbled_word }) => `
        <div class="jumble-word">
          <a 
            href="/jumble/${jumbled_word.toLowerCase()}"
            class="text-[#0275d8] hover:underline cursor-pointer"
          >
            ${jumbled_word}
          </a>
        </div>
      `)
      .join('');
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
  
  const showAnswersBtn = document.getElementById('show-answers-btn');
  const showSolutionBtn = document.getElementById('show-solution-btn');
  
  if (showAnswersBtn) {
    showAnswersBtn.addEventListener('click', toggleAnswers);
  }
  if (showSolutionBtn) {
    showSolutionBtn.addEventListener('click', toggleSolution);
  }
});

// Toggle answers visibility
function toggleAnswers() {
  const answers = document.querySelectorAll('.jumble-answer');
  const button = document.getElementById('show-answers-btn');
  const isHidden = answers[0]?.classList.contains('hidden');
  
  answers.forEach(answer => {
    answer.classList.toggle('hidden');
  });
  
  if (button) {
    button.textContent = isHidden ? 'Hide Answers' : 'Show Answers';
  }
}

// Toggle solution visibility
function toggleSolution() {
  const solutionContainers = document.querySelectorAll('[id^="solution-container-"]');
  const button = document.getElementById('show-solution-btn');
  
  if (solutionContainers.length > 0 && button) {
    const isHidden = solutionContainers[0].classList.contains('hidden');
    solutionContainers.forEach(container => {
      container.classList.toggle('hidden');
    });
    button.textContent = isHidden ? 'Hide Solution' : 'Show Solution';
  }
}
