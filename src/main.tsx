import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Create root and render app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize puzzles and other functionality
import { supabase } from "./integrations/supabase/client";
import { parseJumbleCallback, parseJumbleXML } from './utils/parseUtils';
import { initializeSearch, updatePuzzleUI } from './utils/jumbleUtils';

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

// Toggle accordion functionality
window.toggleAccordion = function(id) {
  const content = document.getElementById(`accordion-content-${id}`);
  const icon = document.getElementById(`accordion-icon-${id}`);
  
  if (content && icon) {
    content.classList.toggle('hidden');
    icon.textContent = content.classList.contains('hidden') ? '+' : '-';
  }
};

// Handle client-side navigation
function handleNavigation() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-link]');
    if (link) {
      e.preventDefault();
      const path = link.getAttribute('href');
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  });
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  initializePuzzles();
  initializeSearch();
  handleNavigation();
});