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
    // Get the latest puzzles
    const { data: puzzles, error: puzzlesError } = await supabase
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
    
    if (!puzzles || puzzles.length === 0) {
      console.log('No puzzles found');
      return;
    }

    // Latest puzzle (December 28)
    const latestPuzzle = puzzles[0];
    // Previous puzzle (December 27)
    const previousPuzzle = puzzles.length > 1 ? puzzles[1] : null;

    if (latestPuzzle) {
      // Process latest puzzle XML data
      const xmlData = {
        date: { v: latestPuzzle.date.replace(/-/g, '') },
        clues: {
          c1: { j: latestPuzzle.jumble_words[0]?.jumbled_word || "", a: latestPuzzle.jumble_words[0]?.answer || "", circle: "2,5" },
          c2: { j: latestPuzzle.jumble_words[1]?.jumbled_word || "", a: latestPuzzle.jumble_words[1]?.answer || "", circle: "3,4" },
          c3: { j: latestPuzzle.jumble_words[2]?.jumbled_word || "", a: latestPuzzle.jumble_words[2]?.answer || "", circle: "2,6" },
          c4: { j: latestPuzzle.jumble_words[3]?.jumbled_word || "", a: latestPuzzle.jumble_words[3]?.answer || "", circle: "3,5" }
        },
        caption: { v1: { t: latestPuzzle.caption } },
        solution: { s1: { layout: latestPuzzle.solution, a: latestPuzzle.solution } }
      };

      const processedDataLatest = parseJumbleXML(xmlData);
      
      // Update the final jumble in the database if it's not already set
      if (!latestPuzzle.final_jumble) {
        const { error: updateError } = await supabase
          .from('daily_puzzles')
          .update({ 
            final_jumble: "ODPEOTUR",
            final_jumble_answer: latestPuzzle.solution
          })
          .eq('id', latestPuzzle.id);

        if (updateError) console.error('Error updating final jumble:', updateError);
      }

      // Add the final jumble word to the jumble_words array
      const latestPuzzleWithFinalJumble = {
        ...latestPuzzle,
        jumble_words: [
          ...latestPuzzle.jumble_words,
          {
            id: 'final-jumble',
            jumbled_word: "ODPEOTUR",
            answer: latestPuzzle.solution
          }
        ]
      };

      updatePuzzleUI(latestPuzzleWithFinalJumble, 'latest');
    }
    
    if (previousPuzzle) {
      // Process previous puzzle JSON data
      const sampleData = {
        "Date": previousPuzzle.date.replace(/-/g, ''),
        "Clues": {
          "c1": previousPuzzle.jumble_words[0]?.jumbled_word || "",
          "c2": previousPuzzle.jumble_words[1]?.jumbled_word || "",
          "c3": previousPuzzle.jumble_words[2]?.jumbled_word || "",
          "c4": previousPuzzle.jumble_words[3]?.jumbled_word || "",
          "a1": previousPuzzle.jumble_words[0]?.answer || "",
          "a2": previousPuzzle.jumble_words[1]?.answer || "",
          "a3": previousPuzzle.jumble_words[2]?.answer || "",
          "a4": previousPuzzle.jumble_words[3]?.answer || "",
          "o1": "2,3,5",
          "o2": "2,4,5",
          "o3": "2,3,6",
          "o4": "3,5"
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
      
      // Update the final jumble in the database if it's not already set
      if (!previousPuzzle.final_jumble && processedDataPrevious.finalJumble) {
        const { error: updateError } = await supabase
          .from('daily_puzzles')
          .update({ 
            final_jumble: processedDataPrevious.finalJumble,
            final_jumble_answer: previousPuzzle.solution
          })
          .eq('id', previousPuzzle.id);

        if (updateError) console.error('Error updating final jumble:', updateError);
      }

      updatePuzzleUI({ 
        ...previousPuzzle, 
        finalJumble: processedDataPrevious.finalJumble || previousPuzzle.final_jumble 
      }, 'previous');
    }

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