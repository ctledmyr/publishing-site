import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { generateWelcomeEmail } from '../../lib/emailTemplate';

export const prerender = false;

export const POST: APIRoute = async () => {
  const testEmail = import.meta.env.TEST_EMAIL;
  if (!testEmail) {
    return json({ error: 'TEST_EMAIL environment variable is not set.' }, 500);
  }

  const siteURL = import.meta.env.SITE_URL;
  const unsubscribeURL = `${siteURL}/api/unsubscribe?email=${encodeURIComponent(testEmail)}`;

  const resend = new Resend(import.meta.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: `Things Written <${import.meta.env.RESEND_FROM_EMAIL}>`,
    to: testEmail,
    subject: '[TEST] Välkommen till Things Written',
    text: generateWelcomeEmail({ unsubscribeURL }),
  });

  if (error) {
    console.error('[send-test-welcome] Resend error:', error);
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
