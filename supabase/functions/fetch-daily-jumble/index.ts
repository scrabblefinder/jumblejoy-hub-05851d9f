import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { processPuzzleData } from './puzzle-processor.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  date?: string;
  jsonUrl: string;
  puzzleType: 'daily' | 'sunday';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { date, jsonUrl, puzzleType } = await req.json() as RequestBody;
    console.log('Received request:', { date, puzzleType, jsonUrl });

    // Validate and format the date
    let formattedDate = date;
    if (!formattedDate) {
      const today = new Date();
      formattedDate = today.toISOString().split('T')[0];
    }
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }

    // Fetch puzzle data
    console.log('Fetching puzzle from URL:', jsonUrl);
    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch puzzle: ${response.statusText}`);
    }

    const text = await response.text();
    console.log('Raw response:', text);

    // Clean and parse JSON data
    const jsonStr = text
      .replace(/\/\*.*?\*\//, '')
      .replace(/^jsonCallback\((.*)\)$/, '$1')
      .trim();
    
    console.log('Cleaned JSON:', jsonStr);

    let puzzleData;
    try {
      puzzleData = JSON.parse(jsonStr);
      console.log('Parsed puzzle data:', puzzleData);
    } catch (error) {
      console.error('JSON parse error:', error);
      throw new Error(`Invalid puzzle data format: ${error.message}`);
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Process puzzle data
    const { puzzle, jumbleWords } = await processPuzzleData(
      puzzleData,
      formattedDate,
      supabaseClient
    );

    return new Response(
      JSON.stringify({ 
        message: 'Puzzle saved successfully',
        puzzle,
        jumbleWords 
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
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
    );
  }
});