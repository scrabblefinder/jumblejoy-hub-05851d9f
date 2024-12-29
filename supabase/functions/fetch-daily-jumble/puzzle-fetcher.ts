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
  
  const response = await fetch(url, { headers: HEADERS });

  if (!response.ok) {
    console.error(`Failed to fetch puzzle data: ${response.status} ${response.statusText}`);
    const errorBody = await response.text();
    console.error('Error response body:', errorBody);
    
    // Try fetching without cache
    console.log('Retrying with cache-busting parameter...');
    const retryUrl = `${url}?t=${new Date().getTime()}`;
    const retryResponse = await fetch(retryUrl, { headers: HEADERS });

    if (!retryResponse.ok) {
      throw new Error(`Failed to fetch puzzle data after retry: ${retryResponse.statusText}`);
    }

    return await retryResponse.text();
  }

  return await response.text();
}