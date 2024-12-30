import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';

const PuzzleList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: puzzles, isLoading, error } = useQuery({
    queryKey: ['admin-puzzles'],
    queryFn: async () => {
      console.log('Fetching puzzles...');
      const { data, error } = await supabase
        .from('daily_puzzles')
        .select(`
          *,
          jumble_words (
            jumbled_word,
            answer
          )
        `)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching puzzles:', error);
        throw error;
      }
      
      console.log('Fetched puzzles:', data);
      return data;
    },
  });

  const handleDelete = async (puzzleId: string, date: string) => {
    try {
      // First delete the jumble words (they reference the puzzle)
      const { error: wordsError } = await supabase
        .from('jumble_words')
        .delete()
        .eq('puzzle_id', puzzleId);

      if (wordsError) throw wordsError;

      // Then delete the puzzle
      const { error: puzzleError } = await supabase
        .from('daily_puzzles')
        .delete()
        .eq('id', puzzleId);

      if (puzzleError) throw puzzleError;

      // Invalidate the query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['admin-puzzles'] });

      toast({
        title: "Success",
        description: `Puzzle for ${date} deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting puzzle:', error);
      toast({
        title: "Error",
        description: "Failed to delete puzzle",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'EEEE, MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Puzzles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Puzzles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">
            Error loading puzzles. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Puzzles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!puzzles || puzzles.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              No puzzles found. Try fetching some puzzles first.
            </div>
          ) : (
            puzzles.map((puzzle) => (
              <div key={puzzle.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">
                    {formatDate(puzzle.date)}
                  </h3>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Puzzle</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the puzzle for {formatDate(puzzle.date)}? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(puzzle.id, formatDate(puzzle.date))}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <p className="text-sm text-gray-600 mb-2">{puzzle.caption}</p>
                <div className="grid grid-cols-2 gap-2">
                  {puzzle.jumble_words?.map((word: any, index: number) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{word.jumbled_word}</span>
                      <span className="text-gray-500 mx-2">→</span>
                      <span className="text-green-600">{word.answer}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-sm font-medium">
                  Solution: <span className="text-blue-600">{puzzle.solution}</span>
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PuzzleList;