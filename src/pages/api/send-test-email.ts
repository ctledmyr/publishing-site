import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { generateEmail } from '../../lib/emailTemplate';

export const prerender = false;

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

  const testEmail = import.meta.env.TEST_EMAIL;
  if (!testEmail) {
    return json({ error: 'TEST_EMAIL environment variable is not set.' }, 500);
  }

  const fromEmail = `Things Written <${import.meta.env.RESEND_FROM_EMAIL}>`;
  const siteURL = import.meta.env.SITE_URL;

  const unsubscribeURL = `${siteURL}/api/unsubscribe?email=${encodeURIComponent(testEmail)}`;
  const subject = `[TEST] ${postTitle}`;
  const { html, text } = generateEmail({ postTitle, postURL, postContent, unsubscribeURL });

  const resend = new Resend(import.meta.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: fromEmail,
    replyTo: 'ctledmyr@gmail.com',
    to: testEmail,
    subject,
    html,
    text,
  });

  if (error) {
    console.error('[send-test-email] Resend error:', error);
    return json({ error: error.message }, 500);
  }

  return json({ sent: true, to: testEmail });
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
