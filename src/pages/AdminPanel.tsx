import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import PuzzleForm from '@/components/admin/PuzzleForm';
import AutomaticPuzzleForm from '@/components/admin/AutomaticPuzzleForm';
import PuzzleList from '@/components/admin/PuzzleList';
import DatePicker from '@/components/admin/DatePicker';
import FetchButtons from '@/components/admin/FetchButtons';
import PuzzleUrlPreview from '@/components/admin/PuzzleUrlPreview';
import { useQueryClient } from '@tanstack/react-query';

const AdminPanel = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [fetchingPuzzle, setFetchingPuzzle] = useState(false);
  const [date, setDate] = useState<Date>();
  const [dailyJumbleUrl, setDailyJumbleUrl] = useState<string>('');
  const [sundayJumbleUrl, setSundayJumbleUrl] = useState<string>('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Error",
            description: "You must be logged in to access the admin panel",
            variant: "destructive"
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error checking session:', error);
        toast({
          title: "Error",
          description: "Failed to check authentication status",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    checkSession();
  }, [toast]);

  // Update URLs when date changes
  useEffect(() => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const timestamp = Date.now();
      const baseUrl = 'https://gamedata.services.amuniversal.com/c/uupuz/l/U2FsdGVkX1+b5Y+X7zaEFHSWJrCGS0ZTfgh8ArjtJXrQId7t4Y1oVKwUDKd4WyEo%0A/g';
      
      // Check if it's a Sunday
      const isSunday = date.getDay() === 0;
      
      // Daily Jumble URL (use tmjmf for non-Sunday puzzles)
      setDailyJumbleUrl(`${baseUrl}/${isSunday ? 'tmjms' : 'tmjmf'}/d/${formattedDate}/data.json?callback=jsonCallback&_=${timestamp}`);
      
      // Sunday Jumble URL (always uses tmjms)
      setSundayJumbleUrl(`${baseUrl}/tmjms/d/${formattedDate}/data.json?callback=jsonCallback&_=${timestamp}`);
    } else {
      setDailyJumbleUrl('');
      setSundayJumbleUrl('');
    }
  }, [date]);

  const fetchPuzzle = async (type: 'daily' | 'sunday') => {
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date first",
        variant: "destructive"
      });
      return;
    }

    setFetchingPuzzle(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-daily-jumble', {
        body: { 
          date: date ? format(date, 'yyyy-MM-dd') : undefined,
          jsonUrl: type === 'daily' ? dailyJumbleUrl : sundayJumbleUrl,
          puzzleType: type
        }
      });
      
      if (error) throw error;

      // Invalidate the puzzles query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ['admin-puzzles'] });

      toast({
        title: "Success",
        description: "Puzzle fetched and saved successfully",
      });
    } catch (error) {
      console.error('Error fetching puzzle:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch puzzle",
        variant: "destructive"
      });
    } finally {
      setFetchingPuzzle(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0275d8]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage daily jumble puzzles</p>
        </div>
        
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <DatePicker date={date} setDate={setDate} />
          <FetchButtons 
            date={date}
            fetchingPuzzle={fetchingPuzzle}
            onFetch={fetchPuzzle}
          />
        </div>

        <PuzzleUrlPreview 
          date={date}
          dailyJumbleUrl={dailyJumbleUrl}
          sundayJumbleUrl={sundayJumbleUrl}
        />

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="automatic">JSON Entry</TabsTrigger>
              </TabsList>
              <TabsContent value="manual">
                <PuzzleForm />
              </TabsContent>
              <TabsContent value="automatic">
                <AutomaticPuzzleForm />
              </TabsContent>
            </Tabs>
          </div>
          <div>
            <PuzzleList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;