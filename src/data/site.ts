export const SITE_HOST = 'gipergidroz.su';
export const SITE_URL = 'https://gipergidroz.su';

export function formatPageTitle(title: string): string {
  const base = title
    .replace(new RegExp(`\\s*[—–|]\\s*${SITE_HOST.replace('.', '\\.')}\\s*$`, 'i'), '')
    .trim();
  return `${base} — ${SITE_HOST}`;
}
