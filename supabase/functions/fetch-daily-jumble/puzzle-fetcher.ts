const HEADERS = {
  'Accept': 'application/xml, text/xml, */*',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://www.uclick.com/',
  'Origin': 'https://www.uclick.com',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

export async function fetchPuzzleXML(url: string): Promise<string> {
  console.log(`Fetching puzzle from URL: ${url}`);
  
  try {
    const response = await fetch(url, { 
      headers: HEADERS,
      // Add a small timeout to prevent hanging
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      console.error(`Failed to fetch puzzle data: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Error response body:', errorBody);
      
      // Try fetching without cache
      console.log('Retrying with cache-busting parameter...');
      const retryUrl = `${url}?t=${new Date().getTime()}`;
      const retryResponse = await fetch(retryUrl, { 
        headers: HEADERS,
        signal: AbortSignal.timeout(10000)
      });

      if (!retryResponse.ok) {
        throw new Error(`Failed to fetch puzzle data after retry: ${retryResponse.status} ${retryResponse.statusText}`);
      }

      const retryText = await retryResponse.text();
      console.log('Successfully fetched puzzle data after retry');
      return retryText;
    }

    const text = await response.text();
    console.log('Successfully fetched puzzle data on first try');
    return text;
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    throw new Error(`Failed to fetch puzzle: ${error.message}`);
  }
}