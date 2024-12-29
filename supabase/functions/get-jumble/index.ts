import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const { word } = await req.json();
    
    if (!word) {
      return new Response(
        JSON.stringify({ error: 'Word parameter is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    console.log('Searching for word:', word);

    // First try to find it in jumble_words
    let { data: jumbleData, error: jumbleError } = await supabaseClient
      .from('jumble_words')
      .select(`
        jumbled_word,
        answer,
        puzzle_id,
        daily_puzzles (
          date,
          caption,
          solution,
          jumble_words (
            jumbled_word,
            answer
          )
        )
      `)
      .eq('jumbled_word', word.toUpperCase())
      .maybeSingle();

    if (jumbleError) {
      console.error('Database query error:', jumbleError);
      throw jumbleError;
    }

    // If not found in jumble_words, try to find it in daily_puzzles as final_jumble
    if (!jumbleData) {
      console.log('Word not found in jumble_words, checking final_jumble');
      const { data: puzzleData, error: puzzleError } = await supabaseClient
        .from('daily_puzzles')
        .select(`
          date,
          caption,
          solution,
          final_jumble,
          final_jumble_answer,
          jumble_words (
            jumbled_word,
            answer
          )
        `)
        .eq('final_jumble', word.toUpperCase())
        .maybeSingle();

      if (puzzleError) {
        console.error('Database query error:', puzzleError);
        throw puzzleError;
      }

      if (puzzleData) {
        jumbleData = {
          jumbled_word: puzzleData.final_jumble,
          answer: puzzleData.final_jumble_answer,
          daily_puzzles: puzzleData
        };
      }
    }

    if (!jumbleData) {
      console.log('Word not found in either table');
      return new Response(
        JSON.stringify({ error: 'Word not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    console.log('Found word data:', jumbleData);

    // Return the data
    return new Response(
      JSON.stringify(jumbleData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})