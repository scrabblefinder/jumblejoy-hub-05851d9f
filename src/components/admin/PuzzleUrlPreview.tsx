import { format } from "date-fns";

interface PuzzleUrlPreviewProps {
  date: Date | undefined;
  dailyJumbleUrl: string;
  sundayJumbleUrl: string;
}

const PuzzleUrlPreview = ({ date, dailyJumbleUrl, sundayJumbleUrl }: PuzzleUrlPreviewProps) => {
  if (!dailyJumbleUrl && !sundayJumbleUrl) return null;

  return (
    <div className="mb-8 p-4 bg-white rounded-lg shadow">
      <div className="space-y-4">
        {dailyJumbleUrl && (
          <div>
            <p className="text-sm text-gray-600">Daily Jumble URL:</p>
            <code className="block mt-1 p-2 bg-gray-50 rounded text-sm break-all">
              {dailyJumbleUrl}
            </code>
          </div>
        )}
        {sundayJumbleUrl && (
          <div>
            <p className="text-sm text-gray-600">Sunday Jumble URL:</p>
            <code className="block mt-1 p-2 bg-gray-50 rounded text-sm break-all">
              {sundayJumbleUrl}
            </code>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzleUrlPreview;