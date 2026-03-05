interface EmailTemplateData {
  postTitle: string;
  postURL: string;
  siteURL?: string;
  postContent?: string;
  unsubscribeURL: string;
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
    .map(para => `<p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #333333;">${escapeHTML(para).replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

export function generateWelcomeEmailHTML({ siteURL, unsubscribeURL }: { siteURL?: string; unsubscribeURL: string }): string {
  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Välkommen till Things Written</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Georgia, 'Times New Roman', serif;">
  <div style="display:none;font-size:1px;color:#f4f4f4;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    &#8199;${'&#847;&#8199;'.repeat(80)}
  </div>
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
                Things Written
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 20px 0; font-size: 26px; line-height: 1.3;
                         color: #111111; font-weight: normal;">
                Välkommen!
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #333333;">Kul att du är här! Du kommer nu att få ett mejl varje gång något nytt publiceras på Things Written.</p>
              ${siteURL
                ? `<!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius: 4px; background-color: #111111;">
                    <a href="${escapeHTML(siteURL)}"
                       style="display: inline-block; padding: 14px 28px;
                              font-family: Arial, sans-serif; font-size: 15px;
                              color: #ffffff; text-decoration: none;
                              border-radius: 4px; font-weight: bold;">
                      Besök Things Written
                    </a>
                  </td>
                </tr>
              </table>`
                : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9f9f9;
                       border-top: 1px solid #eeeeee;">
              <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px;
                        color: #aaaaaa; line-height: 1.6;">
                Du får det här e-postmeddelandet eftersom du prenumererar${siteURL ? ` på <a href="${escapeHTML(siteURL)}" style="color: #aaaaaa;">${escapeHTML(siteURL)}</a>` : ''}.
              </p>
              <p style="margin: 8px 0 0 0; font-family: Arial, sans-serif; font-size: 12px;
                        color: #aaaaaa; line-height: 1.6;">
                <a href="${escapeHTML(unsubscribeURL)}" style="color: #aaaaaa;">Avsluta prenumeration</a>
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

export function generateEmailHTML({ postTitle, postURL, siteURL, postContent, unsubscribeURL }: EmailTemplateData): string {
  const safeTitle = escapeHTML(postTitle);
  const safeURL = escapeHTML(postURL);

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${safeTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Georgia, 'Times New Roman', serif;">
  <div style="display:none;font-size:1px;color:#f4f4f4;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    &#8199;${'&#847;&#8199;'.repeat(80)}
  </div>
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
                Things Written
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
                : `<p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.7; color: #555555;">Ett nytt inlägg har publicerats. Klicka på knappen nedan för att läsa det.</p>`
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
                      Läs online
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9f9f9;
                       border-top: 1px solid #eeeeee;">
              <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px;
                        color: #aaaaaa; line-height: 1.6;">
                Du får det här e-postmeddelandet eftersom du prenumererar${siteURL ? ` på <a href="${escapeHTML(siteURL)}" style="color: #aaaaaa;">${escapeHTML(siteURL)}</a>` : ''}.
              </p>
              <p style="margin: 8px 0 0 0; font-family: Arial, sans-serif; font-size: 12px;
                        color: #aaaaaa; line-height: 1.6;">
                <a href="${escapeHTML(unsubscribeURL)}" style="color: #aaaaaa;">Avsluta prenumeration</a>
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
