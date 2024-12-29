import { DailyPuzzle } from '@/integrations/supabase/types';

interface ClueContentProps {
  puzzle: DailyPuzzle;
}

const countLetters = (word: string) => {
  return word.replace(/\s/g, '').length;
};

const ClueContent = ({ puzzle }: ClueContentProps) => {
  return (
    <div className="w-3/4">
      {/* Clue Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Clue:</h2>
          <span className="text-sm text-gray-500">
            Last seen: {new Date(puzzle.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
        <p className="text-xl text-[#0275d8] font-bold mb-4">{puzzle.caption}</p>
      </div>

      {/* Solution Section */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-blue-800">Solution:</h2>
          <span className="text-sm text-blue-600 bg-white px-3 py-1 rounded-full">
            {countLetters(puzzle.solution)} letters
          </span>
        </div>
        <p className="text-2xl font-bold text-green-600">{puzzle.solution}</p>
      </div>
    </div>
  );
};

export default ClueContent;