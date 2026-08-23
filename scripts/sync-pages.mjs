import fs from 'node:fs';

const pages = [
  'index',
  'gipergidroz-podmyshek',
];

function extractBody(html) {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!m) return '';
  let body = m[1];
  body = body.replace(/<script[^>]*bitrix\.info[\s\S]*?<\/script>/gi, '');
  body = body.replace(/\/gipergidroz-ladoney\.php/g, '/gipergidroz-ladoney');
  body = body.replace(/\/gipergidroz-podmyshek\.php/g, '/gipergidroz-podmyshek');
  body = body.replace(/\/gipergidroz-stop\.php/g, '/gipergidroz-stop');
  return body.trim();
}

for (const name of pages) {
  const raw = fs.readFileSync(`src/raw/${name}.html`, 'utf8');
  fs.writeFileSync(`src/content/body/${name}.html`, extractBody(raw));
  console.log('Synced', name);
}
