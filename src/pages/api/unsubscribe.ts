import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const email = url.searchParams.get('email');

  if (!email) {
    return page('Ogiltig länk. E-postadress saknas.', 400);
  }

  // PATCH the subscriber row directly via PostgREST. supabase-js spins up
  // a RealtimeClient on creation that fails on Node 20 serverless; a plain
  // fetch avoids that for this single UPDATE.
  const supabaseURL = import.meta.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  const normalized = email.toLowerCase().trim();

  try {
    const res = await fetch(
      `${supabaseURL}/rest/v1/subscribers?email=eq.${encodeURIComponent(normalized)}`,
      {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ active: false }),
      }
    );
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error('[unsubscribe] Supabase REST error:', res.status, errBody);
      return page('Något gick fel. Försök igen senare.', 500);
    }
  } catch (err) {
    console.error('[unsubscribe] Supabase fetch failed:', err);
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
