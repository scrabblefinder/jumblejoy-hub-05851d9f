import Header from "@/components/Header";
import DailyPuzzle from "@/components/DailyPuzzle";
import HowToPlay from "@/components/HowToPlay";

const Index = () => {
  return (
    <div className="min-h-screen bg-jumble-background">
      <Header />
      <main className="py-8">
        <DailyPuzzle />
        <HowToPlay />
      </main>
    </div>
  );
};

export default Index;