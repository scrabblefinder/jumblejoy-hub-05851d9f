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
    
    // Format the date to ensure it's in YYYY-MM-DD format
    const formattedDate = date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1-$2-$3')
    console.log('Formatted date:', formattedDate)
    
    // Use the provided JSON URL or construct one based on the date
    const url = jsonUrl || `https://gamedata.services.amuniversal.com/c/uupuz/l/U2FsdGVkX1+b5Y+X7zaEFHSWJrCGS0ZTfgh8ArjtJXrQId7t4Y1oVKwUDKd4WyEo%0A/g/tmjms/d/${formattedDate}/data.json`
    
    console.log('Fetching puzzle from URL:', url)
    const puzzleData = await fetchPuzzleXML(url)
    console.log('Received puzzle data:', puzzleData)

    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse the JSON data
    const data = JSON.parse(puzzleData)
    console.log('Parsed puzzle data:', data)

    // Clean up the solution by removing { } characters, with null checks
    const rawSolution = data.Solution?.s1 || ''
    const cleanSolution = rawSolution.replace(/[{}]/g, ' ').replace(/\s+/g, ' ').trim()
    console.log('Cleaned solution:', cleanSolution)

    // Calculate final jumble from circled letters
    const finalJumble = calculateFinalJumble(data.Clues)
    console.log('Calculated final jumble:', finalJumble)

    // Insert into daily_puzzles
    const { data: puzzle, error: puzzleError } = await supabaseAdmin
      .from('daily_puzzles')
      .insert({
        date: formattedDate,
        caption: data.Caption?.v1 || '',
        image_url: data.Image || '',
        solution: cleanSolution,
        final_jumble: finalJumble,
        final_jumble_answer: cleanSolution // The solution is the answer to the final jumble
      })
      .select()
      .single()

    if (puzzleError) throw puzzleError

    // Insert jumble words if they exist
    if (data.Clues) {
      const jumbleWords = [
        { jumbled_word: data.Clues.c1, answer: data.Clues.a1 },
        { jumbled_word: data.Clues.c2, answer: data.Clues.a2 },
        { jumbled_word: data.Clues.c3, answer: data.Clues.a3 },
        { jumbled_word: data.Clues.c4, answer: data.Clues.a4 }
      ].filter(word => word.jumbled_word && word.answer)

      if (jumbleWords.length > 0) {
        const { error: wordsError } = await supabaseAdmin
          .from('jumble_words')
          .insert(
            jumbleWords.map(word => ({
              puzzle_id: puzzle.id,
              jumbled_word: word.jumbled_word,
              answer: word.answer
            }))
          )

        if (wordsError) throw wordsError
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: `Failed to fetch or process puzzle: ${error.message}` }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// Helper function to calculate final jumble from circled letters
function calculateFinalJumble(clues: any): string {
  if (!clues) return '';

  try {
    // Extract circled letters from each word based on positions
    const words = [
      { answer: clues.a1, positions: clues.o1 },
      { answer: clues.a2, positions: clues.o2 },
      { answer: clues.a3, positions: clues.o3 },
      { answer: clues.a4, positions: clues.o4 }
    ];

    // Get circled letters from each word
    const jumbledParts = words.map(({ answer, positions }) => {
      if (!answer || !positions) return '';
      const pos = positions.split(',').map(Number);
      return pos.map(p => answer[p - 1]).join('');
    });

    // Combine all parts to create the final jumbled word
    return jumbledParts.join('');
  } catch (error) {
    console.error('Error calculating final jumble:', error);
    return '';
  }
}