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
    
    // Remove the jsonCallback wrapper
    const jsonString = text.replace(/^\/\*\*\/jsonCallback\((.*)\);?$/, '$1');
    console.log('Processed JSON string:', jsonString);
    
    // Validate JSON
    JSON.parse(jsonString); // This will throw if invalid
    
    console.log('Successfully fetched and validated puzzle data');
    return jsonString;
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    throw new Error(`Failed to fetch puzzle: ${error.message}`);
  }
}