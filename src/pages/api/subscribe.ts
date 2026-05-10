import type { APIRoute } from 'astro';
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

  // Insert the subscriber via Supabase's PostgREST endpoint directly. Using
  // supabase-js here spins up a RealtimeClient that fails on Node 20
  // serverless — a plain fetch sidesteps that and is all we need for a
  // single INSERT.
  const supabaseURL = import.meta.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const res = await fetch(`${supabaseURL}/rest/v1/subscribers`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ email: trimmed }),
    });

    if (!res.ok) {
      // PostgREST surfaces a unique constraint violation as 409 with PG code 23505.
      if (res.status === 409) {
        return json({ error: 'This email is already subscribed.' }, 409);
      }
      const errBody = await res.text().catch(() => '');
      console.error('[subscribe] Supabase REST error:', res.status, errBody);
      return json({ error: 'Failed to subscribe. Please try again.' }, 500);
    }
  } catch (err) {
    console.error('[subscribe] Supabase fetch failed:', err);
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
      replyTo: 'ctledmyr@gmail.com',
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
