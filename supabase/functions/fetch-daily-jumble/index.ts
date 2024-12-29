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
    const finalJumble = calculateFinalJumble(data)
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
        final_jumble_answer: cleanSolution
      })
      .select()
      .single()

    if (puzzleError) throw puzzleError

    // Insert jumble words if they exist
    if (data.Clues) {
      const jumbleWords = [
        { jumbled_word: data.Clues.c1?.j || data.Clues.c1, answer: data.Clues.c1?.a || data.Clues.a1 },
        { jumbled_word: data.Clues.c2?.j || data.Clues.c2, answer: data.Clues.c2?.a || data.Clues.a2 },
        { jumbled_word: data.Clues.c3?.j || data.Clues.c3, answer: data.Clues.c3?.a || data.Clues.a3 },
        { jumbled_word: data.Clues.c4?.j || data.Clues.c4, answer: data.Clues.c4?.a || data.Clues.a4 }
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
function calculateFinalJumble(data: any): string {
  if (!data?.Clues) return '';

  try {
    // Check if we have the new format (with circle property)
    if (data.Clues.c1?.circle) {
      console.log('Using new format for final jumble calculation');
      const clues = [
        { answer: data.Clues.c1.a, positions: data.Clues.c1.circle },
        { answer: data.Clues.c2.a, positions: data.Clues.c2.circle },
        { answer: data.Clues.c3.a, positions: data.Clues.c3.circle },
        { answer: data.Clues.c4.a, positions: data.Clues.c4.circle }
      ];

      console.log('Clues for final jumble:', clues);

      const jumbledParts = clues.map(({ answer, positions }) => {
        if (!answer || !positions) return '';
        const pos = positions.split(',').map(Number);
        const letters = pos.map(p => answer[p - 1]).join('');
        console.log(`Extracted letters from ${answer} at positions ${positions}: ${letters}`);
        return letters;
      });

      const result = jumbledParts.join('');
      console.log('Final jumble result:', result);
      return result;
    }

    // Old format (with o1, o2, etc. properties)
    console.log('Using old format for final jumble calculation');
    const words = [
      { answer: data.Clues.a1, positions: data.Clues.o1 },
      { answer: data.Clues.a2, positions: data.Clues.o2 },
      { answer: data.Clues.a3, positions: data.Clues.o3 },
      { answer: data.Clues.a4, positions: data.Clues.o4 }
    ];

    console.log('Words for final jumble:', words);

    const jumbledParts = words.map(({ answer, positions }) => {
      if (!answer || !positions) return '';
      const pos = positions.split(',').map(Number);
      const letters = pos.map(p => answer[p - 1]).join('');
      console.log(`Extracted letters from ${answer} at positions ${positions}: ${letters}`);
      return letters;
    });

    const result = jumbledParts.join('');
    console.log('Final jumble result:', result);
    return result;
  } catch (error) {
    console.error('Error calculating final jumble:', error);
    return '';
  }
}