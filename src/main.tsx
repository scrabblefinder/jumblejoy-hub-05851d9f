import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Create root and render app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize puzzles and other functionality
import { supabase } from "./integrations/supabase/client";
import { parseJumbleCallback, parseJumbleXML } from './utils/parseUtils';
import { initializeSearch, updatePuzzleUI } from './utils/jumbleUtils';

// Declare the global toggleAccordion function type
declare global {
  interface Window {
    toggleAccordion: (id: string) => void;
  }
}

async function initializePuzzles() {
  try {
    // Get the two most recent puzzles
    const { data: recentPuzzles, error: puzzlesError } = await supabase
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

    if (puzzlesError) throw puzzlesError;
    
    if (!recentPuzzles || recentPuzzles.length < 2) {
      throw new Error('Not enough puzzles found');
    }

    const [latestPuzzle, previousPuzzle] = recentPuzzles;

    // Process latest puzzle XML data
    const xmlData = {
      date: { v: latestPuzzle.date.replace(/-/g, '') },
      clues: {
        c1: { j: "RUGDO", a: "GOURD", circle: "2,5" },
        c2: { j: "PWRIE", a: "WIPER", circle: "3,4" },
        c3: { j: "ACLBTO", a: "COBALT", circle: "2,6" },
        c4: { j: "LYRURF", a: "FLURRY", circle: "3,5" }
      },
      caption: { v1: { t: latestPuzzle.caption } },
      solution: { s1: { layout: latestPuzzle.solution, a: latestPuzzle.solution } }
    };

    const processedDataLatest = parseJumbleXML(xmlData);
    
    // Process previous puzzle JSON data
    const sampleData = {
      "Date": previousPuzzle.date.replace(/-/g, ''),
      "Clues": {
        "c1": "KAENL", "c2": "LUGTI", "c3": "BLIUFA", "c4": "CONOHH",
        "a1": "ANKLE", "a2": "GUILT", "a3": "FIBULA", "a4": "HONCHO",
        "o1": "2,3,5", "o2": "2,4,5", "o3": "2,3,6", "o4": "3,5"
      },
      "Caption": {
        "v1": previousPuzzle.caption
      },
      "Solution": {
        "s1": previousPuzzle.solution,
        "k1": previousPuzzle.solution
      },
      "Image": previousPuzzle.image_url
    };

    const processedDataPrevious = parseJumbleCallback(sampleData);
    
    // Update latest puzzle UI with XML data
    updatePuzzleUI({ ...latestPuzzle, finalJumble: processedDataLatest.finalJumble }, 'latest');
    
    // Update previous puzzle UI with JSON data
    updatePuzzleUI({ ...previousPuzzle, finalJumble: processedDataPrevious.finalJumble }, 'previous');

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
    const target = e.target as HTMLElement;
    const link = target.closest('[data-link]');
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