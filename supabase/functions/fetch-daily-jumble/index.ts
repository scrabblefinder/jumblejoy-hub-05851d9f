import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'
import { fetchPuzzleXML } from './puzzle-fetcher.ts'

// Function to sanitize text to only allow letters and spaces
function sanitizeAnswer(text: string): string {
  return text.replace(/[^a-zA-Z\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { date, jsonUrl } = await req.json()
    const formattedDate = date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1-$2-$3')
    console.log('Formatted date:', formattedDate)
    
    // Check if the date is a Sunday
    const puzzleDate = new Date(formattedDate);
    const isSunday = puzzleDate.getDay() === 0;
    
    // Use different base URLs based on the day
    const baseUrl = isSunday 
      ? 'https://gamedata.services.amuniversal.com/c/uupuz/l/U2FsdGVkX1+b5Y+X7zaEFHSWJrCGS0ZTfgh8ArjtJXrQId7t4Y1oVKwUDKd4WyEo%0A/g/tmjms/d'
      : 'https://gamedata.services.amuniversal.com/c/uupuz/l/U2FsdGVkX1+b5Y+X7zaEFHSWJrCGS0ZTfgh8ArjtJXrQId7t4Y1oVKwUDKd4WyEo%0A/g/tmjmf/d';
    
    const url = jsonUrl || `${baseUrl}/${formattedDate}/data.json?callback=jsonCallback&_=${Date.now()}`
    
    console.log('Fetching puzzle from URL:', url)
    const puzzleData = await fetchPuzzleXML(url)
    console.log('Received puzzle data:', puzzleData.substring(0, 200) + '...')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const data = JSON.parse(puzzleData)
    console.log('Parsed puzzle data:', data)

    // Sanitize the solution
    const rawSolution = data.Solution?.s1 || ''
    const cleanSolution = sanitizeAnswer(rawSolution)
    console.log('Cleaned solution:', cleanSolution)

    // Calculate final jumble from all available clues
    const finalJumble = calculateFinalJumble(data)
    console.log('Calculated final jumble:', finalJumble)

    const { data: puzzle, error: puzzleError } = await supabaseAdmin
      .from('daily_puzzles')
      .insert({
        date: formattedDate,
        caption: sanitizeAnswer(data.Caption?.v1 || ''),
        image_url: data.Image || '',
        solution: cleanSolution,
        final_jumble: finalJumble,
        final_jumble_answer: cleanSolution
      })
      .select()
      .single()

    if (puzzleError) throw puzzleError

    if (data.Clues) {
      const jumbleWords = [
        { jumbled_word: data.Clues.c1, answer: sanitizeAnswer(data.Clues.a1) },
        { jumbled_word: data.Clues.c2, answer: sanitizeAnswer(data.Clues.a2) },
        { jumbled_word: data.Clues.c3, answer: sanitizeAnswer(data.Clues.a3) },
        { jumbled_word: data.Clues.c4, answer: sanitizeAnswer(data.Clues.a4) },
        { jumbled_word: data.Clues.c5, answer: sanitizeAnswer(data.Clues.a5) },
        { jumbled_word: data.Clues.c6, answer: sanitizeAnswer(data.Clues.a6) }
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

// Helper function to calculate final jumble from all available clues
function calculateFinalJumble(data: any): string {
  if (!data?.Clues) return '';

  try {
    console.log('Calculating final jumble from data:', data.Clues);
    
    // Extract ALL answers and positions (up to 6 clues)
    const answers = [
      { word: data.Clues.a1, positions: data.Clues.o1 },
      { word: data.Clues.a2, positions: data.Clues.o2 },
      { word: data.Clues.a3, positions: data.Clues.o3 },
      { word: data.Clues.a4, positions: data.Clues.o4 },
      { word: data.Clues.a5, positions: data.Clues.o5 },
      { word: data.Clues.a6, positions: data.Clues.o6 }
    ].filter(answer => answer.word && answer.positions);

    console.log('Processing answers:', answers);

    const jumbledParts = answers.map(({ word, positions }) => {
      const pos = positions.split(',').map(p => parseInt(p) - 1);
      const letters = pos.map(p => word[p]).join('');
      console.log(`From word ${word} at positions ${positions} got letters: ${letters}`);
      return letters;
    });

    const finalJumble = jumbledParts.join('');
    console.log('Final jumble calculated:', finalJumble);
    
    return finalJumble;
  } catch (error) {
    console.error('Error calculating final jumble:', error);
    return '';
  }
}