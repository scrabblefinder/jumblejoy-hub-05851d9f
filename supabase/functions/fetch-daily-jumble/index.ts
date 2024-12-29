import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { format } from 'https://esm.sh/date-fns@3.3.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
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
      // Try yesterday's puzzle if today's isn't available yet
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = format(yesterday, 'yyMMdd');
      const fallbackUrl = `https://www.uclick.com/puzzles/tmjmf/tmjmf${yesterdayStr}-data.xml`;
      console.log(`Trying fallback URL: ${fallbackUrl}`);
      
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: {
          'Accept': 'application/xml, text/xml, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!fallbackResponse.ok) {
        throw new Error(`Failed to fetch puzzle data: ${fallbackResponse.statusText}`);
      }

      const xmlText = await fallbackResponse.text();
      console.log('Received XML:', xmlText);

      // Extract data using regex
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

      const puzzleData = {
        date: format(yesterday, 'yyyy-MM-dd'),
        caption,
        image_url: imageUrl,
        solution,
        jumble_words: jumbledWords.map((word, index) => ({
          jumbled_word: word,
          answer: answers[index]
        }))
      };

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Check if puzzle already exists
      const { data: existingPuzzle } = await supabase
        .from('daily_puzzles')
        .select()
        .eq('date', puzzleData.date)
        .maybeSingle();

      if (existingPuzzle) {
        return new Response(
          JSON.stringify({ message: `Puzzle for ${puzzleData.date} already exists` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert new puzzle
      const { data: puzzle, error: puzzleError } = await supabase
        .from('daily_puzzles')
        .insert({
          date: puzzleData.date,
          caption: puzzleData.caption,
          image_url: puzzleData.image_url,
          solution: puzzleData.solution
        })
        .select()
        .single();

      if (puzzleError) throw puzzleError;

      // Insert jumble words
      const jumbleWords = puzzleData.jumble_words.map(word => ({
        puzzle_id: puzzle.id,
        jumbled_word: word.jumbled_word,
        answer: word.answer
      }));

      const { error: wordsError } = await supabase
        .from('jumble_words')
        .insert(jumbleWords);

      if (wordsError) throw wordsError;

      return new Response(
        JSON.stringify({ message: 'Puzzle added successfully', puzzle }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process today's puzzle if it was found
    const xmlText = await response.text();
    const clues = xmlText.match(/<clue[^>]*>[\s\S]*?<\/clue>/g) || [];
    const jumbledWords = clues.map(clue => getTagContent(clue, 'j'));
    const answers = clues.map(clue => getTagContent(clue, 'a'));

    const caption = getTagContent(xmlText.match(/<caption>[\s\S]*?<\/caption>/)?.[0] || '', 't');
    const solution = getTagContent(xmlText.match(/<solution>[\s\S]*?<\/solution>/)?.[0] || '', 'a');
    const imageUrl = getTagContent(xmlText, 'image');

    const puzzleData = {
      date: format(today, 'yyyy-MM-dd'),
      caption,
      image_url: imageUrl,
      solution,
      jumble_words: jumbledWords.map((word, index) => ({
        jumbled_word: word,
        answer: answers[index]
      }))
    };

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if puzzle already exists
    const { data: existingPuzzle } = await supabase
      .from('daily_puzzles')
      .select()
      .eq('date', puzzleData.date)
      .maybeSingle();

    if (existingPuzzle) {
      return new Response(
        JSON.stringify({ message: `Puzzle for ${puzzleData.date} already exists` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert new puzzle
    const { data: puzzle, error: puzzleError } = await supabase
      .from('daily_puzzles')
      .insert({
        date: puzzleData.date,
        caption: puzzleData.caption,
        image_url: puzzleData.image_url,
        solution: puzzleData.solution
      })
      .select()
      .single();

    if (puzzleError) throw puzzleError;

    // Insert jumble words
    const jumbleWords = puzzleData.jumble_words.map(word => ({
      puzzle_id: puzzle.id,
      jumbled_word: word.jumbled_word,
      answer: word.answer
    }));

    const { error: wordsError } = await supabase
      .from('jumble_words')
      .insert(jumbleWords);

    if (wordsError) throw wordsError;

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
