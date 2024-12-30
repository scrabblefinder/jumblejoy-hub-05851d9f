export function renderHomePage(contentEl) {
  contentEl.innerHTML = `
    <div class="space-y-8">
      <section class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold mb-4">Daily Jumble Answers</h1>
        <p class="text-gray-600 mb-6">
          Get solutions for today's Jumble puzzle and browse through our archive of past answers.
        </p>
        <div id="latest-puzzle" class="border-t pt-6">
          <!-- Latest puzzle will be populated dynamically -->
          <div class="animate-pulse">
            <div class="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </section>
      
      <section class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold mb-4">How to Play Jumble</h2>
        <div class="prose max-w-none">
          <p>The Daily Jumble is a word puzzle game that consists of unscrambling letters to form words, then using marked letters to solve a final phrase or answer.</p>
          <ol class="list-decimal pl-6 space-y-2">
            <li>Unscramble the four jumbled words</li>
            <li>Write down the circled letters</li>
            <li>Arrange the circled letters to solve the cartoon caption</li>
          </ol>
        </div>
      </section>
    </div>
  `;

  // Fetch and display the latest puzzle
  fetchLatestPuzzle();
}

async function fetchLatestPuzzle() {
  try {
    const { data: puzzles, error } = await supabase
      .from('daily_puzzles')
      .select(`
        *,
        jumble_words (
          jumbled_word,
          answer
        )
      `)
      .order('date', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (puzzles && puzzles.length > 0) {
      const latestPuzzle = puzzles[0];
      const latestPuzzleEl = document.getElementById('latest-puzzle');
      
      if (latestPuzzleEl) {
        latestPuzzleEl.innerHTML = `
          <div class="space-y-4">
            <h3 class="text-xl font-bold text-gray-800">
              Latest Puzzle - ${new Date(latestPuzzle.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="space-y-2">
                ${latestPuzzle.jumble_words.map(word => `
                  <a href="/jumble/${word.jumbled_word.toLowerCase()}" 
                     class="block bg-gray-50 p-3 rounded hover:bg-gray-100 transition-colors">
                    <div class="flex justify-between items-center">
                      <span class="text-lg font-medium text-[#0275d8]">${word.jumbled_word}</span>
                      <span class="text-sm text-gray-500">${word.jumbled_word.length} letters</span>
                    </div>
                  </a>
                `).join('')}
              </div>
              <div class="flex flex-col items-center space-y-4">
                <img 
                  src="${latestPuzzle.image_url}" 
                  alt="Daily Jumble Puzzle" 
                  class="rounded-lg shadow-md max-w-full h-auto"
                />
                <a href="/clue/${encodeURIComponent(latestPuzzle.caption)}"
                   class="text-[#0275d8] hover:underline text-center">
                  ${latestPuzzle.caption}
                </a>
              </div>
            </div>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('Error fetching latest puzzle:', error);
    const latestPuzzleEl = document.getElementById('latest-puzzle');
    if (latestPuzzleEl) {
      latestPuzzleEl.innerHTML = `
        <div class="bg-red-50 text-red-600 p-4 rounded">
          Sorry, we couldn't load the latest puzzle. Please try again later.
        </div>
      `;
    }
  }
}