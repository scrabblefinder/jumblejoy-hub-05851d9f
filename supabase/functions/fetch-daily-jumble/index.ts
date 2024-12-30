import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  date?: string;
  puzzleType: 'daily' | 'sunday';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { date, puzzleType } = await req.json() as RequestBody;
    console.log('Received request:', { date, puzzleType });

    // Validate and format the date
    let formattedDate = date;
    if (!formattedDate) {
      const today = new Date();
      formattedDate = today.toISOString().split('T')[0];
    }
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }

    // Base URL components
    const basePrefix = 'https://gamedata.services.amuniversal.com/c/uupuz/l/U2FsdGVkX1+b5Y+X7zaEFHSWJrCGS0ZTfgh8ArjtJXrQId7t4Y1oVKwUDKd4WyEo%0A/g';
    const timestamp = Date.now();
    
    // Use tmjmf for daily puzzles and tmjms for Sunday puzzles
    const puzzleCode = puzzleType === 'daily' ? 'tmjmf' : 'tmjms';
    const url = `${basePrefix}/${puzzleCode}/d/${formattedDate}/data.json?callback=jsonCallback&_=${timestamp}`;
    
    console.log('Fetching puzzle from URL:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch puzzle: ${response.statusText}`);
    }

    const text = await response.text();
    console.log('Raw response:', text);

    // Remove the jsonCallback wrapper
    const jsonStr = text.replace(/^\/\*\*\/jsonCallback\((.*)\)$/, '$1');
    console.log('Cleaned JSON:', jsonStr);

    let puzzleData;
    try {
      puzzleData = JSON.parse(jsonStr);
    } catch (error) {
      throw new Error(`Invalid puzzle data format: ${error.message}`);
    }

    return new Response(
      JSON.stringify(puzzleData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: `Failed to fetch or process puzzle: ${error.message}` }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})