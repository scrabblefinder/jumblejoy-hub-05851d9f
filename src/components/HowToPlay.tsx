import { Book } from "lucide-react";

const HowToPlay = () => {
  return (
    <section id="how-to-play" className="container mx-auto py-12">
      <div className="bg-white/5 rounded-lg p-8 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-6">
          <Book className="h-6 w-6 text-jumble-primary" />
          <h2 className="text-xl font-bold text-jumble-text">How to Play</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-jumble-background p-6 rounded-lg border border-jumble-primary/20">
              <h3 className="text-lg font-bold text-jumble-text mb-2">Basic Rules</h3>
              <ul className="list-disc list-inside space-y-2 text-jumble-text/80">
                <li>Unscramble the four jumbled words</li>
                <li>Each jumble has only one correct solution</li>
                <li>All letters must be used exactly once</li>
                <li>Solutions are always common English words</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-jumble-background p-6 rounded-lg border border-jumble-primary/20">
              <h3 className="text-lg font-bold text-jumble-text mb-2">Final Solution</h3>
              <ul className="list-disc list-inside space-y-2 text-jumble-text/80">
                <li>After solving all four jumbles, tackle the final puzzle</li>
                <li>Use the circled letters from each solved word</li>
                <li>Arrange them to solve the cartoon caption</li>
                <li>The solution relates to the cartoon image</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToPlay;