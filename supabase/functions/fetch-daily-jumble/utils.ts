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

export const getTagContent = (xml: string, tag: string) => {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'gs');
  const match = regex.exec(xml);
  return match ? match[1].trim() : '';
};

export const extractPuzzleData = (xmlText: string, date: Date) => {
  console.log('Extracting puzzle data from XML...');
  
  const clues = xmlText.match(/<clue[^>]*>[\s\S]*?<\/clue>/g) || [];
  const jumbledWords = clues.map(clue => getTagContent(clue, 'j'));
  const answers = clues.map(clue => getTagContent(clue, 'a'));
  
  // Extract caption from nested structure
  const captionMatch = xmlText.match(/<caption>[\s\S]*?<v1>[\s\S]*?<t>(.*?)<\/t>[\s\S]*?<\/v1>[\s\S]*?<\/caption>/);
  const caption = captionMatch ? captionMatch[1].trim() : '';
  
  // Extract solution from nested structure
  const solutionMatch = xmlText.match(/<solution>[\s\S]*?<s1[^>]*>[\s\S]*?<a>(.*?)<\/a>[\s\S]*?<\/s1>[\s\S]*?<\/solution>/);
  const solution = solutionMatch ? solutionMatch[1].trim() : '';
  
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

export const fetchPuzzle = async (date: Date) => {
  const dateStr = format(date, 'yyMMdd');
  const url = `https://www.uclick.com/puzzles/tmjmf/tmjmf${dateStr}-data.xml`;
  
  console.log(`Attempting to fetch puzzle for date ${dateStr} from URL: ${url}`);
  
  try {
    const response = await fetch(url, { headers: HEADERS });
    
    if (!response.ok) {
      console.error(`Failed to fetch puzzle data: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Error response body:', errorBody);
      
      // Try fetching without cache
      console.log('Retrying with cache-busting parameter...');
      const retryUrl = `${url}?t=${new Date().getTime()}`;
      const retryResponse = await fetch(retryUrl, { headers: HEADERS });

      if (!retryResponse.ok) {
        throw new Error(`Failed to fetch puzzle data after retry: ${retryResponse.statusText}`);
      }

      return await retryResponse.text();
    }

    const text = await response.text();
    console.log('Successfully fetched puzzle data');
    return text;
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    throw error;
  }
};