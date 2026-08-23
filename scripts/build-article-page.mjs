import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const indexBody = fs.readFileSync(path.join(root, 'src/content/body/index.html'), 'utf8');

const chromeEnd = indexBody.indexOf('<div id="blocks_wrapper"');
const tailStart = indexBody.indexOf('<div class="up-button-wrap">');
if (chromeEnd < 0 || tailStart < 0) {
  console.error('Could not split index.html');
  process.exit(1);
}

const chrome = indexBody.slice(0, chromeEnd);
const tail = indexBody.slice(tailStart);

const videoBlock = fs.readFileSync(
  path.join(root, 'src/content/article/video-instruction-block.html'),
  'utf8',
);

function withVideoBlock(articleInner) {
  if (articleInner.includes('id="video-instrukciya"')) {
    return articleInner;
  }

  let html = articleInner.replace(
    /(<li><a href="#(?:ladoni|podmyshek|stop)-procedura">[^<]+<\/a><\/li>\n)/,
    '$1      <li><a href="#video-instrukciya">Видеоинструкция</a></li>\n',
  );

  const priceSection = '\n  <section class="seo-block" id="klinika-tseny">';
  if (!html.includes(priceSection)) {
    console.error('Could not insert video block before klinika-tseny');
    process.exit(1);
  }

  return html.replace(priceSection, `\n${videoBlock}${priceSection}`);
}

function buildPage({ slug, articleFile, title, description, bodyClass = 'page-index' }) {
  const articleInner = withVideoBlock(
    fs.readFileSync(path.join(root, 'src/content/article', articleFile), 'utf8'),
  );

  const body = `${chrome}
<div id="blocks_wrapper" data-landing-id="article" data-mode="element" data-section-type="4">
${articleInner}
</div>
${tail}`;

  fs.writeFileSync(path.join(root, 'src/content/body', `${slug}.html`), body);

  const rawHead = `<!DOCTYPE html>
<html xml:lang="ru" lang="ru">
<head>
\t<meta http-equiv="X-UA-Compatible" content="IE=edge">
\t<meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="shortcut icon" href="/bitrix/templates/ranx-landing/assets/img/favicon.ico" type="image/x-icon"/>
\t<title>${title}</title>
\t<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="description" content="${description}" />
<style>body{font-family: "IBM Plex Sans", Arial, sans-serif;}</style>
</head>
<body class="${bodyClass}">
${body}
</body>
</html>`;

  fs.writeFileSync(path.join(root, 'src/raw', `${slug}.html`), rawHead);
  console.log(`Built ${slug} page body`);
}

buildPage({
  slug: 'gipergidroz-ladoney',
  articleFile: 'gipergidroz-ladoney-inner.html',
  title: 'Лечение гипергидроза ладоней – избавьтесь от повышенной потливости рук',
  description:
    'Гипергидроз ладоней: причины, симптомы и лечение ионофорезом дома. Купить аппарат SwiSto3 на gipergidroz.su — доставка по России.',
});

buildPage({
  slug: 'gipergidroz-podmyshek',
  articleFile: 'gipergidroz-podmyshek-inner.html',
  title: 'Лечение гипергидроза подмышек – избавьтесь от повышенной потливости',
  description:
    'Гипергидроз подмышек: причины, симптомы и лечение ионофорезом дома. Купить аппарат SwiSto3 на gipergidroz.su — доставка по России, электроды для подмышек в комплекте.',
});

buildPage({
  slug: 'gipergidroz-stop',
  articleFile: 'gipergidroz-stop-inner.html',
  title: 'Лечение гипергидроза стоп – как избавиться от повышенной потливости ног',
  description:
    'Гипергидроз стоп: причины, запах, грибок и лечение ионофорезом дома. Купить аппарат SwiSto3 на gipergidroz.su — ванночки для стоп, доставка по России.',
});
