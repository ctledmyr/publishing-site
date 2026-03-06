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
  <title></title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Georgia, 'Times New Roman', serif;">
  <div style="font-size:1px;line-height:1px;max-height:0px;max-width:0px;overflow:hidden;mso-hide:all;color:#f4f4f4;">
    &#847;&zwnj;&nbsp;${'&#847;&zwnj;&nbsp;'.repeat(120)}
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
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #333333;">Hall&aring; d&auml;r,</p>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #333333;">Ibland ser man saker d&auml;r ute. Det kan vara en man som <a href="https://www.thingswritten.se/posts/vr-i-barcelona" style="color: #333333; text-decoration: underline;">dansar naken p&aring; en strand</a>, eller <a href="https://www.thingswritten.se/posts/i-flygstolen" style="color: #333333; text-decoration: underline;">en psykopat</a>, eller en herre som misstar sig n&auml;r han tror att han har <a href="https://www.thingswritten.se/posts/ur-led-r-tiden" style="color: #333333; text-decoration: underline;">hittat n&aring;gon att prata med</a>.</p>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #333333;">Till synes v&auml;rdsliga ting, men som man fr&aring;n tid till annan av n&aring;gon anledning vill h&auml;nga kvar vid. H&auml;nga kvar en stund innan det &auml;r dags att g&aring; vidare.</p>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #333333;">Och nu n&auml;r det h&auml;nder mig och jag lyckas f&aring; ner det p&aring; papper dyker det upp din inbox.</p>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #333333;">Tack f&ouml;r att du vill vara med att l&auml;sa, hoppas att du gillar det!</p>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #333333;">/CT</p>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.7; color: #777777; font-style: italic;">PS. N&auml;r mina texter k&auml;nns mer som spam &auml;n l&auml;sgl&auml;dje, finns det nog en knapp n&aring;gonstans f&ouml;r att bli av med mig. Men den f&aring;r du hitta sj&auml;lv.</p>
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius: 4px; background-color: #111111;">
                    <a href="https://www.thingswritten.se"
                       style="display: inline-block; padding: 14px 28px;
                              font-family: Arial, sans-serif; font-size: 15px;
                              color: #ffffff; text-decoration: none;
                              border-radius: 4px; font-weight: bold;">
                      Things Written
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

export function generateEmailHTML({ postTitle, postURL, siteURL, postContent, unsubscribeURL }: EmailTemplateData): string {
  const safeTitle = escapeHTML(postTitle);
  const safeURL = escapeHTML(postURL);

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title></title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Georgia, 'Times New Roman', serif;">
  <div style="font-size:1px;line-height:1px;max-height:0px;max-width:0px;overflow:hidden;mso-hide:all;color:#f4f4f4;">
    &#847;&zwnj;&nbsp;${'&#847;&zwnj;&nbsp;'.repeat(120)}
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
