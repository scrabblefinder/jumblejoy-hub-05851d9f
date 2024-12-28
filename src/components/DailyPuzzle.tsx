import { useState, useEffect } from "react";
import { Puzzle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeBackground, loadImage } from "@/utils/imageUtils";

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
    v1: "As \"The Wave\" went around the stadium, whole sections of fans were —"
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
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  useEffect(() => {
    const processImage = async () => {
      try {
        const response = await fetch(mockData.Image);
        const blob = await response.blob();
        const img = await loadImage(blob);
        const processedBlob = await removeBackground(img);
        setProcessedImage(URL.createObjectURL(processedBlob));
      } catch (error) {
        console.error('Error processing image:', error);
        setProcessedImage(mockData.Image); // Fallback to original image
      }
    };

    processImage();
  }, [mockData.Image]);

  const formatDate = (dateStr: string) => {
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    return new Date(`${year}-${month}-${day}`).toLocaleDateString();
  };

  return (
    <section id="daily" className="container mx-auto py-12">
      <div className="bg-jumble-background/95 rounded-lg p-8 shadow-xl backdrop-blur-lg border border-jumble-primary/20">
        <div className="flex items-center gap-2 mb-6">
          <Puzzle className="h-8 w-8 text-jumble-primary animate-bounce-slow" />
          <h2 className="text-2xl font-bold text-jumble-text">Daily Puzzle - {formatDate(mockData.Date)}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative group">
            <img 
              src={processedImage || mockData.Image} 
              alt="Daily Jumble Puzzle" 
              className="rounded-lg shadow-2xl w-full transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-jumble-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(mockData.Clues)
                .filter(([key]) => key.startsWith("c"))
                .map(([key, value], index) => (
                  <div key={key} className="relative group transform transition-all duration-300 hover:scale-105">
                    <div className="bg-jumble-background p-6 rounded-xl border-2 border-jumble-primary/30 shadow-lg hover:shadow-jumble-primary/20">
                      <p className="text-2xl font-mono text-jumble-text tracking-wider">{value}</p>
                      {showAnswers && (
                        <div className="mt-4 flex items-center gap-3">
                          <ArrowRight className="h-5 w-5 text-jumble-primary animate-pulse" />
                          <p className="text-jumble-primary font-bold text-xl">
                            {mockData.Clues[`a${index + 1}`]}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            <div className="space-y-6">
              <div className="bg-jumble-primary/10 p-6 rounded-xl border border-jumble-primary/30">
                <p className="text-jumble-text text-lg font-medium">{mockData.Caption.v1}</p>
              </div>
              
              {showSolution && (
                <div className="bg-jumble-primary/20 p-6 rounded-xl border-2 border-jumble-primary/40 transform transition-all duration-300 hover:scale-105">
                  <p className="text-jumble-primary font-bold text-2xl tracking-wide">
                    {mockData.Solution.s1}
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={() => setShowAnswers(!showAnswers)}
                  variant="outline"
                  className="flex-1 bg-jumble-primary/20 text-jumble-text hover:bg-jumble-primary/30 text-lg py-6"
                >
                  {showAnswers ? "Hide Answers" : "Show Answers"}
                </Button>
                <Button
                  onClick={() => setShowSolution(!showSolution)}
                  variant="outline"
                  className="flex-1 bg-jumble-primary/20 text-jumble-text hover:bg-jumble-primary/30 text-lg py-6"
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