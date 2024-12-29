import { format } from 'https://esm.sh/date-fns@3.3.1';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const cleanCaption = (caption: string): string => {
  return caption.replace(/{\s*}/g, '');
};

export const cleanSolution = (solution: string): string => {
  return solution.replace(/{\s*}/g, ' ').trim();
};

export const extractPuzzleData = (jsonText: string, date: Date) => {
  console.log('Raw JSON:', jsonText);

  // Remove the jsonCallback wrapper
  const cleanJson = jsonText.replace(/^\/\*\*\/jsonCallback\((.*)\);?$/, '$1');
  const data = JSON.parse(cleanJson);
  console.log('Parsed JSON data:', data);

  // Extract jumble words with circles information
  const jumbleWords = [
    { jumbled_word: data.Clues.c1, answer: data.Clues.a1, circles: data.Clues.o1 },
    { jumbled_word: data.Clues.c2, answer: data.Clues.a2, circles: data.Clues.o2 },
    { jumbled_word: data.Clues.c3, answer: data.Clues.a3, circles: data.Clues.o3 },
    { jumbled_word: data.Clues.c4, answer: data.Clues.a4, circles: data.Clues.o4 }
  ].filter(word => word.jumbled_word && word.answer); // Filter out any undefined words

  console.log('Extracted jumble words:', jumbleWords);

  // Get final jumble and solution
  const finalJumble = data.Solution.k1 || '';
  const solution = cleanSolution(data.Solution.s1 || '');

  console.log('Final jumble:', finalJumble);
  console.log('Solution:', solution);

  // Format data for database insertion with cleaned caption and solution
  const puzzleData = {
    date: format(date, 'yyyy-MM-dd'),
    caption: cleanCaption(data.Caption.v1 || 'Daily Jumble Puzzle'),
    image_url: data.Image || 'https://placeholder.com/400x300',
    solution: solution,
    final_jumble: finalJumble,
    jumble_words: jumbleWords
  };

  console.log('Final puzzle data:', puzzleData);
  return puzzleData;
};

export const fetchPuzzle = async (date: Date) => {
  const dateStr = format(date, 'yyyyMMdd');
  const timestamp = Date.now();
  const url = `https://gamedata.services.amuniversal.com/c/uupuz/l/U2FsdGVkX1+b5Y+X7zaEFHSWJrCGS0ZTfgh8ArjtJXrQId7t4Y1oVKwUDKd4WyEo%0A/g/tmjms/d/${dateStr}/data.json?callback=jsonCallback&_=${timestamp}`;
  
  console.log(`Attempting to fetch puzzle from URL: ${url}`);
  
  const headers = {
    'Accept': '*/*',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Referer': 'https://www.uclick.com/'
  };

  try {
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Failed to fetch from ${url}:`, response.status, errorBody);
      throw new Error(`Failed to fetch puzzle data: ${response.statusText}`);
    }

    const text = await response.text();
    console.log('Successfully fetched puzzle data');
    return text;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
};