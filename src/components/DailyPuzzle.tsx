import { useState } from "react";
import { Puzzle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JumbleData {
  Date: string;
  Clues: {
    [key: string]: string;
  };
  Caption: {
    v1: string;
  };
  Solution: {
    s1: string;
    k1: string;
  };
  Image: string;
}

const mockData: JumbleData = {
  Date: "20241228",
  Clues: {
    c1: "RUGDO",
    c2: "PWRIE",
    c3: "ACLBTO",
    c4: "LYRURF",
    a1: "GOURD",
    a2: "WIPER",
    a3: "COBALT",
    a4: "FLURRY"
  },
  Caption: {
    v1: "As "The Wave" went around the stadium, whole sections of fans were —"
  },
  Solution: {
    s1: "UPROOTED",
    k1: "UPROOTED"
  },
  Image: "https://assets.amuniversal.com/786dc2f09ec0013d8360005056a9545d"
};

const DailyPuzzle = () => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const formatDate = (dateStr: string) => {
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    return new Date(`${year}-${month}-${day}`).toLocaleDateString();
  };

  return (
    <section id="daily" className="container mx-auto py-12">
      <div className="bg-white/5 rounded-lg p-8 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-6">
          <Puzzle className="h-6 w-6 text-jumble-primary" />
          <h2 className="text-xl font-bold text-jumble-text">Daily Puzzle - {formatDate(mockData.Date)}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <img 
              src={mockData.Image} 
              alt="Daily Jumble Puzzle" 
              className="rounded-lg shadow-lg w-full"
            />
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(mockData.Clues)
                .filter(([key]) => key.startsWith("c"))
                .map(([key, value], index) => (
                  <div key={key} className="relative group">
                    <div className="bg-jumble-background p-4 rounded-lg border border-jumble-primary/20">
                      <p className="text-lg font-mono text-jumble-text">{value}</p>
                      {showAnswers && (
                        <div className="mt-2 flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-jumble-primary" />
                          <p className="text-jumble-primary font-bold">
                            {mockData.Clues[`a${index + 1}`]}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
              ))}
            </div>

            <div className="space-y-4">
              <p className="text-jumble-text text-lg">{mockData.Caption.v1}</p>
              
              {showSolution && (
                <div className="bg-jumble-primary/20 p-4 rounded-lg">
                  <p className="text-jumble-primary font-bold text-xl">
                    {mockData.Solution.s1}
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={() => setShowAnswers(!showAnswers)}
                  variant="outline"
                  className="bg-jumble-primary/20 text-jumble-text hover:bg-jumble-primary/30"
                >
                  {showAnswers ? "Hide Answers" : "Show Answers"}
                </Button>
                <Button
                  onClick={() => setShowSolution(!showSolution)}
                  variant="outline"
                  className="bg-jumble-primary/20 text-jumble-text hover:bg-jumble-primary/30"
                >
                  {showSolution ? "Hide Solution" : "Show Solution"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DailyPuzzle;