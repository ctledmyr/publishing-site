import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { generateEmail } from '../../lib/emailTemplate';

export const prerender = false;

const BATCH_SIZE = 100; // Resend batch API limit

export const POST: APIRoute = async ({ request }) => {
  let postTitle: string;
  let postURL: string;
  let postContent: string | undefined;

  try {
    const body = await request.json();
    postTitle = body.postTitle;
    postURL = body.postURL;
    postContent = typeof body.postContent === 'string' ? body.postContent : undefined;
  } catch {
    return json({ error: 'Expected JSON body.' }, 400);
  }

  if (!postTitle?.trim() || !postURL?.trim()) {
    return json({ error: 'postTitle and postURL are required.' }, 400);
  }

  // Fetch active subscribers from Supabase
  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: subscribers, error: dbError } = await supabase
    .from('subscribers')
    .select('email')
    .eq('active', true);

  if (dbError) {
    console.error('[send-email] Supabase error:', dbError);
    return json({ error: 'Failed to fetch subscribers.' }, 500);
  }

  if (!subscribers || subscribers.length === 0) {
    return json({ sent: 0, total: 0, message: 'No active subscribers to notify.' });
  }

  const fromEmail = `Things Written <${import.meta.env.RESEND_FROM_EMAIL}>`;
  const siteURL = import.meta.env.SITE_URL;

  const resend = new Resend(import.meta.env.RESEND_API_KEY);
  const subject = postTitle;

  // Build email objects for every subscriber (per-subscriber content for unique unsubscribe links)
  const emails = subscribers.map(({ email }: { email: string }) => {
    const unsubscribeURL = `${siteURL}/api/unsubscribe?email=${encodeURIComponent(email)}`;
    const { html, text } = generateEmail({ postTitle, postURL, postContent, unsubscribeURL });
    return { from: fromEmail, replyTo: 'ctledmyr@gmail.com', to: email, subject, html, text };
  });

  // Send in batches of BATCH_SIZE (Resend limit)
  let totalSent = 0;
  const batchErrors: string[] = [];

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    const { data, error: sendError } = await resend.batch.send(batch);

    if (sendError) {
      console.error(`[send-email] Resend batch error (batch ${i / BATCH_SIZE + 1}):`, sendError);
      batchErrors.push(sendError.message);
    } else {
      // data.data is an array of sent email objects
      totalSent += (data as { data?: unknown[] })?.data?.length ?? batch.length;
    }
  }

  const responseBody: Record<string, unknown> = {
    sent: totalSent,
    total: subscribers.length,
  };

  if (batchErrors.length > 0) {
    responseBody.errors = batchErrors;
  }

  return json(responseBody);
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
