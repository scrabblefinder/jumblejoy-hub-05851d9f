import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface AutomaticPuzzleFormData {
  jsonData: string;
}

const AutomaticPuzzleForm = () => {
  const { register, handleSubmit, reset } = useForm<AutomaticPuzzleFormData>();
  const { toast } = useToast();

  const onSubmit = async (data: AutomaticPuzzleFormData) => {
    try {
      const puzzleData = JSON.parse(data.jsonData);
      
      // First insert the puzzle
      const { data: newPuzzle, error: puzzleError } = await supabase
        .from('daily_puzzles')
        .insert({
          date: puzzleData.date,
          caption: puzzleData.caption,
          image_url: puzzleData.image_url,
          solution: puzzleData.solution
        })
        .select()
        .single();

      if (puzzleError) throw puzzleError;

      // Then insert the jumbled words
      const jumbleWords = puzzleData.jumbled_words.map((word: any) => ({
        puzzle_id: newPuzzle.id,
        jumbled_word: word.jumbled_word,
        answer: word.answer
      }));

      const { error: wordsError } = await supabase
        .from('jumble_words')
        .insert(jumbleWords);

      if (wordsError) throw wordsError;

      toast({
        title: "Success",
        description: "Puzzle added successfully",
      });
      
      reset();
    } catch (error) {
      console.error('Error submitting puzzle:', error);
      toast({
        title: "Error",
        description: error instanceof SyntaxError ? "Invalid JSON format" : "Failed to submit puzzle",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Puzzle via JSON</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Puzzle JSON Data</label>
            <Textarea 
              {...register('jsonData')} 
              required 
              placeholder={`{
  "date": "2024-01-01",
  "caption": "Puzzle caption",
  "image_url": "https://example.com/image.jpg",
  "solution": "SOLUTION",
  "jumbled_words": [
    {"jumbled_word": "WORD1", "answer": "ANSWER1"},
    {"jumbled_word": "WORD2", "answer": "ANSWER2"},
    {"jumbled_word": "WORD3", "answer": "ANSWER3"},
    {"jumbled_word": "WORD4", "answer": "ANSWER4"}
  ]
}`}
              className="h-64 font-mono"
            />
          </div>
          <Button type="submit" className="w-full">Add Puzzle from JSON</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AutomaticPuzzleForm;