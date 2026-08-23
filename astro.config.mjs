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
  },
});
