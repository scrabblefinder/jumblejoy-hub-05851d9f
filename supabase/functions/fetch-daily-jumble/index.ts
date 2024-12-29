import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders, extractPuzzleData, fetchPuzzle } from './utils.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const today = new Date();
    console.log('Starting puzzle fetch process...');
    
    try {
      console.log('Attempting to fetch today\'s puzzle...');
      const xmlText = await fetchPuzzle(today);
      const puzzleData = extractPuzzleData(xmlText, today);
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Extract answers and circle positions
      const answers = [
        puzzleData.Clues.a1,
        puzzleData.Clues.a2,
        puzzleData.Clues.a3,
        puzzleData.Clues.a4
      ];
      
      const positions = [
        puzzleData.CircledLetters?.p1 || '',
        puzzleData.CircledLetters?.p2 || '',
        puzzleData.CircledLetters?.p3 || '',
        puzzleData.CircledLetters?.p4 || ''
      ];

      // Generate the final jumble from circled letters
      const finalJumble = extractCircledLetters(answers, positions);
      console.log('Generated final jumble:', finalJumble);

      // Check if puzzle already exists
      const { data: existingPuzzle } = await supabase
        .from('daily_puzzles')
        .select()
        .eq('date', puzzleData.Date)
        .maybeSingle();

      if (existingPuzzle) {
        console.log(`Puzzle for ${puzzleData.Date} already exists`);
        return new Response(
          JSON.stringify({ message: `Puzzle for ${puzzleData.Date} already exists` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert new puzzle with the generated final jumble
      console.log('Inserting new puzzle...');
      const { data: puzzle, error: puzzleError } = await supabase
        .from('daily_puzzles')
        .insert({
          date: puzzleData.Date,
          caption: puzzleData.Caption.v1,
          image_url: puzzleData.Image,
          solution: puzzleData.Solution.s1,
          final_jumble: finalJumble
        })
        .select()
        .single();

      if (puzzleError) throw puzzleError;

      // Insert jumble words
      console.log('Inserting jumble words...');
      const jumbleWords = [
        {
          puzzle_id: puzzle.id,
          jumbled_word: puzzleData.Clues.c1,
          answer: puzzleData.Clues.a1
        },
        {
          puzzle_id: puzzle.id,
          jumbled_word: puzzleData.Clues.c2,
          answer: puzzleData.Clues.a2
        },
        {
          puzzle_id: puzzle.id,
          jumbled_word: puzzleData.Clues.c3,
          answer: puzzleData.Clues.a3
        },
        {
          puzzle_id: puzzle.id,
          jumbled_word: puzzleData.Clues.c4,
          answer: puzzleData.Clues.a4
        }
      ];

      const { error: wordsError } = await supabase
        .from('jumble_words')
        .insert(jumbleWords);

      if (wordsError) throw wordsError;

      console.log('Successfully added puzzle and jumble words');
      return new Response(
        JSON.stringify({ message: 'Puzzle added successfully', puzzle }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (error) {
      console.log('Failed to fetch today\'s puzzle, trying yesterday\'s...');
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const xmlText = await fetchPuzzle(yesterday);
      const puzzleData = extractPuzzleData(xmlText, yesterday);
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Check if puzzle already exists
      const { data: existingPuzzle } = await supabase
        .from('daily_puzzles')
        .select()
        .eq('date', puzzleData.date)
        .maybeSingle();

      if (existingPuzzle) {
        console.log(`Puzzle for ${puzzleData.date} already exists`);
        return new Response(
          JSON.stringify({ message: `Puzzle for ${puzzleData.date} already exists` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert new puzzle
      console.log('Inserting new puzzle...');
      const { data: puzzle, error: puzzleError } = await supabase
        .from('daily_puzzles')
        .insert({
          date: puzzleData.date,
          caption: puzzleData.caption,
          image_url: puzzleData.image_url,
          solution: puzzleData.solution,
          final_jumble: puzzleData.final_jumble
        })
        .select()
        .single();

      if (puzzleError) throw puzzleError;

      // Insert jumble words including the final jumble
      console.log('Inserting jumble words and final jumble...');
      const jumbleWords = [
        ...puzzleData.jumble_words.map(word => ({
          puzzle_id: puzzle.id,
          jumbled_word: word.jumbled_word,
          answer: word.answer
        })),
        // Add final jumble as a jumble word
        {
          puzzle_id: puzzle.id,
          jumbled_word: puzzleData.final_jumble,
          answer: puzzleData.solution
        }
      ];

      const { error: wordsError } = await supabase
        .from('jumble_words')
        .insert(jumbleWords);

      if (wordsError) throw wordsError;

      console.log('Successfully added puzzle, jumble words, and final jumble');
      return new Response(
        JSON.stringify({ message: 'Puzzle added successfully', puzzle }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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