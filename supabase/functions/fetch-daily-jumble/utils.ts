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

const extractCircledLetters = (word: string, circles: string): string => {
  if (!circles || !word) return '';
  
  // Log the input for debugging
  console.log(`Extracting circled letters from word: ${word}, circles: ${circles}`);
  
  try {
    const positions = circles.split(',').map(Number);
    const letters = positions.map(pos => {
      // Adjust for 0-based indexing and log each extraction
      const letter = word[pos - 1];
      console.log(`Position ${pos} (index ${pos - 1}) in "${word}" gives letter: "${letter}"`);
      return letter;
    });
    
    const result = letters.join('');
    console.log(`Extracted letters: ${result}`);
    return result;
  } catch (error) {
    console.error('Error extracting circled letters:', error);
    return '';
  }
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
  ].filter(word => word.jumbled_word && word.answer);

  console.log('Extracted jumble words with circles:', jumbleWords);

  // Create final jumble from circled letters
  const finalJumble = jumbleWords
    .map(word => {
      const letters = extractCircledLetters(word.jumbled_word, word.circles);
      console.log(`For word ${word.jumbled_word}, extracted letters: ${letters}`);
      return letters;
    })
    .join('');

  console.log('Created final jumble:', finalJumble);

  const solution = cleanSolution(data.Solution.s1 || '');
  console.log('Solution:', solution);

  // Format data for database insertion with cleaned caption and solution
  const puzzleData = {
    date: format(date, 'yyyy-MM-dd'),
    caption: cleanCaption(data.Caption.v1 || 'Daily Jumble Puzzle'),
    image_url: data.Image || 'https://placeholder.com/400x300',
    solution: solution,
    final_jumble: finalJumble,
    jumble_words: jumbleWords.map(({ jumbled_word, answer }) => ({
      jumbled_word,
      answer
    }))
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