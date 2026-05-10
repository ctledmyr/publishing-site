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
    <p style="margin: 0 0 16px 0; font-size: 11pt; line-height: 1.7; mso-line-height-rule: exactly;">Ibland ser man saker d&auml;r ute. Det kan vara en man som <a href="https://www.thingswritten.se/posts/vr-i-barcelona" style="color: #333333; font-size: 11pt;">dansar naken p&aring; en strand</a>, eller <a href="https://www.thingswritten.se/posts/i-flygstolen" style="color: #333333; font-size: 11pt;">en psykopat</a>, eller en herre som misstar sig n&auml;r han tror att han har <a href="https://www.thingswritten.se/posts/ur-led-r-tiden" style="color: #333333; font-size: 11pt;">hittat n&aring;gon att prata med</a>.</p>
    <p style="margin: 0 0 16px 0; font-size: 11pt; line-height: 1.7; mso-line-height-rule: exactly;">Till synes v&auml;rdsliga ting, men som man fr&aring;n tid till annan av n&aring;gon anledning vill h&auml;nga kvar vid. H&auml;nga kvar en stund innan det &auml;r dags att g&aring; vidare.</p>
    <p style="margin: 0 0 16px 0; font-size: 11pt; line-height: 1.7; mso-line-height-rule: exactly;">Och nu n&auml;r det h&auml;nder mig och jag lyckas f&aring; ner det p&aring; papper dyker det upp din inbox.</p>
    <p style="margin: 0 0 16px 0; font-size: 11pt; line-height: 1.7; mso-line-height-rule: exactly;">Tack f&ouml;r att du vill vara med att l&auml;sa, hoppas att du gillar det!</p>
    <p style="margin: 0 0 16px 0; font-size: 11pt; line-height: 1.7; mso-line-height-rule: exactly;">/CT</p>
    <p style="font-size: 14px; color: #777777; font-style: italic; line-height: 1.7; mso-line-height-rule: exactly;">PS. N&auml;r mina texter k&auml;nns mer som spam &auml;n l&auml;sgl&auml;dje, finns det nog en knapp n&aring;gonstans f&ouml;r att bli av med mig. Men den f&aring;r du hitta sj&auml;lv.</p>`,
    `<p style="margin: 0 0 4px 0; font-size: 13px; line-height: 1.8; mso-line-height-rule: exactly;">Du prenumererar p&aring; <a href="https://www.thingswritten.se" style="color: #999999; font-size: 13px;">Things Written</a></p>
    <p style="margin: 0; font-size: 13px; line-height: 1.8; mso-line-height-rule: exactly;">Vill du avsluta prenumerationen? <a href="${escapeHTML(unsubscribeURL)}" style="color: #999999; font-size: 13px;">Avprenumerera</a></p>`
  );

  const text = `Hallå där,

Ibland ser man saker där ute. Det kan vara en man som dansar naken på en strand (https://www.thingswritten.se/posts/vr-i-barcelona), eller en psykopat (https://www.thingswritten.se/posts/i-flygstolen), eller en herre som misstar sig när han tror att han har hittat någon att prata med (https://www.thingswritten.se/posts/ur-led-r-tiden).

Till synes värdsliga ting, men som man från tid till annan av någon anledning vill hänga kvar vid. Hänga kvar en stund innan det är dags att gå vidare.

Och nu när det händer mig och jag lyckas få ner det på papper dyker det upp din inbox.

Tack för att du vill vara med att läsa, hoppas att du gillar det!

/CT

PS. När mina texter känns mer som spam än läsglädje, finns det nog en knapp någonstans för att bli av med mig. Men den får du hitta själv.

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
