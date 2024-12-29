import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { format } from 'https://esm.sh/date-fns@3.3.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HEADERS = {
  'Accept': 'application/xml, text/xml, */*',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

const getTagContent = (xml: string, tag: string) => {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'gs');
  const match = regex.exec(xml);
  return match ? match[1].trim() : '';
};

const extractPuzzleData = (xmlText: string, date: Date) => {
  console.log('Extracting puzzle data from XML...');
  
  const clues = xmlText.match(/<clue[^>]*>[\s\S]*?<\/clue>/g) || [];
  const jumbledWords = clues.map(clue => getTagContent(clue, 'j'));
  const answers = clues.map(clue => getTagContent(clue, 'a'));
  const caption = getTagContent(xmlText.match(/<caption>[\s\S]*?<\/caption>/)?.[0] || '', 't');
  const solution = getTagContent(xmlText.match(/<solution>[\s\S]*?<\/solution>/)?.[0] || '', 'a');
  const imageUrl = getTagContent(xmlText, 'image');

  console.log('Extracted data:', {
    date: format(date, 'yyyy-MM-dd'),
    caption,
    solution,
    jumbleWordsCount: jumbledWords.length
  });

  return {
    date: format(date, 'yyyy-MM-dd'),
    caption,
    image_url: imageUrl || 'https://placeholder.com/400x300',
    solution,
    jumble_words: jumbledWords.map((word, index) => ({
      jumbled_word: word,
      answer: answers[index]
    }))
  };
};

const fetchPuzzle = async (date: Date) => {
  const dateStr = format(date, 'yyMMdd');
  const url = `https://www.uclick.com/puzzles/tmjmf/tmjmf${dateStr}-data.xml`;
  
  console.log(`Attempting to fetch puzzle for date ${dateStr} from URL: ${url}`);
  
  try {
    const response = await fetch(url, { headers: HEADERS });
    
    if (!response.ok) {
      console.error(`Failed to fetch puzzle data: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch puzzle data: ${response.statusText}`);
    }

    const text = await response.text();
    console.log('Successfully fetched puzzle data');
    return text;
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    throw error;
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const today = new Date();
    console.log('Starting puzzle fetch process...');
    
    try {
      console.log('Attempting to fetch today\'s puzzle...');
      const xmlText = await fetchPuzzle(today);
      const puzzleData = extractPuzzleData(xmlText, today);
      
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
        console.log(`Puzzle for ${puzzleData.date} already exists`);
        return new Response(
          JSON.stringify({ message: `Puzzle for ${puzzleData.date} already exists` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert new puzzle
      console.log('Inserting new puzzle...');
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

      if (puzzleError) {
        console.error('Error inserting puzzle:', puzzleError);
        throw puzzleError;
      }

      // Insert jumble words
      console.log('Inserting jumble words...');
      const jumbleWords = puzzleData.jumble_words.map(word => ({
        puzzle_id: puzzle.id,
        jumbled_word: word.jumbled_word,
        answer: word.answer
      }));

      const { error: wordsError } = await supabase
        .from('jumble_words')
        .insert(jumbleWords);

      if (wordsError) {
        console.error('Error inserting jumble words:', wordsError);
        throw wordsError;
      }

      console.log('Successfully added puzzle and jumble words');
      return new Response(
        JSON.stringify({ message: 'Puzzle added successfully', puzzle }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (error) {
      console.log('Failed to fetch today\'s puzzle, trying yesterday\'s...');
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const xmlText = await fetchPuzzle(yesterday);
      const puzzleData = extractPuzzleData(xmlText, yesterday);
      
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
        console.log(`Puzzle for ${puzzleData.date} already exists`);
        return new Response(
          JSON.stringify({ message: `Puzzle for ${puzzleData.date} already exists` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert new puzzle
      console.log('Inserting new puzzle...');
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

      if (puzzleError) {
        console.error('Error inserting puzzle:', puzzleError);
        throw puzzleError;
      }

      // Insert jumble words
      console.log('Inserting jumble words...');
      const jumbleWords = puzzleData.jumble_words.map(word => ({
        puzzle_id: puzzle.id,
        jumbled_word: word.jumbled_word,
        answer: word.answer
      }));

      const { error: wordsError } = await supabase
        .from('jumble_words')
        .insert(jumbleWords);

      if (wordsError) {
        console.error('Error inserting jumble words:', wordsError);
        throw wordsError;
      }

      console.log('Successfully added puzzle and jumble words');
      return new Response(
        JSON.stringify({ message: 'Puzzle added successfully', puzzle }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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