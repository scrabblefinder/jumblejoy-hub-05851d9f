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
  console.log('Raw XML:', xmlText);
  
  // Extract clues section
  const cluesMatch = xmlText.match(/<clues>(.*?)<\/clues>/s);
  if (!cluesMatch) {
    console.error('No clues section found in XML');
    throw new Error('Invalid puzzle data format');
  }
  
  const cluesSection = cluesMatch[1];
  const clues = cluesSection.match(/<c\d+>.*?<\/c\d+>/gs) || [];
  
  const jumbledWords = [];
  const answers = [];
  
  for (const clue of clues) {
    const jumbledMatch = clue.match(/<j>(.*?)<\/j>/);
    const answerMatch = clue.match(/<a>(.*?)<\/a>/);
    
    if (jumbledMatch && answerMatch) {
      jumbledWords.push(jumbledMatch[1].trim());
      answers.push(answerMatch[1].trim());
    }
  }
  
  // Extract caption from nested structure
  const captionMatch = xmlText.match(/<caption>.*?<v1>.*?<t>(.*?)<\/t>.*?<\/v1>.*?<\/caption>/s);
  const caption = captionMatch ? captionMatch[1].trim() : '';
  
  // Extract solution from nested structure
  const solutionMatch = xmlText.match(/<solution>.*?<s1.*?>.*?<a>(.*?)<\/a>.*?<\/s1>.*?<\/solution>/s);
  const solution = solutionMatch ? solutionMatch[1].trim() : '';
  
  // Extract image URL
  const imageMatch = xmlText.match(/<image>(.*?)<\/image>/);
  const imageUrl = imageMatch ? imageMatch[1].trim() : '';

  console.log('Extracted data:', {
    date: format(date, 'yyyy-MM-dd'),
    caption,
    solution,
    jumbleWordsCount: jumbledWords.length,
    jumbledWords,
    answers
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
  const url = `http://msn.assets.uclick.com/tmjmf${dateStr}-data.xml`;
  
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