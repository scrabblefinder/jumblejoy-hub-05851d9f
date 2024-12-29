import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const CalendarSection = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      const month = format(selectedDate, 'MMMM').toLowerCase();
      const day = format(selectedDate, 'dd');
      const year = format(selectedDate, 'yyyy');
      navigate(`/daily-jumble-${month}-${day}-${year}-answers`);
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="bg-gray-100 p-4">
        <h2 className="text-xl font-bold text-gray-800">Select Date</h2>
      </div>
      <div className="p-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          className="rounded-md border"
        />
      </div>
    </div>
  );
};

export default CalendarSection;