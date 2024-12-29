select
  cron.schedule(
    'fetch-daily-jumble-cron',
    '0 5 * * *', -- Run at 5 AM UTC every day
    $$
    select
      net.http_post(
        url:='https://jznccczfjmatdxdrvszk.supabase.co/functions/v1/fetch-daily-jumble',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bmNjY3pmam1hdGR4ZHJ2c3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MDcxODMsImV4cCI6MjA1MDk4MzE4M30.5XbT0q22t2i2WWCY45_5R249C9NeucorSnpGPXn8LEo"}'::jsonb
      ) as request_id;
    $$
  );