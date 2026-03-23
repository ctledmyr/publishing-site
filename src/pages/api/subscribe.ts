import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { generateWelcomeEmail } from '../../lib/emailTemplate';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Accept both JSON and form-encoded bodies
  let email: string | null = null;

  const contentType = request.headers.get('content-type') ?? '';
  try {
    if (contentType.includes('application/json')) {
      const body = await request.json();
      email = body.email ?? null;
    } else {
      const form = await request.formData();
      email = (form.get('email') as string) ?? null;
    }
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  if (!email || typeof email !== 'string') {
    return json({ error: 'Email is required.' }, 400);
  }

  const trimmed = email.trim().toLowerCase();

  // Basic RFC-style check (the DB constraint is the authoritative validator)
  if (!trimmed.includes('@') || trimmed.length < 5) {
    return json({ error: 'A valid email address is required.' }, 400);
  }

  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { error: dbError } = await supabase
    .from('subscribers')
    .insert({ email: trimmed });

  if (dbError) {
    // PostgreSQL unique_violation error code
    if (dbError.code === '23505') {
      return json({ error: 'This email is already subscribed.' }, 409);
    }
    console.error('[subscribe] Supabase error:', dbError);
    return json({ error: 'Failed to subscribe. Please try again.' }, 500);
  }

  // Send welcome email (fire-and-forget; don't block the subscription response)
  try {
    const siteURL = import.meta.env.SITE_URL;
    const unsubscribeURL = `${siteURL}/api/unsubscribe?email=${encodeURIComponent(trimmed)}`;
    const resend = new Resend(import.meta.env.RESEND_API_KEY);

    const { html, text } = generateWelcomeEmail({ unsubscribeURL });
    await resend.emails.send({
      from: `Things Written <${import.meta.env.RESEND_FROM_EMAIL}>`,
      to: trimmed,
      subject: 'Välkommen till Things Written',
      html,
      text,
    });
  } catch (emailError) {
    // Log but don't fail the subscription if the welcome email fails
    console.error('[subscribe] Welcome email error:', emailError);
  }

  return json({ success: true });
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
