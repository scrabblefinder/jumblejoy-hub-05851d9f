import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'
import { fetchPuzzleXML } from './puzzle-fetcher.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { date, jsonUrl } = await req.json()
    
    // Use the provided JSON URL or construct one based on the date
    const url = jsonUrl || `https://www.uclick.com/puzzles/tmjmf/${date.replace(/-/g, '')}-data.json`
    
    const puzzleData = await fetchPuzzleXML(url)

    // Process the puzzle data and save to database
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Example processing logic (this should be replaced with actual logic)
    const { data: puzzle, error: puzzleError } = await supabase
      .from('daily_puzzles')
      .insert({
        date,
        caption: 'Puzzle Caption', // Replace with actual caption
        image_url: 'https://example.com/image.png', // Replace with actual image URL
        solution: 'Puzzle Solution', // Replace with actual solution
      })
      .select()
      .single()

    if (puzzleError) throw puzzleError

    // Assuming puzzleData contains jumble words
    const jumbleWords = puzzleData.jumble_words.map(word => ({
      puzzle_id: puzzle.id,
      jumbled_word: word.jumbled_word,
      answer: word.answer
    }))

    const { error: wordsError } = await supabase
      .from('jumble_words')
      .insert(jumbleWords)

    if (wordsError) throw wordsError

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
