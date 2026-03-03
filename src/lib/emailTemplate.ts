interface EmailTemplateData {
  postTitle: string;
  postURL: string;
  siteURL?: string;
  postContent?: string;
}

/**
 * Escape HTML special characters to prevent XSS in email bodies.
 */
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate a table-based HTML email (compatible with most email clients).
 * Inline styles only — no external CSS, no Grid/Flexbox.
 */
/**
 * Convert plain text to email-safe HTML paragraphs.
 * Splits on blank lines (double newlines) to form paragraphs; escapes all HTML.
 */
function contentToHTML(text: string): string {
  return text
    .trim()
    .split(/\n\n+/)
    .map(para => `<p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #333333;">${escapeHTML(para.replace(/\n/g, ' '))}</p>`)
    .join('\n');
}

export function generateEmailHTML({ postTitle, postURL, siteURL, postContent }: EmailTemplateData): string {
  const safeTitle = escapeHTML(postTitle);
  const safeURL = escapeHTML(postURL);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${safeTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Georgia, 'Times New Roman', serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
         style="background-color: #f4f4f4;">
    <tr>
      <td style="padding: 40px 20px;">
        <!-- Outer container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0"
               align="center" width="600"
               style="max-width: 600px; width: 100%; background-color: #ffffff;
                      border-radius: 4px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #111111; padding: 24px 40px;">
              <p style="margin: 0; font-family: Arial, sans-serif; font-size: 14px;
                        color: #ffffff; letter-spacing: 0.1em; text-transform: uppercase;">
                New Post
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 20px 0; font-size: 26px; line-height: 1.3;
                         color: #111111; font-weight: normal;">
                ${safeTitle}
              </h1>
              ${postContent
                ? `<div style="margin: 0 0 32px 0;">${contentToHTML(postContent)}</div>`
                : `<p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.7; color: #555555;">A new post has been published. Click the button below to read it.</p>`
              }
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius: 4px; background-color: #111111;">
                    <a href="${safeURL}"
                       style="display: inline-block; padding: 14px 28px;
                              font-family: Arial, sans-serif; font-size: 15px;
                              color: #ffffff; text-decoration: none;
                              border-radius: 4px; font-weight: bold;">
                      Read Post &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <!-- Fallback link -->
              <p style="margin: 20px 0 0 0; font-size: 13px; color: #999999;">
                Or copy this link into your browser:<br>
                <a href="${safeURL}" style="color: #555555;">${safeURL}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9f9f9;
                       border-top: 1px solid #eeeeee;">
              <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px;
                        color: #aaaaaa; line-height: 1.6;">
                You're receiving this because you subscribed${siteURL ? ` at <a href="${escapeHTML(siteURL)}" style="color: #aaaaaa;">${escapeHTML(siteURL)}</a>` : ''}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
