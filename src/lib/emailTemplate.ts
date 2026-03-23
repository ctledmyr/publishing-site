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

function contentToHTML(text: string): string {
  return text
    .trim()
    .split(/\n\n+/)
    .map(para => `<p>${escapeHTML(para).replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

function wrapHTML(body: string, footer: string): string {
  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Georgia, 'Times New Roman', serif; color: #333333; font-size: 16px; line-height: 1.7;">
  <div style="max-width: 600px; margin: 0; padding: 40px 20px;">
    ${body}
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dddddd; font-size: 13px; color: #999999; line-height: 1.8;">
      ${footer}
    </div>
  </div>
</body>
</html>`;
}

export function generateWelcomeEmail({ unsubscribeURL }: { unsubscribeURL: string }): EmailResult {
  const html = wrapHTML(
    `<p>Hall&aring; d&auml;r,</p>
    <p>Ibland ser man saker d&auml;r ute. Det kan vara en man som <a href="https://www.thingswritten.se/posts/vr-i-barcelona" style="color: #333333;">dansar naken p&aring; en strand</a>, eller <a href="https://www.thingswritten.se/posts/i-flygstolen" style="color: #333333;">en psykopat</a>, eller en herre som misstar sig n&auml;r han tror att han har <a href="https://www.thingswritten.se/posts/ur-led-r-tiden" style="color: #333333;">hittat n&aring;gon att prata med</a>.</p>
    <p>Till synes v&auml;rdsliga ting, men som man fr&aring;n tid till annan av n&aring;gon anledning vill h&auml;nga kvar vid. H&auml;nga kvar en stund innan det &auml;r dags att g&aring; vidare.</p>
    <p>Och nu n&auml;r det h&auml;nder mig och jag lyckas f&aring; ner det p&aring; papper dyker det upp din inbox.</p>
    <p>Tack f&ouml;r att du vill vara med att l&auml;sa, hoppas att du gillar det!</p>
    <p>/CT</p>
    <p style="font-size: 14px; color: #777777; font-style: italic;">PS. N&auml;r mina texter k&auml;nns mer som spam &auml;n l&auml;sgl&auml;dje, finns det nog en knapp n&aring;gonstans f&ouml;r att bli av med mig. Men den f&aring;r du hitta sj&auml;lv.</p>`,
    `<p style="margin: 0 0 4px 0;">Du prenumererar p&aring; <a href="https://www.thingswritten.se" style="color: #999999;">Things Written</a></p>
    <p style="margin: 0;">Vill du avsluta prenumerationen? <a href="${escapeHTML(unsubscribeURL)}" style="color: #999999;">Avprenumerera</a></p>`
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

export function generateEmail({ postTitle, postURL, postContent, unsubscribeURL }: EmailTemplateData): EmailResult {
  const safeTitle = escapeHTML(postTitle);
  const safeURL = escapeHTML(postURL);

  const bodyHTML = postContent?.trim()
    ? contentToHTML(postContent)
    : `<p>Ett nytt inl&auml;gg har publicerats.</p>`;

  const bodyText = postContent?.trim()
    ? postContent.trim()
    : 'Ett nytt inlägg har publicerats.';

  const html = wrapHTML(
    `<h1 style="margin: 0 0 20px 0; font-size: 26px; line-height: 1.3; color: #111111; font-weight: normal;">${safeTitle}</h1>
    ${bodyHTML}`,
    `<p style="margin: 0 0 4px 0;"><a href="${safeURL}" style="color: #999999;">L&auml;s texten online</a></p>
    <p style="margin: 0 0 4px 0;">Du prenumererar p&aring; <a href="https://www.thingswritten.se" style="color: #999999;">Things Written</a></p>
    <p style="margin: 0;">Vill du avsluta prenumerationen? <a href="${escapeHTML(unsubscribeURL)}" style="color: #999999;">Avprenumerera</a></p>`
  );

  const text = `${postTitle}

${bodyText}

---
Läs texten online (${postURL})
Du prenumererar på Things Written (https://www.thingswritten.se)
Vill du avsluta prenumerationen? Avprenumerera (${unsubscribeURL})`;

  return { html, text };
}
