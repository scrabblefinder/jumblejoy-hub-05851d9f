import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PuzzleForm from '@/components/admin/PuzzleForm';
import AutomaticPuzzleForm from '@/components/admin/AutomaticPuzzleForm';
import PuzzleList from '@/components/admin/PuzzleList';

const AdminPanel = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [fetchingPuzzle, setFetchingPuzzle] = useState(false);

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

  const fetchTodaysPuzzle = async () => {
    setFetchingPuzzle(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-daily-jumble');
      
      if (error) throw error;

      toast({
        title: "Success",
        description: data.message,
      });

      // Refresh the puzzle list
      window.location.reload();
    } catch (error) {
      console.error('Error fetching puzzle:', error);
      toast({
        title: "Error",
        description: "Failed to fetch today's puzzle",
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
      
      <div className="mb-8">
        <Button 
          onClick={fetchTodaysPuzzle} 
          disabled={fetchingPuzzle}
          className="w-full md:w-auto"
        >
          {fetchingPuzzle ? 'Fetching...' : 'Fetch Today\'s Puzzle'}
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