import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Download } from 'lucide-react';
import { cn } from "@/lib/utils";
import PuzzleForm from '@/components/admin/PuzzleForm';
import AutomaticPuzzleForm from '@/components/admin/AutomaticPuzzleForm';
import PuzzleList from '@/components/admin/PuzzleList';

const AdminPanel = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [fetchingPuzzle, setFetchingPuzzle] = useState(false);
  const [date, setDate] = useState<Date>();
  const [jsonUrl, setJsonUrl] = useState<string>('');

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

  // Update JSON URL when date changes
  useEffect(() => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const timestamp = Date.now();
      setJsonUrl(`https://gamedata.services.amuniversal.com/c/uupuz/l/U2FsdGVkX1+b5Y+X7zaEFHSWJrCGS0ZTfgh8ArjtJXrQId7t4Y1oVKwUDKd4WyEo%0A/g/tmjms/d/${formattedDate}/data.json?callback=jsonCallback&_=${timestamp}`);
    } else {
      setJsonUrl('');
    }
  }, [date]);

  const fetchPuzzle = async (selectedDate?: Date) => {
    setFetchingPuzzle(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-daily-jumble', {
        body: { 
          date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
          jsonUrl: jsonUrl
        }
      });
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Puzzle fetched and saved successfully",
      });

      // Refresh the puzzle list by reloading the page
      window.location.reload();
    } catch (error) {
      console.error('Error fetching puzzle:', error);
      toast({
        title: "Error",
        description: "Failed to fetch puzzle",
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-full sm:w-[240px]",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button 
            onClick={() => fetchPuzzle(date)}
            disabled={fetchingPuzzle}
            className="flex items-center gap-2 bg-[#0275d8] hover:bg-[#025aa5]"
          >
            <Download className="h-4 w-4" />
            {fetchingPuzzle ? 'Fetching Puzzle...' : date ? `Fetch Puzzle for ${format(date, 'PPP')}` : 'Fetch Latest Puzzle'}
          </Button>
        </div>

        {jsonUrl && (
          <div className="mb-8 p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-600">JSON URL:</p>
            <code className="block mt-1 p-2 bg-gray-50 rounded text-sm break-all">
              {jsonUrl}
            </code>
          </div>
        )}

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