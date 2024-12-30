const HEADERS = {
  'Accept': 'application/json, text/javascript, */*',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://www.uclick.com/',
  'Origin': 'https://www.uclick.com'
};

export async function fetchPuzzleXML(url: string): Promise<string> {
  console.log(`Fetching puzzle from URL: ${url}`);
  
  try {
    // First try the provided URL
    let response = await fetch(url, { 
      headers: HEADERS,
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    // If the first attempt fails, try without the callback parameter
    if (!response.ok) {
      console.log('First attempt failed, trying without callback parameter');
      const baseUrl = url.split('?')[0];
      response = await fetch(baseUrl, {
        headers: HEADERS,
        signal: AbortSignal.timeout(10000)
      });
    }

    if (!response.ok) {
      console.error(`Failed to fetch puzzle data: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch puzzle data: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    console.log('Raw response:', text.substring(0, 200) + '...'); // Log first 200 chars
    
    // Check if the response is empty
    if (!text) {
      throw new Error('Empty response received');
    }
    
    // Handle both callback wrapped and raw JSON responses
    let jsonString = text;
    if (text.includes('jsonCallback')) {
      jsonString = text
        .replace(/^\/\*\*\//, '') // Remove leading comments
        .replace(/^jsonCallback\((.*)\);?$/, '$1'); // Remove jsonCallback wrapper
    }
    
    console.log('Processed JSON string:', jsonString.substring(0, 200) + '...'); // Log first 200 chars
    
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