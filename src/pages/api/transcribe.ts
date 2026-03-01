import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

export const prerender = false;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
type AllowedMediaType = (typeof ALLOWED_TYPES)[number];

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: 'Expected multipart/form-data.' }, 400);
  }

  const file = formData.get('image');

  if (!file || !(file instanceof File)) {
    return json({ error: 'An image file is required (field name: "image").' }, 400);
  }

  if (!ALLOWED_TYPES.includes(file.type as AllowedMediaType)) {
    return json({ error: 'Image must be JPEG, PNG, WebP, or GIF.' }, 400);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return json({ error: 'Image must be under 20 MB.' }, 400);
  }

  // Convert to base64 for the Anthropic API
  const arrayBuffer = await file.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString('base64');
  const mediaType = file.type as AllowedMediaType;

  const client = new Anthropic({ apiKey: import.meta.env.ANTHROPIC_API_KEY });

  let message: Anthropic.Message;
  try {
    message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: 'Please transcribe all the text in this image exactly as it appears. Preserve paragraph breaks and formatting where possible. Return only the transcribed text — no commentary, no explanation.',
            },
          ],
        },
      ],
    });
  } catch (err) {
    console.error('[transcribe] Anthropic API error:', err);
    const message = err instanceof Error ? err.message : 'Transcription failed.';
    return json({ error: message }, 500);
  }

  const firstBlock = message.content[0];
  const transcribed = firstBlock?.type === 'text' ? firstBlock.text : '';

  if (!transcribed) {
    return json({ error: 'No text could be extracted from this image.' }, 422);
  }

  return json({ text: transcribed });
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
