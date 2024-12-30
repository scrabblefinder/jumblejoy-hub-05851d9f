import { Link } from 'react-router-dom';
import { DailyPuzzle } from '@/integrations/supabase/types';

const RelatedClues = ({ clues }: { clues: DailyPuzzle[] }) => {
  return (
    <div className="related-clues">
      <h2 className="text-xl font-semibold">Related Clues</h2>
      <ul>
        {clues.map((clue) => (
          <li key={clue.id}>
            <Link to={`/clue/${clue.caption}`} className="text-blue-500 hover:underline">
              {clue.caption}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RelatedClues;
