import { defineConfig } from 'astro/config';

export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  server: {
    port: 47821,
    strictPort: true,
    host: true,
  },
  redirects: {
    '/gipergidroz-ladoney.php': '/gipergidroz-ladoney',
    '/gipergidroz-podmyshek.php': '/gipergidroz-podmyshek',
    '/gipergidroz-stop.php': '/gipergidroz-stop',
    '/gipergidroz-lechenie': '/',
    '/gipergidroz-lechenie.php': '/',
    '/docs/gipergidroz-cookies': '/docs/previews/gipergidroz-cookies.png',
    '/docs/gipergidroz-cookies/': '/docs/previews/gipergidroz-cookies.png',
    '/docs/gipergidroz-personal-data': '/docs/previews/gipergidroz-personal-data.png',
    '/docs/gipergidroz-personal-data/': '/docs/previews/gipergidroz-personal-data.png',
    '/docs/gipergidroz-data-consent': '/docs/previews/gipergidroz-data-consent.png',
    '/docs/gipergidroz-data-consent/': '/docs/previews/gipergidroz-data-consent.png',
    '/docs/gipergidroz-recommendations': '/docs/previews/gipergidroz-recommendations.png',
    '/docs/gipergidroz-recommendations/': '/docs/previews/gipergidroz-recommendations.png',
  },
});
