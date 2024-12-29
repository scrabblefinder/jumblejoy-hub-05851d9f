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

  const fetchPuzzle = async (selectedDate?: Date) => {
    setFetchingPuzzle(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-daily-jumble', {
        body: { date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined }
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
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
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {fetchingPuzzle ? 'Fetching Puzzle...' : date ? `Fetch Puzzle for ${format(date, 'PPP')}` : 'Fetch Latest Puzzle'}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
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
  );
};

export default AdminPanel;