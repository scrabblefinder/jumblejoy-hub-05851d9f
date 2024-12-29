import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { format } from 'https://esm.sh/date-fns@3.3.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const today = new Date();
    const dateStr = format(today, 'yyMMdd');
    console.log(`Fetching puzzle for date: ${dateStr}`);
    
    const url = `https://www.uclick.com/puzzles/tmjmf/tmjmf${dateStr}-data.xml`;
    console.log(`Trying URL: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/xml, text/xml, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch puzzle data: ${response.statusText}`);
    }

    const xmlText = await response.text();
    console.log('Received XML:', xmlText);

    // Extract data from XML using regex (simpler approach)
    const getTagContent = (xml: string, tag: string) => {
      const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'gs');
      const match = regex.exec(xml);
      return match ? match[1].trim() : '';
    };

    const clues = xmlText.match(/<clue[^>]*>[\s\S]*?<\/clue>/g) || [];
    const jumbledWords = clues.map(clue => getTagContent(clue, 'j'));
    const answers = clues.map(clue => getTagContent(clue, 'a'));

    const caption = getTagContent(xmlText.match(/<caption>[\s\S]*?<\/caption>/)?.[0] || '', 't');
    const solution = getTagContent(xmlText.match(/<solution>[\s\S]*?<\/solution>/)?.[0] || '', 'a');
    const imageUrl = getTagContent(xmlText, 'image');

    // Format data to match manual posting structure
    const puzzleData = {
      Date: format(today, 'yyyyMMdd'),
      Clues: {
        c1: jumbledWords[0] || '',
        c2: jumbledWords[1] || '',
        c3: jumbledWords[2] || '',
        c4: jumbledWords[3] || '',
        a1: answers[0] || '',
        a2: answers[1] || '',
        a3: answers[2] || '',
        a4: answers[3] || '',
      },
      Caption: { v1: caption },
      Solution: { s1: solution },
      Image: imageUrl,
    };

    console.log('Parsed puzzle data:', puzzleData);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const dbDate = format(today, 'yyyy-MM-dd');

    // Check if puzzle already exists
    const { data: existingPuzzle } = await supabase
      .from('daily_puzzles')
      .select()
      .eq('date', dbDate)
      .maybeSingle();

    if (existingPuzzle) {
      console.log(`Puzzle for ${dbDate} already exists`);
      return new Response(
        JSON.stringify({ message: `Puzzle for ${dbDate} already exists` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert new puzzle
    const { data: puzzle, error: puzzleError } = await supabase
      .from('daily_puzzles')
      .insert({
        date: dbDate,
        caption: puzzleData.Caption.v1,
        image_url: puzzleData.Image,
        solution: puzzleData.Solution.s1,
      })
      .select()
      .single();

    if (puzzleError) throw puzzleError;

    // Insert jumble words
    const jumbleWords = [
      { puzzle_id: puzzle.id, jumbled_word: puzzleData.Clues.c1, answer: puzzleData.Clues.a1 },
      { puzzle_id: puzzle.id, jumbled_word: puzzleData.Clues.c2, answer: puzzleData.Clues.a2 },
      { puzzle_id: puzzle.id, jumbled_word: puzzleData.Clues.c3, answer: puzzleData.Clues.a3 },
      { puzzle_id: puzzle.id, jumbled_word: puzzleData.Clues.c4, answer: puzzleData.Clues.a4 },
    ];

    const { error: wordsError } = await supabase
      .from('jumble_words')
      .insert(jumbleWords);

    if (wordsError) throw wordsError;

    console.log(`Successfully added puzzle for ${dbDate}`);

    return new Response(
      JSON.stringify({ message: 'Puzzle added successfully', puzzle }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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