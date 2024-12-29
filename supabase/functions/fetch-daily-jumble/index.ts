import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { format, addYears } from 'https://esm.sh/date-fns@3.3.1'

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
    // Get today's date and add 1 year (since the URL uses year 24 for 2024)
    const today = addYears(new Date(), 1)
    // Format as 'yyMMdd' for the URL
    const dateStr = format(today, 'yyMMdd')
    
    console.log(`Fetching puzzle for date: ${dateStr}`)
    
    // Fetch the XML data with the dynamic date
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
      console.log(`Puzzle for ${dbDate} already exists`)
      return new Response(
        JSON.stringify({ message: `Puzzle for ${dbDate} already exists` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Inserting new puzzle for ${dbDate}`)

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

    if (puzzleError) {
      console.error('Error inserting puzzle:', puzzleError)
      throw puzzleError
    }

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

    if (wordsError) {
      console.error('Error inserting jumble words:', wordsError)
      throw wordsError
    }

    console.log(`Successfully added puzzle for ${dbDate}`)

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