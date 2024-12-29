import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { supabase } from '@/integrations/supabase/client';

const CalendarSection = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [puzzleDates, setPuzzleDates] = useState<string[]>([]);

  useEffect(() => {
    const fetchPuzzleDates = async () => {
      const { data } = await supabase
        .from('daily_puzzles')
        .select('date')
        .order('date', { ascending: true });
      
      if (data) {
        setPuzzleDates(data.map(puzzle => puzzle.date));
      }
    };

    fetchPuzzleDates();
  }, []);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      const month = format(selectedDate, 'MMMM').toLowerCase();
      const day = format(selectedDate, 'dd');
      const year = format(selectedDate, 'yyyy');
      navigate(`/daily-jumble-${month}-${day}-${year}-answers`);
    }
  };

  // Custom day content renderer
  const DayContent = (day: Date) => {
    const dateString = format(day, 'yyyy-MM-dd');
    const hasPuzzle = puzzleDates.includes(dateString);

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        {hasPuzzle ? (
          <div className="bg-[#2f75d9] w-7 h-7 rounded-sm flex items-center justify-center">
            <span className="text-white">{day.getDate()}</span>
          </div>
        ) : (
          <span>{day.getDate()}</span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="bg-gray-100 p-4">
        <h2 className="text-xl font-bold text-gray-800">Jumble Archive</h2>
      </div>
      <div className="p-4 flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          className="rounded-md border w-fit"
          components={{
            DayContent: ({ date }) => DayContent(date),
          }}
        />
      </div>
    </div>
  );
};

export default CalendarSection;