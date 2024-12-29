import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { format } from 'https://esm.sh/date-fns@3.3.1';
import { parseJumbleXML } from './puzzle-parser.ts';
import { fetchPuzzleXML } from './puzzle-fetcher.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const today = new Date();
    const dateStr = format(today, 'yyMMdd');
    console.log(`Fetching puzzle for date: ${dateStr}`);
    
    const url = `https://www.uclick.com/puzzles/tmjmf/tmjmf${dateStr}-data.xml`;
    console.log(`Trying URL: ${url}`);
    
    const xmlText = await fetchPuzzleXML(url);
    console.log('Received XML:', xmlText);

    const jsonData = parseJumbleXML(xmlText);
    console.log('Parsed data:', jsonData);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const dbDate = format(today, 'yyyy-MM-dd');

    const { data: existingPuzzle } = await supabase
      .from('daily_puzzles')
      .select()
      .eq('date', dbDate)
      .maybeSingle();

    if (existingPuzzle) {
      console.log(`Puzzle for ${dbDate} already exists`);
      return new Response(
        JSON.stringify({ message: `Puzzle for ${dbDate} already exists` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Inserting new puzzle for ${dbDate}`);

    const { data: puzzle, error: puzzleError } = await supabase
      .from('daily_puzzles')
      .insert({
        date: dbDate,
        caption: jsonData.Caption.v1,
        image_url: jsonData.Image,
        solution: jsonData.Solution.s1,
      })
      .select()
      .single();

    if (puzzleError) {
      console.error('Error inserting puzzle:', puzzleError);
      throw puzzleError;
    }

    const jumbleWords = [
      { puzzle_id: puzzle.id, jumbled_word: jsonData.Clues.c1, answer: jsonData.Clues.a1 },
      { puzzle_id: puzzle.id, jumbled_word: jsonData.Clues.c2, answer: jsonData.Clues.a2 },
      { puzzle_id: puzzle.id, jumbled_word: jsonData.Clues.c3, answer: jsonData.Clues.a3 },
      { puzzle_id: puzzle.id, jumbled_word: jsonData.Clues.c4, answer: jsonData.Clues.a4 },
    ];

    const { error: wordsError } = await supabase
      .from('jumble_words')
      .insert(jumbleWords);

    if (wordsError) {
      console.error('Error inserting jumble words:', wordsError);
      throw wordsError;
    }

    console.log(`Successfully added puzzle for ${dbDate}`);

    return new Response(
      JSON.stringify({ message: 'Puzzle added successfully', puzzle }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});