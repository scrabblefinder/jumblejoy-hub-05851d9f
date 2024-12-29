import { format } from 'https://esm.sh/date-fns@3.3.1';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HEADERS = {
  'Accept': 'application/xml, text/xml, */*',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://www.uclick.com/',
  'Origin': 'https://www.uclick.com',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
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

  // Extract individual clues
  const clueRegex = /<c\d+>\s*<j>(.*?)<\/j>\s*<a>(.*?)<\/a>/g;
  const jumbleWords = [];
  const answers = [];
  
  let clueMatch;
  while ((clueMatch = clueRegex.exec(cluesSection)) !== null) {
    const [, jumbled, answer] = clueMatch;
    jumbleWords.push(jumbled.trim());
    answers.push(answer.trim());
  }

  console.log('Extracted jumble words:', jumbleWords);
  console.log('Extracted answers:', answers);

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

  // Prepare the data
  const puzzleData = {
    date: format(date, 'yyyy-MM-dd'),
    caption,
    image_url: imageUrl || 'https://placeholder.com/400x300',
    solution,
    jumble_words: jumbleWords.map((word, index) => ({
      jumbled_word: word,
      answer: answers[index]
    }))
  };

  console.log('Final puzzle data:', puzzleData);
  return puzzleData;
};

export const fetchPuzzle = async (date: Date) => {
  const dateStr = format(date, 'yyMMdd');
  const url = `http://msn.assets.uclick.com/tmjmf${dateStr}-data.xml`;
  
  console.log(`Fetching puzzle for date ${dateStr} from URL: ${url}`);
  
  try {
    const response = await fetch(url, { headers: HEADERS });
    
    if (!response.ok) {
      console.error(`Failed to fetch puzzle data: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Error response body:', errorBody);
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