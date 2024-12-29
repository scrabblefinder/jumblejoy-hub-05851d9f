select
  cron.schedule(
    'fetch-daily-jumble-cron',
    '0 5 * * *', -- Run at 5 AM UTC every day
    $$
    select
      net.http_post(
        url:='https://jznccczfjmatdxdrvszk.supabase.co/functions/v1/fetch-daily-jumble',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
      ) as request_id;
    $$
  );