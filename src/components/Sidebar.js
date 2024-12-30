export function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  
  sidebar.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-bold mb-4">Recent Solutions</h2>
      <div id="recent-solutions" class="space-y-4">
        <!-- Recent solutions will be populated dynamically -->
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-lg p-6 mt-6">
      <h2 class="text-xl font-bold mb-4">Popular Jumbles</h2>
      <div id="popular-jumbles" class="space-y-2">
        <!-- Popular jumbles will be populated dynamically -->
      </div>
    </div>
  `;
}