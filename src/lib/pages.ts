import fs from 'node:fs';
import path from 'node:path';
import { formatPageTitle, SITE_URL } from '../data/site';

export interface PageMeta {
  title: string;
  description: string;
  bodyClass: string;
  ogImage?: string;
  canonicalUrl: string;
  hasPageCss?: boolean;
}

const CANONICAL_PATHS: Record<string, string> = {
  index: '/',
  'gipergidroz-ladoney': '/gipergidroz-ladoney',
  'gipergidroz-podmyshek': '/gipergidroz-podmyshek',
  'gipergidroz-stop': '/gipergidroz-stop',
};

export function loadPage(slug: string): { meta: PageMeta; bodyHtml: string } {
  const rawPath = path.join('src/raw', `${slug}.html`);
  const bodyPath = path.join('src/content/body', `${slug}.html`);
  const raw = fs.readFileSync(rawPath, 'utf8');

  const rawTitle = raw.match(/<title>([^<]*)</)?.[1]?.trim() ?? '';
  const description =
    raw.match(/<meta name="description" content="([^"]*)"/)?.[1]?.trim() ?? '';
  const bodyClass = raw.match(/<body class="([^"]*)"/)?.[1]?.trim() ?? '';
  const ogImage = raw.match(/<meta property="og:image" content="([^"]*)"/)?.[1]?.trim();
  const canonicalPath = CANONICAL_PATHS[slug] ?? `/${slug}`;

  return {
    meta: {
      title: formatPageTitle(rawTitle),
      description,
      bodyClass,
      ogImage: ogImage || undefined,
      canonicalUrl: `${SITE_URL}${canonicalPath}`,
      hasPageCss: slug === 'index',
    },
    bodyHtml: fs.readFileSync(bodyPath, 'utf8'),
  };
}
