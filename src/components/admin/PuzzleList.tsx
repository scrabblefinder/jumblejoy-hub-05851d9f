import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';

const PuzzleList = () => {
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