import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Download } from "lucide-react";

interface FetchButtonsProps {
  date: Date | undefined;
  fetchingPuzzle: boolean;
  onFetch: (type: 'daily' | 'sunday') => void;
}

const FetchButtons = ({ date, fetchingPuzzle, onFetch }: FetchButtonsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button 
        onClick={() => onFetch('daily')}
        disabled={fetchingPuzzle}
        className="flex items-center gap-2 bg-[#0275d8] hover:bg-[#025aa5]"
      >
        <Download className="h-4 w-4" />
        {fetchingPuzzle ? 'Fetching Puzzle...' : date ? `Fetch Daily Jumble for ${format(date, 'PPP')}` : 'Fetch Latest Daily Jumble'}
      </Button>

      <Button 
        onClick={() => onFetch('sunday')}
        disabled={fetchingPuzzle}
        className="flex items-center gap-2 bg-[#0275d8] hover:bg-[#025aa5]"
      >
        <Download className="h-4 w-4" />
        {fetchingPuzzle ? 'Fetching Puzzle...' : date ? `Fetch Sunday Jumble for ${format(date, 'PPP')}` : 'Fetch Latest Sunday Jumble'}
      </Button>
    </div>
  );
};

export default FetchButtons;