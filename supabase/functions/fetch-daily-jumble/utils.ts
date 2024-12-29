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
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  
  // Extract all the necessary data from XML
  const puzzleData: JumbleCallback = {
    Date: formatDate(date),
    Clues: {
      c1: getNodeText(xmlDoc, "c1"),
      c2: getNodeText(xmlDoc, "c2"),
      c3: getNodeText(xmlDoc, "c3"),
      c4: getNodeText(xmlDoc, "c4"),
      a1: getNodeText(xmlDoc, "a1"),
      a2: getNodeText(xmlDoc, "a2"),
      a3: getNodeText(xmlDoc, "a3"),
      a4: getNodeText(xmlDoc, "a4")
    },
    Caption: {
      v1: getNodeText(xmlDoc, "v1")
    },
    Solution: {
      s1: getNodeText(xmlDoc, "s1")
    },
    Image: getNodeText(xmlDoc, "image"),
    CircledLetters: {
      p1: getNodeText(xmlDoc, "p1"),
      p2: getNodeText(xmlDoc, "p2"),
      p3: getNodeText(xmlDoc, "p3"),
      p4: getNodeText(xmlDoc, "p4")
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

const getNodeText = (doc: Document, tagName: string): string => {
  const node = doc.getElementsByTagName(tagName)[0];
  return node ? node.textContent || "" : "";
};

export const extractCircledLetters = (answers: string[], positions: string[]): string => {
  console.log('Extracting circled letters from answers:', answers, 'with positions:', positions);
  let finalJumble = '';
  
  // Process each answer with its corresponding positions
  answers.forEach((answer, index) => {
    if (positions[index]) {
      const positionsList = positions[index].split(';');
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
    const xmlText = await fetchPuzzleXML(url);
    console.log('Successfully fetched puzzle XML');
    return xmlText;
  } catch (error) {
    console.error(`Error fetching puzzle for date ${formattedDate}:`, error);
    throw new Error(`Failed to fetch puzzle for date ${formattedDate}`);
  }
};