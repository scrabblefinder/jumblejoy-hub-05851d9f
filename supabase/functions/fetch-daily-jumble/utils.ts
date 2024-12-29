import { format } from 'https://esm.sh/date-fns@3.3.1';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const extractPuzzleData = (xmlText: string, date: Date) => {
  console.log('Raw XML:', xmlText);

  // Extract clues section
  const cluesMatch = xmlText.match(/<clues>([\s\S]*?)<\/clues>/);
  if (!cluesMatch) {
    console.error('No clues section found');
    throw new Error('Invalid puzzle format');
  }

  const cluesSection = cluesMatch[1];
  console.log('Clues section:', cluesSection);

  // Extract individual clues using the same format as the manual JSON entry
  const clues = {
    c1: '', c2: '', c3: '', c4: '',
    a1: '', a2: '', a3: '', a4: '',
    o1: '2,3,5', o2: '2,4,5', o3: '2,3,6', o4: '3,5'
  };

  // Extract jumbled words and answers
  const clueRegex = /<c(\d+)>\s*<j>(.*?)<\/j>\s*<a>(.*?)<\/a>/g;
  let clueMatch;
  while ((clueMatch = clueRegex.exec(cluesSection)) !== null) {
    const [, num, jumbled, answer] = clueMatch;
    clues[`c${num}`] = jumbled.trim();
    clues[`a${num}`] = answer.trim();
  }

  console.log('Extracted clues:', clues);

  // Extract caption
  const captionMatch = xmlText.match(/<caption>[\s\S]*?<v1>[\s\S]*?<t>(.*?)<\/t>/);
  const caption = captionMatch ? captionMatch[1].trim() : '';
  console.log('Extracted caption:', caption);

  // Extract solution
  const solutionMatch = xmlText.match(/<solution>[\s\S]*?<s1[^>]*>[\s\S]*?<a>(.*?)<\/a>/);
  const solution = solutionMatch ? solutionMatch[1].trim() : '';
  console.log('Extracted solution:', solution);

  // Extract image URL
  const imageMatch = xmlText.match(/<image>(.*?)<\/image>/);
  const imageUrl = imageMatch ? imageMatch[1].trim() : '';
  console.log('Extracted image URL:', imageUrl);

  // Format data exactly like the manual JSON entry
  const puzzleData = {
    date: format(date, 'yyyy-MM-dd'),
    caption: caption || 'Daily Jumble Puzzle',
    image_url: imageUrl || 'https://placeholder.com/400x300',
    solution: solution || '',
    jumble_words: [
      { jumbled_word: clues.c1, answer: clues.a1 },
      { jumbled_word: clues.c2, answer: clues.a2 },
      { jumbled_word: clues.c3, answer: clues.a3 },
      { jumbled_word: clues.c4, answer: clues.a4 }
    ].filter(word => word.jumbled_word && word.answer) // Only include complete word pairs
  };

  console.log('Final puzzle data:', puzzleData);
  return puzzleData;
};

export const fetchPuzzle = async (date: Date) => {
  const dateStr = format(date, 'yyMMdd');
  const url = `http://msn.assets.uclick.com/tmjmf${dateStr}-data.xml`;
  
  console.log(`Fetching puzzle for date ${dateStr} from URL: ${url}`);
  
  try {
    const response = await fetch(url, { 
      headers: {
        'Accept': 'application/xml, text/xml, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch puzzle data: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Error response body:', errorBody);
      throw new Error(`Failed to fetch puzzle data: ${response.statusText}`);
    }

    const text = await response.text();
    console.log('Successfully fetched puzzle data:', text);
    return text;
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    throw error;
  }
};