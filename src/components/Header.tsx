import { Brain } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-jumble-background p-6 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-jumble-primary" />
          <h1 className="text-2xl font-bold text-jumble-text">JumbleAnswers.com</h1>
        </div>
        <nav>
          <ul className="flex gap-6">
            <li>
              <a href="#daily" className="text-jumble-text hover:text-jumble-primary transition-colors">
                Daily Puzzle
              </a>
            </li>
            <li>
              <a href="#how-to-play" className="text-jumble-text hover:text-jumble-primary transition-colors">
                How to Play
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;