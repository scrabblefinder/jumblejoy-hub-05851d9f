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

function extractValue(xml: string, tag: string, index: number = 0): string {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'gs');
  const matches = [...xml.matchAll(regex)];
  return matches[index] ? matches[index][1].trim() : '';
}

function parseJumbleXML(xmlText: string): JumbleData {
  console.log('Parsing XML:', xmlText);
  
  // Extract clues - we need to get both jumbled words and answers
  const clues = xmlText.match(/<clue[^>]*>[\s\S]*?<\/clue>/g) || [];
  console.log('Found clues:', clues);
  
  const jumbledWords = clues.map(clue => extractValue(clue, 'j'));
  const answers = clues.map(clue => extractValue(clue, 'a'));
  
  console.log('Extracted jumbled words:', jumbledWords);
  console.log('Extracted answers:', answers);

  // Extract caption from v1 tag inside caption
  const captionMatch = xmlText.match(/<caption>[\s\S]*?<v1>[\s\S]*?<t>(.*?)<\/t>[\s\S]*?<\/v1>[\s\S]*?<\/caption>/);
  const caption = captionMatch ? captionMatch[1].trim() : '';
  console.log('Extracted caption:', caption);

  // Extract solution from s1 tag inside solution
  const solutionMatch = xmlText.match(/<solution>[\s\S]*?<s1[^>]*>[\s\S]*?<a>(.*?)<\/a>[\s\S]*?<\/s1>[\s\S]*?<\/solution>/);
  const solution = solutionMatch ? solutionMatch[1].trim() : '';
  console.log('Extracted solution:', solution);

  // Extract image URL
  const imageMatch = xmlText.match(/<image>(.*?)<\/image>/);
  const imageUrl = imageMatch ? imageMatch[1].trim() : '';
  console.log('Extracted image URL:', imageUrl);

  return {
    Date: format(new Date(), 'yyMMdd'),
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
    Caption: {
      v1: caption,
    },
    Solution: {
      s1: solution,
    },
    Image: imageUrl,
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const today = new Date();
    // Format date as YYMMDD (e.g., 241229 for December 29, 2024)
    const dateStr = format(today, 'yyMMdd');
    console.log(`Fetching puzzle for date: ${dateStr}`);
    
    // Construct the URL with the correct format
    const url = `https://www.uclick.com/puzzles/tmjmf/tmjmf${dateStr}-data.xml`;
    console.log(`Trying URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/xml, text/xml, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.uclick.com/',
        'Origin': 'https://www.uclick.com'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch puzzle data: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Error response body:', errorBody);
      throw new Error(`Failed to fetch puzzle data: ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    console.log('Received XML:', xmlText);

    // Parse XML without using DOMParser
    const jsonData = parseJumbleXML(xmlText);
    console.log('Parsed data:', jsonData);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Format the date for database storage (YYYY-MM-DD)
    const dbDate = format(today, 'yyyy-MM-dd');

    // Check if puzzle already exists for this date
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

    console.log(`Inserting new puzzle for ${dbDate}`);

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
      .single();

    if (puzzleError) {
      console.error('Error inserting puzzle:', puzzleError);
      throw puzzleError;
    }

    // Insert the jumble words
    const jumbleWords = [
      { puzzle_id: puzzle.id, jumbled_word: jsonData.Clues.c1, answer: jsonData.Clues.a1 },
      { puzzle_id: puzzle.id, jumbled_word: jsonData.Clues.c2, answer: jsonData.Clues.a2 },
      { puzzle_id: puzzle.id, jumbled_word: jsonData.Clues.c3, answer: jsonData.Clues.a3 },
      { puzzle_id: puzzle.id, jumbled_word: jsonData.Clues.c4, answer: jsonData.Clues.a4 },
    ];

    const { error: wordsError } = await supabase
      .from('jumble_words')
      .insert(jumbleWords);

    if (wordsError) {
      console.error('Error inserting jumble words:', wordsError);
      throw wordsError;
    }

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