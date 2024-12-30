import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  'https://jznccczfjmatdxdrvszk.supabase.co',
  'your-anon-key'
);

// Components
import { renderHeader } from './components/Header.js';
import { renderFooter } from './components/Footer.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderHomePage } from './pages/HomePage.js';
import { renderDailyPost } from './pages/DailyPost.js';
import { renderJumbleAnswer } from './pages/JumbleAnswer.js';
import { renderClueAnswer } from './pages/ClueAnswer.js';

// Router setup
const routes = {
  '/': renderHomePage,
  '/daily-jumble': renderDailyPost,
  '/jumble': renderJumbleAnswer,
  '/clue': renderClueAnswer,
};

// Initialize the app
async function initApp() {
  // Render static components
  renderHeader();
  renderFooter();
  renderSidebar();
  
  // Handle routing
  handleRoute();
  
  // Listen for navigation events
  window.addEventListener('popstate', handleRoute);
  document.addEventListener('click', handleNavigation);
}

// Handle route changes
async function handleRoute() {
  const path = window.location.pathname;
  const renderer = routes[path] || routes['/'];
  const contentEl = document.getElementById('content');
  
  try {
    await renderer(contentEl);
  } catch (error) {
    console.error('Error rendering page:', error);
    contentEl.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 class="text-2xl font-bold text-gray-800 mb-4">Error</h1>
        <p class="text-gray-600">Sorry, something went wrong. Please try again later.</p>
      </div>
    `;
  }
}

// Handle navigation clicks
function handleNavigation(event) {
  if (event.target.matches('a[href^="/"]')) {
    event.preventDefault();
    const href = event.target.getAttribute('href');
    window.history.pushState({}, '', href);
    handleRoute();
  }
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);

// Export for use in other files
export { supabase };