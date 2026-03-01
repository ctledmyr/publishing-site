export const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24; // 24 hours

/**
 * Sign a string payload using HMAC-SHA256 via the Web Crypto API.
 * Uses the global `crypto.subtle` (available in Node 18+ and Vercel's runtime).
 */
async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Buffer.from(signature).toString('base64url');
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Create a signed session cookie value.
 * Format: base64url(payload).base64url(HMAC-SHA256(payload, secret))
 */
export async function createSessionCookie(secret: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = Buffer.from(JSON.stringify({ authenticated: true, exp })).toString('base64url');
  const signature = await signPayload(payload, secret);
  return `${payload}.${signature}`;
}

/**
 * Verify a session cookie value. Returns true if valid and not expired.
 */
export async function verifySessionCookie(cookieValue: string, secret: string): Promise<boolean> {
  const dotIndex = cookieValue.lastIndexOf('.');
  if (dotIndex === -1) return false;

  const payload = cookieValue.slice(0, dotIndex);
  const signature = cookieValue.slice(dotIndex + 1);

  if (!payload || !signature) return false;

  // Verify HMAC signature
  const expectedSignature = await signPayload(payload, secret);
  if (!safeEqual(expectedSignature, signature)) return false;

  // Verify expiry
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    return decoded.authenticated === true && decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
