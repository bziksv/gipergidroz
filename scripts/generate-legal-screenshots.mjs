import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';

const baseUrl = process.env.BASE_URL || 'http://localhost:47821';
const outDir = path.resolve('public/docs/previews');

const pages = [
  'gipergidroz-cookies',
  'gipergidroz-personal-data',
  'gipergidroz-data-consent',
  'gipergidroz-recommendations',
];

fs.mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 2 });

for (const slug of pages) {
  const url = `${baseUrl}/docs/${slug}`;
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
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
