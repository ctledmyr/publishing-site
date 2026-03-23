interface EmailTemplateData {
  postTitle: string;
  postURL: string;
  postContent?: string;
  unsubscribeURL: string;
}

export function generateWelcomeEmail({ unsubscribeURL }: { unsubscribeURL: string }): string {
  return `Hallå där,

Ibland ser man saker där ute. Det kan vara en man som dansar naken på en strand (https://www.thingswritten.se/posts/vr-i-barcelona), eller en psykopat (https://www.thingswritten.se/posts/i-flygstolen), eller en herre som misstar sig när han tror att han har hittat någon att prata med (https://www.thingswritten.se/posts/ur-led-r-tiden).

Till synes värdsliga ting, men som man från tid till annan av någon anledning vill hänga kvar vid. Hänga kvar en stund innan det är dags att gå vidare.

Och nu när det händer mig och jag lyckas få ner det på papper dyker det upp din inbox.

Tack för att du vill vara med att läsa, hoppas att du gillar det!

/CT

PS. När mina texter känns mer som spam än läsglädje, finns det nog en knapp någonstans för att bli av med mig. Men den får du hitta själv.

---
Du prenumererar på Things Written (https://www.thingswritten.se)
Vill du avsluta prenumerationen? Avprenumerera (${unsubscribeURL})`;
}

export function generateEmail({ postTitle, postURL, postContent, unsubscribeURL }: EmailTemplateData): string {
  const body = postContent?.trim()
    ? `${postContent.trim()}\n`
    : 'Ett nytt inlägg har publicerats.\n';

  return `${postTitle}

${body}
---
Läs texten online (${postURL})
Du prenumererar på Things Written (https://www.thingswritten.se)
Vill du avsluta prenumerationen? Avprenumerera (${unsubscribeURL})`;
}
