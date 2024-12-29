import { format } from 'https://esm.sh/date-fns@3.3.1';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const extractPuzzleData = (jsonText: string, date: Date) => {
  console.log('Raw JSON:', jsonText);

  // Remove the jsonCallback wrapper
  const cleanJson = jsonText.replace(/^\/\*\*\/jsonCallback\((.*)\);?$/, '$1');
  const data = JSON.parse(cleanJson);
  console.log('Parsed JSON data:', data);

  // Extract jumble words
  const jumbleWords = [
    { jumbled_word: data.Clues.c1, answer: data.Clues.a1 },
    { jumbled_word: data.Clues.c2, answer: data.Clues.a2 },
    { jumbled_word: data.Clues.c3, answer: data.Clues.a3 },
    { jumbled_word: data.Clues.c4, answer: data.Clues.a4 }
  ];

  console.log('Extracted jumble words:', jumbleWords);

  // Format data for database insertion
  const puzzleData = {
    date: format(date, 'yyyy-MM-dd'),
    caption: data.Caption.v1 || 'Daily Jumble Puzzle',
    image_url: data.Image || 'https://placeholder.com/400x300',
    solution: data.Solution.s1 || '',
    jumble_words: jumbleWords
  };

  console.log('Final puzzle data:', puzzleData);
  return puzzleData;
};

export const fetchPuzzle = async (date: Date) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const timestamp = Date.now();
  const url = `https://gamedata.services.amuniversal.com/c/uupuz/l/U2FsdGVkX1+b5Y+X7zaEFHSWJrCGS0ZTfgh8ArjtJXrQId7t4Y1oVKwUDKd4WyEo%0A/g/tmjms/d/${dateStr}/data.json?callback=jsonCallback&_=${timestamp}`;
  
  console.log(`Attempting to fetch puzzle from URL: ${url}`);
  
  const headers = {
    'Accept': 'application/javascript, application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };

  try {
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Failed to fetch from ${url}:`, response.status, errorBody);
      throw new Error(`Failed to fetch puzzle data: ${response.statusText}`);
    }

    const text = await response.text();
    console.log('Successfully fetched puzzle data from:', url);
    return text;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
};