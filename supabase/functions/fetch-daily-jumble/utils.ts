import { format } from 'https://esm.sh/date-fns@3.3.1';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const getTagContent = (xml: string, tag: string) => {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'gs');
  const match = regex.exec(xml);
  return match ? match[1].trim() : '';
};

export const extractPuzzleData = (xmlText: string, date: Date) => {
  const clues = xmlText.match(/<clue[^>]*>[\s\S]*?<\/clue>/g) || [];
  const jumbledWords = clues.map(clue => getTagContent(clue, 'j'));
  const answers = clues.map(clue => getTagContent(clue, 'a'));
  const caption = getTagContent(xmlText.match(/<caption>[\s\S]*?<\/caption>/)?.[0] || '', 't');
  const solution = getTagContent(xmlText.match(/<solution>[\s\S]*?<\/solution>/)?.[0] || '', 'a');
  const imageUrl = getTagContent(xmlText, 'image');

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

  return await response.text();
};