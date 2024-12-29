import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { format } from 'https://esm.sh/date-fns@3.3.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JumbleData {
  date: { v: string };
  clues: {
    c1: string;
    c2: string;
    c3: string;
    c4: string;
    a1: string;
    a2: string;
    a3: string;
    a4: string;
  };
  caption: { v1: { t: string } };
  solution: { s1: { a: string } };
  image: { src: string };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get today's date in the format YYMMDD
    const today = new Date()
    const dateStr = format(today, 'yyMMdd')
    
    // Fetch the XML data
    const response = await fetch(`http://msn.assets.uclick.com/tmjmf${dateStr}-data.xml`)
    if (!response.ok) {
      throw new Error(`Failed to fetch puzzle data: ${response.statusText}`)
    }
    
    const text = await response.text()
    // Remove the jsonCallback wrapper and parse the JSON
    const jsonData: JumbleData = JSON.parse(text.replace(/\/\*\*\/jsonCallback\((.*)\)/, '$1'))

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Format the date for database storage (YYYY-MM-DD)
    const dbDate = format(today, 'yyyy-MM-dd')

    // Check if puzzle already exists for this date
    const { data: existingPuzzle } = await supabase
      .from('daily_puzzles')
      .select()
      .eq('date', dbDate)
      .maybeSingle()

    if (existingPuzzle) {
      return new Response(
        JSON.stringify({ message: `Puzzle for ${dbDate} already exists` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert the puzzle
    const { data: puzzle, error: puzzleError } = await supabase
      .from('daily_puzzles')
      .insert({
        date: dbDate,
        caption: jsonData.caption.v1.t,
        image_url: jsonData.image.src,
        solution: jsonData.solution.s1.a,
      })
      .select()
      .single()

    if (puzzleError) throw puzzleError

    // Insert the jumble words
    const jumbleWords = [
      { puzzle_id: puzzle.id, jumbled_word: jsonData.clues.c1, answer: jsonData.clues.a1 },
      { puzzle_id: puzzle.id, jumbled_word: jsonData.clues.c2, answer: jsonData.clues.a2 },
      { puzzle_id: puzzle.id, jumbled_word: jsonData.clues.c3, answer: jsonData.clues.a3 },
      { puzzle_id: puzzle.id, jumbled_word: jsonData.clues.c4, answer: jsonData.clues.a4 },
    ]

    const { error: wordsError } = await supabase
      .from('jumble_words')
      .insert(jumbleWords)

    if (wordsError) throw wordsError

    return new Response(
      JSON.stringify({ message: 'Puzzle added successfully', puzzle }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})