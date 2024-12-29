import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { format } from 'https://esm.sh/date-fns@3.3.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JumbleData {
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get today's date and format it as YYMMDD
    const today = new Date()
    const dateStr = format(today, 'yyMMdd')
    
    console.log(`Fetching puzzle for date: ${dateStr}`)
    
    // Use the correct URL format
    const url = `http://msn.assets.uclick.com/tmjmf${dateStr}-data.xml`
    console.log(`Trying URL: ${url}`)
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch puzzle data: ${response.statusText}`)
    }
    
    const xmlText = await response.text()
    console.log('Received XML:', xmlText)

    // Parse XML to extract needed data
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

    // Extract data from XML
    const jsonData = {
      Date: dateStr,
      Clues: {
        c1: xmlDoc.querySelector('c1 j')?.textContent || '',
        c2: xmlDoc.querySelector('c2 j')?.textContent || '',
        c3: xmlDoc.querySelector('c3 j')?.textContent || '',
        c4: xmlDoc.querySelector('c4 j')?.textContent || '',
        a1: xmlDoc.querySelector('c1 a')?.textContent || '',
        a2: xmlDoc.querySelector('c2 a')?.textContent || '',
        a3: xmlDoc.querySelector('c3 a')?.textContent || '',
        a4: xmlDoc.querySelector('c4 a')?.textContent || '',
      },
      Caption: {
        v1: xmlDoc.querySelector('caption v1 t')?.textContent || '',
      },
      Solution: {
        s1: xmlDoc.querySelector('solution s1 a')?.textContent || '',
      },
      Image: xmlDoc.querySelector('image')?.textContent || '',
    }

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
        caption: jsonData.Caption.v1,
        image_url: jsonData.Image,
        solution: jsonData.Solution.s1,
      })
      .select()
      .single()

    if (puzzleError) {
      console.error('Error inserting puzzle:', puzzleError)
      throw puzzleError
    }

    // Insert the jumble words
    const jumbleWords = [
      { puzzle_id: puzzle.id, jumbled_word: jsonData.Clues.c1, answer: jsonData.Clues.a1 },
      { puzzle_id: puzzle.id, jumbled_word: jsonData.Clues.c2, answer: jsonData.Clues.a2 },
      { puzzle_id: puzzle.id, jumbled_word: jsonData.Clues.c3, answer: jsonData.Clues.a3 },
      { puzzle_id: puzzle.id, jumbled_word: jsonData.Clues.c4, answer: jsonData.Clues.a4 },
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