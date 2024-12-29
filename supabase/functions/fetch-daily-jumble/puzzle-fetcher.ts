const HEADERS = {
  'Accept': 'application/json, text/javascript, */*',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://www.uclick.com/',
  'Origin': 'https://www.uclick.com'
};

export async function fetchPuzzleXML(url: string): Promise<string> {
  console.log(`Fetching puzzle from URL: ${url}`);
  
  try {
    const response = await fetch(url, { 
      headers: HEADERS,
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      console.error(`Failed to fetch puzzle data: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch puzzle data: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    console.log('Raw response:', text);
    
    // Check if the response is empty or doesn't contain the expected callback
    if (!text || !text.includes('jsonCallback')) {
      throw new Error('Invalid puzzle data format');
    }
    
    // Remove the jsonCallback wrapper and any comments
    const jsonString = text
      .replace(/^\/\*\*\//, '') // Remove leading comments
      .replace(/^jsonCallback\((.*)\);?$/, '$1'); // Remove jsonCallback wrapper
    
    console.log('Processed JSON string:', jsonString);
    
    // Validate JSON
    try {
      JSON.parse(jsonString);
    } catch (e) {
      console.error('JSON parsing error:', e);
      throw new Error(`Invalid JSON format: ${e.message}`);
    }
    
    console.log('Successfully fetched and validated puzzle data');
    return jsonString;
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    throw new Error(`Failed to fetch puzzle: ${error.message}`);
  }
}