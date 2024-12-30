import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

// Function to sanitize text to only allow letters and spaces
function sanitizeAnswer(text: string): string {
  return text.replace(/[^a-zA-Z\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { date } = await req.json()
    
    // Ensure proper date format YYYY-MM-DD
    const formattedDate = date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1-$2-$3')
    console.log('Formatted date:', formattedDate)
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }
    
    // Check if the date is a Sunday or Monday
    const puzzleDate = new Date(formattedDate);
    const dayOfWeek = puzzleDate.getDay();
    const isSundayOrMonday = dayOfWeek === 0 || dayOfWeek === 1;
    console.log('Is Sunday or Monday:', isSundayOrMonday);
    
    // Base URL components
    const basePrefix = 'https://gamedata.services.amuniversal.com/c/uupuz/l/U2FsdGVkX1+b5Y+X7zaEFHSWJrCGS0ZTfgh8ArjtJXrQId7t4Y1oVKwUDKd4WyEo%0A/g';
    const timestamp = Date.now();
    
    // Construct the URL based on the day
    const url = isSundayOrMonday
      ? `${basePrefix}/tmjms/d/${formattedDate}/data.json?callback=jsonCallback&_=${timestamp}`
      : `${basePrefix}/tmjmf/d/${formattedDate}/data.json?callback=jsonCallback&_=${timestamp}`;
    
    console.log('Attempting to fetch from URL:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json, text/javascript, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.uclick.com/',
        'Origin': 'https://www.uclick.com'
      }
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch puzzle data: ${response.status} ${response.statusText}`);
    }

    const puzzleData = await response.text();
    console.log('Raw response:', puzzleData.substring(0, 200));

    // Clean up the response by removing the jsonCallback wrapper
    const cleanData = puzzleData
      .replace(/^\/\*\*\//, '') // Remove leading comments
      .replace(/^jsonCallback\((.*)\);?$/, '$1'); // Remove jsonCallback wrapper
    
    console.log('Cleaned data:', cleanData.substring(0, 200));

    // Parse the cleaned JSON data
    let jsonData;
    try {
      jsonData = JSON.parse(cleanData);
      console.log('Parsed JSON data structure:', Object.keys(jsonData));
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw new Error(`Invalid puzzle data format: ${error.message}`);
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Sanitize the solution
    const rawSolution = jsonData.Solution?.s1 || '';
    const cleanSolution = sanitizeAnswer(rawSolution);
    console.log('Cleaned solution:', cleanSolution);

    // Calculate final jumble from all available clues
    const finalJumble = calculateFinalJumble(jsonData);
    console.log('Calculated final jumble:', finalJumble);

    const { data: puzzle, error: puzzleError } = await supabaseAdmin
      .from('daily_puzzles')
      .insert({
        date: formattedDate,
        caption: sanitizeAnswer(jsonData.Caption?.v1 || ''),
        image_url: jsonData.Image || '',
        solution: cleanSolution,
        final_jumble: finalJumble,
        final_jumble_answer: cleanSolution
      })
      .select()
      .single();

    if (puzzleError) throw puzzleError;

    if (jsonData.Clues) {
      const jumbleWords = [
        { jumbled_word: jsonData.Clues.c1, answer: sanitizeAnswer(jsonData.Clues.a1) },
        { jumbled_word: jsonData.Clues.c2, answer: sanitizeAnswer(jsonData.Clues.a2) },
        { jumbled_word: jsonData.Clues.c3, answer: sanitizeAnswer(jsonData.Clues.a3) },
        { jumbled_word: jsonData.Clues.c4, answer: sanitizeAnswer(jsonData.Clues.a4) },
        { jumbled_word: jsonData.Clues.c5, answer: sanitizeAnswer(jsonData.Clues.a5) },
        { jumbled_word: jsonData.Clues.c6, answer: sanitizeAnswer(jsonData.Clues.a6) }
      ].filter(word => word.jumbled_word && word.answer);

      if (jumbleWords.length > 0) {
        const { error: wordsError } = await supabaseAdmin
          .from('jumble_words')
          .insert(
            jumbleWords.map(word => ({
              puzzle_id: puzzle.id,
              jumbled_word: word.jumbled_word,
              answer: word.answer
            }))
          );

        if (wordsError) throw wordsError;
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: `Failed to fetch or process puzzle: ${error.message}` }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

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