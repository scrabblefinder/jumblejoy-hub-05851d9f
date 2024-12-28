import { pipeline, env } from '@huggingface/transformers';
import { mockData, jumbleWords } from './utils/mockData';
import { formatDate } from './utils/dateUtils';
import { resizeImageIfNeeded } from './utils/imageUtils';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

// Handle jumble word clicks
document.addEventListener('click', (e) => {
  if (e.target.closest('.jumble-word a')) {
    e.preventDefault();
    const href = e.target.getAttribute('href');
    const word = href.split('/').pop();
    window.location.href = `/jumble/${word}`;
  }
});

// Initialize search functionality
function initializeSearch() {
  const searchInput = document.querySelector('input[type="text"]');
  const searchButton = searchInput.nextElementSibling;
  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'absolute w-full bg-white border rounded-md mt-1 shadow-lg z-50 max-h-60 overflow-y-auto hidden';
  searchInput.parentNode.appendChild(resultsContainer);

  function showResults(results) {
    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="p-3 text-gray-500">No matches found</div>';
    } else {
      resultsContainer.innerHTML = results
        .map(([jumbled, answer]) => `
          <a href="/jumble/${jumbled.toLowerCase()}" 
             class="block p-3 hover:bg-gray-100 border-b last:border-b-0">
            <span class="text-[#0275d8] font-semibold">${jumbled}</span>
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

  function handleSearch() {
    const query = searchInput.value.toUpperCase();
    if (query.length === 0) {
      hideResults();
      return;
    }

    const results = Object.entries(jumbleWords)
      .filter(([jumbled, answer]) => 
        jumbled.includes(query) || answer.includes(query)
      );

    showResults(results);
  }

  // Event listeners
  searchInput.addEventListener('input', handleSearch);
  searchInput.addEventListener('focus', handleSearch);
  searchInput.addEventListener('blur', hideResults);
  searchButton.addEventListener('click', (e) => {
    e.preventDefault();
    handleSearch();
  });
}

// Initialize the puzzle
async function initializePuzzle() {
  document.getElementById('puzzle-date').textContent = `Daily Puzzle - ${formatDate(mockData.Date)}`;
  document.getElementById('puzzle-caption').textContent = mockData.Caption.v1;
  
  // Process puzzle image
  const puzzleImage = document.getElementById('puzzle-image');
  if (puzzleImage) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        try {
          const processedBlob = await removeBackground(img);
          puzzleImage.src = URL.createObjectURL(processedBlob);
        } catch (error) {
          console.error('Failed to process image:', error);
        }
      };
      img.src = mockData.Image;
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  initializePuzzle();
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
  const isHidden = answers[0].classList.contains('hidden');
  
  answers.forEach(answer => {
    answer.classList.toggle('hidden');
  });
  
  button.textContent = isHidden ? 'Hide Answers' : 'Show Answers';
}

// Toggle solution visibility
function toggleSolution() {
  const solutionContainer = document.getElementById('solution-container');
  const button = document.getElementById('show-solution-btn');
  const isHidden = solutionContainer.classList.contains('hidden');
  
  solutionContainer.classList.toggle('hidden');
  button.textContent = isHidden ? 'Hide Solution' : 'Show Solution';
}