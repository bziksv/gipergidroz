import fs from 'node:fs';
import path from 'node:path';

export interface PageMeta {
  title: string;
  description: string;
  bodyClass: string;
  ogImage?: string;
  hasPageCss?: boolean;
}

export function loadPage(slug: string): { meta: PageMeta; bodyHtml: string } {
  const rawPath = path.join('src/raw', `${slug}.html`);
  const bodyPath = path.join('src/content/body', `${slug}.html`);
  const raw = fs.readFileSync(rawPath, 'utf8');

  const title = raw.match(/<title>([^<]*)</)?.[1]?.trim() ?? '';
  const description =
    raw.match(/<meta name="description" content="([^"]*)"/)?.[1]?.trim() ?? '';
  const bodyClass = raw.match(/<body class="([^"]*)"/)?.[1]?.trim() ?? '';
  const ogImage = raw.match(/<meta property="og:image" content="([^"]*)"/)?.[1]?.trim();

  return {
    meta: {
      title,
      description,
      bodyClass,
      ogImage: ogImage || undefined,
      hasPageCss: slug === 'index',
    },
    bodyHtml: fs.readFileSync(bodyPath, 'utf8'),
  };
}
