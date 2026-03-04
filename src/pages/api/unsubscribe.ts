import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const email = url.searchParams.get('email');

  if (!email) {
    return page('Ogiltig länk. E-postadress saknas.', 400);
  }

  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { error } = await supabase
    .from('subscribers')
    .update({ active: false })
    .eq('email', email.toLowerCase().trim());

  if (error) {
    console.error('[unsubscribe] Supabase error:', error);
    return page('Något gick fel. Försök igen senare.', 500);
  }

  const siteURL = import.meta.env.SITE_URL ?? '/';

  return page(`
    <p>Du har avslutat din prenumeration på Things Written.</p>
    <p><a href="${siteURL}">Tillbaka till sajten</a></p>
  `);
};

function page(body: string, status = 200): Response {
  return new Response(
    `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Avsluta prenumeration</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 480px; margin: 80px auto; padding: 0 20px; color: #333;">
  ${body}
</body>
</html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
