interface EmailTemplateData {
  postTitle: string;
  postURL: string;
  postContent?: string;
  unsubscribeURL: string;
}

interface EmailResult {
  html: string;
  text: string;
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const BULLET_RE = /^\s*[-*+]\s+/;
const isBulletLine = (line: string) => BULLET_RE.test(line);

function contentToHTML(text: string): string {
  return text
    .trim()
    .split(/\n\n+/)
    .map(block => {
      const lines = block.split('\n');
      const hasBullet = lines.some(isBulletLine);
      const allBulletOrBlank = lines.every(line => isBulletLine(line) || line.trim() === '');

      if (hasBullet && allBulletOrBlank) {
        const items = lines
          .filter(isBulletLine)
          .map(line => {
            const itemContent = line.replace(BULLET_RE, '');
            return `<li style="margin: 0 0 8px 0; font-size: 11pt; line-height: 1.7; mso-line-height-rule: exactly;">${escapeHTML(itemContent)}</li>`;
          })
          .join('\n');
        return `<ul style="margin: 0 0 16px 0; padding-left: 24px; font-size: 11pt; line-height: 1.7; mso-line-height-rule: exactly;">\n${items}\n</ul>`;
      }

      return `<p style="margin: 0 0 16px 0; font-size: 11pt; line-height: 1.7; mso-line-height-rule: exactly;">${escapeHTML(block).replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');
}

function wrapHTML(body: string, footer: string): string {
  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, h1, a, span, div, li, ul {
      font-family: Aptos, Calibri, sans-serif !important;
      font-size: 11pt !important;
      mso-line-height-rule: exactly;
    }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Aptos, Calibri, sans-serif; color: #333333; font-size: 11pt; line-height: 1.7; mso-line-height-rule: exactly;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0; padding: 40px 20px;">
    <tr>
      <td style="font-family: Aptos, Calibri, sans-serif; font-size: 11pt; line-height: 1.7; color: #333333; mso-line-height-rule: exactly;">
        ${body}
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dddddd; font-size: 13px; color: #999999; line-height: 1.8; mso-line-height-rule: exactly;">
          ${footer}
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateWelcomeEmail({ unsubscribeURL }: { unsubscribeURL: string }): EmailResult {
  const html = wrapHTML(
    `<p style="margin: 0 0 16px 0; font-size: 11pt; line-height: 1.7; mso-line-height-rule: exactly;">Hall&aring; d&auml;r,</p>
    <p style="margin: 0 0 16px 0; font-size: 11pt; line-height: 1.7; mso-line-height-rule: exactly;">Nu kommer du f&aring; alla nya texter levererade till din inkorg!</p>
    <p style="margin: 0 0 16px 0; font-size: 11pt; line-height: 1.7; mso-line-height-rule: exactly;">F&ouml;rhoppningsvis landade det h&auml;r mailet i din vanliga inkorg. I s&aring; fall kan vi b&aring;da andas ut.</p>
    <p style="margin: 0 0 16px 0; font-size: 11pt; line-height: 1.7; mso-line-height-rule: exactly;">Om (ve och fasa) det hamnade i din skr&auml;ppost beh&ouml;ver du trycka p&aring; knappen som s&auml;ger n&aring;got i stil med &rdquo;det h&auml;r &auml;r inte skr&auml;ppost&rdquo;.</p>
    <p style="margin: 0 0 16px 0; font-size: 11pt; line-height: 1.7; mso-line-height-rule: exactly;">Vi h&ouml;rs,<br>CT</p>
    <p style="font-size: 14px; color: #777777; font-style: italic; line-height: 1.7; mso-line-height-rule: exactly;">PS. N&auml;r mina texter k&auml;nns mer som spam &auml;n l&auml;sgl&auml;dje, finns det nog en knapp n&aring;gonstans f&ouml;r att avsluta prenumerationen och bli av med mig. Men den f&aring;r du hitta sj&auml;lv.</p>`,
    `<p style="margin: 0 0 4px 0; font-size: 13px; line-height: 1.8; mso-line-height-rule: exactly;">Du prenumererar p&aring; <a href="https://www.thingswritten.se" style="color: #999999; font-size: 13px;">Things Written</a></p>
    <p style="margin: 0; font-size: 13px; line-height: 1.8; mso-line-height-rule: exactly;">Vill du avsluta prenumerationen? <a href="${escapeHTML(unsubscribeURL)}" style="color: #999999; font-size: 13px;">Avprenumerera</a></p>`
  );

  const text = `Hallå där,

Nu kommer du få alla nya texter levererade till din inkorg!

Förhoppningsvis landade det här mailet i din vanliga inkorg. I så fall kan vi båda andas ut.

Om (ve och fasa) det hamnade i din skräppost behöver du trycka på knappen som säger något i stil med ”det här är inte skräppost”.

Vi hörs,
CT

PS. När mina texter känns mer som spam än läsglädje, finns det nog en knapp någonstans för att avsluta prenumerationen och bli av med mig. Men den får du hitta själv.

---
Du prenumererar på Things Written (https://www.thingswritten.se)
Vill du avsluta prenumerationen? Avprenumerera (${unsubscribeURL})`;

  return { html, text };
}

export function generateEmail({ postTitle: _postTitle, postURL, postContent, unsubscribeURL }: EmailTemplateData): EmailResult {
  const safeURL = escapeHTML(postURL);

  const bodyHTML = postContent?.trim()
    ? contentToHTML(postContent)
    : `<p style="margin: 0 0 16px 0; font-size: 11pt; line-height: 1.7; mso-line-height-rule: exactly;">Ett nytt inl&auml;gg har publicerats.</p>`;

  const bodyText = postContent?.trim()
    ? postContent.trim()
    : 'Ett nytt inlägg har publicerats.';

  // Post title intentionally omitted from the body — it already appears as the email subject.
  const html = wrapHTML(
    bodyHTML,
    `<p style="margin: 0 0 4px 0; font-size: 13px; line-height: 1.8; mso-line-height-rule: exactly;"><a href="${safeURL}" style="color: #999999; font-size: 13px;">L&auml;s texten online</a></p>
    <p style="margin: 0 0 4px 0; font-size: 13px; line-height: 1.8; mso-line-height-rule: exactly;">Du prenumererar p&aring; <a href="https://www.thingswritten.se" style="color: #999999; font-size: 13px;">Things Written</a></p>
    <p style="margin: 0; font-size: 13px; line-height: 1.8; mso-line-height-rule: exactly;">Vill du avsluta prenumerationen? <a href="${escapeHTML(unsubscribeURL)}" style="color: #999999; font-size: 13px;">Avprenumerera</a></p>`
  );

  const text = `${bodyText}

---
Läs texten online (${postURL})
Du prenumererar på Things Written (https://www.thingswritten.se)
Vill du avsluta prenumerationen? Avprenumerera (${unsubscribeURL})`;

  return { html, text };
}
