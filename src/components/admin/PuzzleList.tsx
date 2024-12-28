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

const PuzzleList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: puzzles } = useQuery({
    queryKey: ['admin-puzzles'],
    queryFn: async () => {
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

      if (error) throw error;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Puzzles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {puzzles?.map((puzzle) => (
            <div key={puzzle.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">
                  {new Date(puzzle.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
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
                        Are you sure you want to delete the puzzle for {new Date(puzzle.date).toLocaleDateString()}? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(puzzle.id, puzzle.date)}
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PuzzleList;