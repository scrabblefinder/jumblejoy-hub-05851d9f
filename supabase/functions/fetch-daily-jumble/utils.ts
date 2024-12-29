export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const fetchPuzzle = async (date: Date): Promise<string> => {
  const formattedDate = formatDate(date);
  const timestamp = new Date().getTime();
  const url = `https://gamedata.services.amuniversal.com/c/uupuz/l/U2FsdGVkX1+b5Y+X7zaEFHSWJrCGS0ZTfgh8ArjtJXrQId7t4Y1oVKwUDKd4WyEo%0A/g/tmjms/d/${formattedDate}/data.json?callback=jsonCallback&_=${timestamp}`;
  
  console.log(`Attempting to fetch puzzle for date ${formattedDate} from URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json, text/javascript, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.uclick.com/',
        'Origin': 'https://www.uclick.com'
      }
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    console.log('Successfully fetched puzzle data');
    return text;
  } catch (error) {
    console.error(`Error fetching puzzle for date ${formattedDate}:`, error);
    throw new Error(`Failed to fetch puzzle for date ${formattedDate}: ${error.message}`);
  }
};

export const extractPuzzleData = (jsonText: string, date: Date) => {
  console.log('Extracting puzzle data from JSON callback');
  
  try {
    // Remove the jsonCallback wrapper
    const jsonString = jsonText.replace(/^jsonCallback\((.*)\)$/, '$1');
    const data = JSON.parse(jsonString);
    
    console.log('Parsed JSON data:', data);
    
    return {
      Date: formatDate(date),
      Clues: {
        c1: data.Clues?.c1 || '',
        c2: data.Clues?.c2 || '',
        c3: data.Clues?.c3 || '',
        c4: data.Clues?.c4 || '',
        a1: data.Clues?.a1 || '',
        a2: data.Clues?.a2 || '',
        a3: data.Clues?.a3 || '',
        a4: data.Clues?.a4 || '',
      },
      Caption: {
        v1: data.Caption?.v1 || '',
      },
      Solution: {
        s1: data.Solution?.s1 || '',
      },
      Image: data.Image || '',
    };
  } catch (error) {
    console.error('Error parsing puzzle data:', error);
    throw new Error(`Failed to parse puzzle data: ${error.message}`);
  }
};