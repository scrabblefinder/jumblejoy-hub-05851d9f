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

interface JumbleCallback {
  Date: string;
  Clues: {
    c1: string;
    c2: string;
    c3: string;
    c4: string;
    a1: string;
    a2: string;
    a3: string;
    a4: string;
  };
  Caption: {
    v1: string;
  };
  Solution: {
    s1: string;
  };
  Image: string;
}

const AutomaticPuzzleForm = () => {
  const { register, handleSubmit, reset } = useForm<AutomaticPuzzleFormData>();
  const { toast } = useToast();

  const parseCallbackFormat = (input: string): JumbleCallback => {
    // Remove the jsonCallback wrapper if present
    const cleanJson = input.replace(/^\/\*\*\/jsonCallback\((.*)\)$/, '$1');
    return JSON.parse(cleanJson);
  };

  const transformToDbFormat = (callback: JumbleCallback) => {
    // Format date from YYYYMMDD to YYYY-MM-DD
    const formattedDate = `${callback.Date.slice(0, 4)}-${callback.Date.slice(4, 6)}-${callback.Date.slice(6, 8)}`;
    
    return {
      date: formattedDate,
      caption: callback.Caption.v1,
      image_url: callback.Image,
      solution: callback.Solution.s1,
      jumbled_words: [
        { jumbled_word: callback.Clues.c1, answer: callback.Clues.a1 },
        { jumbled_word: callback.Clues.c2, answer: callback.Clues.a2 },
        { jumbled_word: callback.Clues.c3, answer: callback.Clues.a3 },
        { jumbled_word: callback.Clues.c4, answer: callback.Clues.a4 }
      ]
    };
  };

  const onSubmit = async (data: AutomaticPuzzleFormData) => {
    try {
      const callbackData = parseCallbackFormat(data.jsonData);
      const puzzleData = transformToDbFormat(callbackData);
      
      // Check if puzzle already exists for this date
      const { data: existingPuzzle } = await supabase
        .from('daily_puzzles')
        .select()
        .eq('date', puzzleData.date)
        .maybeSingle();

      if (existingPuzzle) {
        toast({
          title: "Error",
          description: `A puzzle for ${puzzleData.date} already exists`,
          variant: "destructive"
        });
        return;
      }

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
      const jumbleWords = puzzleData.jumbled_words.map(word => ({
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
              placeholder={`/**/jsonCallback({
  "Date": "20241228",
  "Clues": {
    "c1": "RUGDO", "c2": "PWRIE", "c3": "ACLBTO", "c4": "LYRURF",
    "a1": "GOURD", "a2": "WIPER", "a3": "COBALT", "a4": "FLURRY"
  },
  "Caption": { "v1": "Puzzle caption here" },
  "Solution": { "s1": "SOLUTION" },
  "Image": "https://example.com/image.jpg"
})`}
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