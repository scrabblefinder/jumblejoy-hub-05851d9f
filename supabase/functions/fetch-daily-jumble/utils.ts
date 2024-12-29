export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JumbleCallback {
  Date: string;
  Clues: {
    c1: string;
    c2: string;
    c3: string;
    c4: string;
    a1: string;
    a2: string;
    a3: string;
    a4: string;
  };
  Caption: {
    v1: string;
  };
  Solution: {
    s1: string;
  };
  Image: string;
  CircledLetters?: {
    p1?: string;
    p2?: string;
    p3?: string;
    p4?: string;
  };
}

export const extractPuzzleData = (xmlText: string, date: Date) => {
  console.log('Extracting puzzle data from XML');
  
  // Simple XML parsing using regex since DOMParser is not available in Deno
  const getTagContent = (xml: string, tag: string): string => {
    const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 's');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  };

  // Extract clues
  const clues = xmlText.match(/<clue[^>]*>[\s\S]*?<\/clue>/g) || [];
  const getClueValue = (clue: string, tag: string) => getTagContent(clue, tag);

  const c1 = clues[0] ? getClueValue(clues[0], 'j') : '';
  const c2 = clues[1] ? getClueValue(clues[1], 'j') : '';
  const c3 = clues[2] ? getClueValue(clues[2], 'j') : '';
  const c4 = clues[3] ? getClueValue(clues[3], 'j') : '';

  const a1 = clues[0] ? getClueValue(clues[0], 'a') : '';
  const a2 = clues[1] ? getClueValue(clues[1], 'a') : '';
  const a3 = clues[2] ? getClueValue(clues[2], 'a') : '';
  const a4 = clues[3] ? getClueValue(clues[3], 'a') : '';

  // Extract positions
  const p1 = clues[0] ? getClueValue(clues[0], 'circle') : '';
  const p2 = clues[1] ? getClueValue(clues[1], 'circle') : '';
  const p3 = clues[2] ? getClueValue(clues[2], 'circle') : '';
  const p4 = clues[3] ? getClueValue(clues[3], 'circle') : '';

  // Extract caption and solution
  const caption = getTagContent(getTagContent(xmlText, 'caption'), 't');
  const solution = getTagContent(getTagContent(xmlText, 'solution'), 'a');
  const image = getTagContent(xmlText, 'image');

  const puzzleData: JumbleCallback = {
    Date: formatDate(date),
    Clues: {
      c1, c2, c3, c4,
      a1, a2, a3, a4
    },
    Caption: {
      v1: caption
    },
    Solution: {
      s1: solution
    },
    Image: image,
    CircledLetters: {
      p1, p2, p3, p4
    }
  };

  console.log('Extracted puzzle data:', puzzleData);
  return puzzleData;
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

export const extractCircledLetters = (answers: string[], positions: string[]): string => {
  console.log('Extracting circled letters from answers:', answers, 'with positions:', positions);
  let finalJumble = '';
  
  // Process each answer with its corresponding positions
  answers.forEach((answer, index) => {
    if (positions[index]) {
      const positionsList = positions[index].split(',');
      positionsList.forEach(pos => {
        const position = parseInt(pos) - 1; // Convert to 0-based index
        if (!isNaN(position) && position >= 0 && position < answer.length) {
          finalJumble += answer[position];
        }
      });
    }
  });
  
  console.log('Generated final jumble:', finalJumble);
  return finalJumble;
};

export const fetchPuzzle = async (date: Date): Promise<string> => {
  const formattedDate = formatDate(date);
  const url = `https://www.uclick.com/puzzles/tmjmf/${formattedDate}-data.xml`;
  
  try {
    console.log(`Attempting to fetch puzzle for date ${formattedDate} from URL: ${url}`);
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/xml, text/xml, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    console.log('Successfully fetched puzzle XML');
    return xmlText;
  } catch (error) {
    console.error(`Error fetching puzzle for date ${formattedDate}:`, error);
    throw new Error(`Failed to fetch puzzle for date ${formattedDate}`);
  }
};