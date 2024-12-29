import { useNavigate } from 'react-router-dom';
import { List } from 'lucide-react';
import { DailyPuzzle } from '@/integrations/supabase/types';

interface RelatedCluesProps {
  relatedPuzzles: DailyPuzzle[];
  currentDate: Date;
}

const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
};

const RelatedClues = ({ relatedPuzzles, currentDate }: RelatedCluesProps) => {
  const navigate = useNavigate();

  if (!relatedPuzzles || relatedPuzzles.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <List className="text-[#0275d8]" />
        <h2 className="text-xl font-semibold text-gray-800">
          More Clues from {currentDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </h2>
      </div>
      <ul className="space-y-3">
        {relatedPuzzles.map((relatedPuzzle) => (
          <li key={relatedPuzzle.id} className="flex items-start">
            <span className="text-[#0275d8] mr-2 mt-1.5">•</span>
            <button
              onClick={() => navigate(`/clue/${createSlug(relatedPuzzle.caption)}`)}
              className="flex-1 text-left bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <p className="text-[#0275d8] font-semibold">{relatedPuzzle.caption}</p>
              <p className="text-green-600 text-sm mt-1">{relatedPuzzle.solution}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RelatedClues;