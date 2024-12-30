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
}