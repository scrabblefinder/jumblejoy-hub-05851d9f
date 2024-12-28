import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface PuzzleFormData {
  date: string;
  caption: string;
  imageUrl: string;
  solution: string;
  jumbledWords: {
    word: string;
    answer: string;
  }[];
}

const PuzzleForm = () => {
  const { register, handleSubmit, reset } = useForm<PuzzleFormData>({
    defaultValues: {
      jumbledWords: Array(4).fill({ word: '', answer: '' })
    }
  });
  const { toast } = useToast();

  const onSubmit = async (data: PuzzleFormData) => {
    try {
      // First insert the puzzle
      const { data: puzzleData, error: puzzleError } = await supabase
        .from('daily_puzzles')
        .insert({
          date: data.date,
          caption: data.caption,
          image_url: data.imageUrl,
          solution: data.solution
        })
        .select()
        .single();

      if (puzzleError) throw puzzleError;

      // Then insert the jumbled words
      const jumbleWords = data.jumbledWords.map(word => ({
        puzzle_id: puzzleData.id,
        jumbled_word: word.word,
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
        description: "Failed to submit puzzle",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Daily Jumble</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <Input type="date" {...register('date')} required />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Caption</label>
            <Input {...register('caption')} required placeholder="Enter puzzle caption" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <Input {...register('imageUrl')} required placeholder="Enter puzzle image URL" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Final Solution</label>
            <Input {...register('solution')} required placeholder="Enter final solution" />
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Jumbled Words</h3>
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    {...register(`jumbledWords.${index}.word`)}
                    placeholder={`Jumbled Word ${index + 1}`}
                    required
                  />
                </div>
                <div>
                  <Input
                    {...register(`jumbledWords.${index}.answer`)}
                    placeholder={`Answer ${index + 1}`}
                    required
                  />
                </div>
              </div>
            ))}
          </div>
          
          <Button type="submit" className="w-full">Add Puzzle</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PuzzleForm;