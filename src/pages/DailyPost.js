export function renderDailyPost(contentEl) {
  contentEl.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg p-8">
      <h1 class="text-3xl font-bold mb-4">Daily Jumble</h1>
      <div id="daily-puzzle">Loading...</div>
    </div>
  `;
}