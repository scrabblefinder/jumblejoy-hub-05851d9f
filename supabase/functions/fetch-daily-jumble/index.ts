import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  date?: string;
  jsonUrl: string;
  puzzleType: 'daily' | 'sunday';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { date, jsonUrl, puzzleType } = await req.json() as RequestBody;
    console.log('Received request:', { date, puzzleType, jsonUrl });

    // Validate and format the date
    let formattedDate = date;
    if (!formattedDate) {
      const today = new Date();
      formattedDate = today.toISOString().split('T')[0];
    }
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }

    console.log('Fetching puzzle from URL:', jsonUrl);
    
    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch puzzle: ${response.statusText}`);
    }

    const text = await response.text();
    console.log('Raw response:', text);

    // Remove the jsonCallback wrapper
    const jsonStr = text.replace(/^\/\*\*\/jsonCallback\((.*)\)$/, '$1');
    console.log('Cleaned JSON:', jsonStr);

    let puzzleData;
    try {
      puzzleData = JSON.parse(jsonStr);
    } catch (error) {
      throw new Error(`Invalid puzzle data format: ${error.message}`);
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if puzzle already exists for this date
    const { data: existingPuzzle } = await supabaseClient
      .from('daily_puzzles')
      .select('id')
      .eq('date', formattedDate)
      .single();

    // Extract final jumble data
    const finalJumble = puzzleData.FinalJumble?.j || null;
    const finalJumbleAnswer = puzzleData.FinalJumble?.a || null;

    let puzzleRecord;
    if (existingPuzzle) {
      // Update existing puzzle
      console.log('Updating existing puzzle for date:', formattedDate);
      const { data: updatedPuzzle, error: updateError } = await supabaseClient
        .from('daily_puzzles')
        .update({
          caption: puzzleData.Caption?.v1?.t || '',
          image_url: puzzleData.Image || '',
          solution: puzzleData.Solution?.s1?.a || '',
          final_jumble: finalJumble,
          final_jumble_answer: finalJumbleAnswer
        })
        .eq('id', existingPuzzle.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating puzzle:', updateError);
        throw updateError;
      }
      puzzleRecord = updatedPuzzle;
    } else {
      // Insert new puzzle
      console.log('Inserting new puzzle for date:', formattedDate);
      const { data: newPuzzle, error: insertError } = await supabaseClient
        .from('daily_puzzles')
        .insert({
          date: formattedDate,
          caption: puzzleData.Caption?.v1?.t || '',
          image_url: puzzleData.Image || '',
          solution: puzzleData.Solution?.s1?.a || '',
          final_jumble: finalJumble,
          final_jumble_answer: finalJumbleAnswer
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting puzzle:', insertError);
        throw insertError;
      }
      puzzleRecord = newPuzzle;
    }

    console.log('Puzzle record:', puzzleRecord);

    // Delete existing jumble words for this puzzle
    if (puzzleRecord.id) {
      const { error: deleteError } = await supabaseClient
        .from('jumble_words')
        .delete()
        .eq('puzzle_id', puzzleRecord.id);

      if (deleteError) {
        console.error('Error deleting existing jumble words:', deleteError);
        throw deleteError;
      }
    }

    // Then insert the new jumbled words
    const jumbleWords = [];
    if (puzzleData.Clues) {
      const clues = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
      for (const clue of clues) {
        if (puzzleData.Clues[clue]) {
          jumbleWords.push({
            puzzle_id: puzzleRecord.id,
            jumbled_word: puzzleData.Clues[clue].j || '',
            answer: puzzleData.Clues[clue].a || ''
          });
        }
      }
    }

    if (jumbleWords.length > 0) {
      const { error: wordsError } = await supabaseClient
        .from('jumble_words')
        .insert(jumbleWords);

      if (wordsError) {
        console.error('Error inserting jumble words:', wordsError);
        throw wordsError;
      }

      console.log('Inserted jumble words:', jumbleWords);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Puzzle saved successfully',
        puzzle: puzzleRecord,
        jumbleWords 
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: `Failed to fetch or process puzzle: ${error.message}` }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})