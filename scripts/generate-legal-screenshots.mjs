import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';

/**
 * Regenerates PNG previews from standalone HTML sources.
 * Sources: scripts/legal-screenshot-html/*.html (not published on the site).
 * Output: public/docs/previews/*.png
 */
const baseUrl = process.env.BASE_URL || 'http://localhost:47821';
const outDir = path.resolve('public/docs/previews');
const sourceDir = path.resolve('scripts/legal-screenshot-html');

const pages = [
  'gipergidroz-cookies',
  'gipergidroz-personal-data',
  'gipergidroz-data-consent',
  'gipergidroz-recommendations',
];

if (!fs.existsSync(sourceDir)) {
  console.error(
    'Missing scripts/legal-screenshot-html/. Add standalone HTML sources to regenerate previews.',
  );
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 2 });

for (const slug of pages) {
  const sourceFile = path.join(sourceDir, `${slug}.html`);
  if (!fs.existsSync(sourceFile)) {
    console.warn('Skip (no source):', sourceFile);
    continue;
  }
  const fileUrl = `file://${sourceFile}`;
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.evaluate(() => {
    document.querySelectorAll('.legal-page__back').forEach((el) => {
      el.remove();
    });
  });
  const file = path.join(outDir, `${slug}.png`);
  await page.screenshot({ path: file, fullPage: true, type: 'png' });
  console.log('Saved', file);
}

await browser.close();
