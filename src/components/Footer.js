export function renderFooter() {
  const footer = document.getElementById('footer');
  
  footer.innerHTML = `
    <footer class="bg-[#222222] text-white mt-12">
      <div class="container mx-auto px-4 py-8">
        <div class="grid md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-xl font-bold mb-4">About JumbleAnswers.com</h3>
            <p class="text-gray-300">
              Your daily source for Jumble puzzle solutions. We help you unscramble words and solve the daily cartoon caption.
            </p>
          </div>
          <div>
            <h3 class="text-xl font-bold mb-4">Quick Links</h3>
            <ul class="space-y-2">
              <li><a href="/" class="text-gray-300 hover:text-white">Home</a></li>
              <li><a href="/" class="text-gray-300 hover:text-white">Latest Answers</a></li>
              <li><a href="/privacy-policy" class="text-gray-300 hover:text-white">Privacy Policy</a></li>
              <li><a href="/privacy-policy" class="text-gray-300 hover:text-white">Disclaimer</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-xl font-bold mb-4">Connect With Us</h3>
            <div class="flex gap-4">
              <a href="#" class="text-gray-300 hover:text-white">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-300 hover:text-white">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div class="border-t border-gray-700 mt-8 pt-8 text-center">
          <p class="text-gray-400 text-sm mb-4">
            Jumble® is a registered trademark of Tribune Media Services, Inc. DailyJumbleAnswers.com is not affiliated with Jumble® or Tribune Media Services Inc, in any way. This site is for entertainment purposes only.
          </p>
          <p class="text-gray-400">&copy; 2024 JumbleAnswers.com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `;
}