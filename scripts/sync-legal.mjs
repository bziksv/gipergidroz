import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const srcDir = path.join(root, '../gnkmed/legal-html');
const outDir = path.join(root, 'src/content/legal');

const MAP = [
  { src: 'legal-cookie.html', out: 'cookie.html', h1: 'Политика использования cookie-файлов' },
  { src: 'legal-personal-data.html', out: 'personal-data.html', h1: 'Политика обработки персональных данных' },
  { src: 'legal-consent.html', out: 'consent.html', h1: 'Согласие на обработку персональных данных' },
  { src: 'legal-recommendation.html', out: 'recommendation.html', h1: 'Правила применения рекомендательных технологий' },
];

const legal = JSON.parse(fs.readFileSync(path.join(root, 'src/data/legal.json'), 'utf8'));

function extractLegalDoc(html) {
  const m = html.match(/<div class="legal-doc[\s\S]*<\/div>\s*(?=<\/article>)/);
  return m ? m[0] : '';
}

function adapt(text) {
  let s = text;
  s = s.replace(/ООО «Гжельская независимая компания» \(ООО «ГНК»\)/g, legal.operator_name);
  s = s.replace(/ООО «ГНК»/g, 'Оператор');
  s = s.replace(/5040062267/g, legal.inn);
  s = s.replace(/504001001/g, '');
  s = s.replace(/1045007908175/g, legal.ogrn);
  s = s.replace(/https:\/\/gnkmed\.ru\//g, legal.site);
  s = s.replace(/gnkmed\.ru/g, legal.site_host);
  s = s.replace(/info@gnkmed\.ru/g, legal.email);
  s = s.replace(/\+78005519039/g, legal.phone_href);
  s = s.replace(/8-800-551-90-39/g, legal.phone);
  s = s.replace(
    /140103, Россия, Московская обл., г. Раменское, ул. Чугунова, д. 14/g,
    legal.address_legal,
  );
  s = s.replace(/\/legal\/gnkmed-pdn-policy\//g, '/docs/gipergidroz-personal-data/');
  s = s.replace(/\/legal\/gnkmed-pdn-consent\//g, '/docs/gipergidroz-data-consent/');
  s = s.replace(/\/legal\/gnkmed-cookie-policy\//g, '/docs/gipergidroz-cookies/');
  s = s.replace(/\/legal\/gnkmed-recommendation-rules\//g, '/docs/gipergidroz-recommendations/');

  // gipergidroz: landing + forms, not full e-commerce
  s = s.replace(
    /На Сайте используются cookie-файлы и аналогичные технологии сервисов Яндекс\.Метрики, Roistat, Google reCAPTCHA, а также cookie-файлы платформы 1С-Битрикс, необходимые для работы корзины, личного кабинета и оформления заказов\./,
    'На Сайте используются cookie-файлы и аналогичные технологии сервиса Яндекс.Метрики, а также технические cookie-файлы для работы форм заявок и навигации.',
  );
  s = s.replace(/корзины, личного кабинета и оформления заказов/g, 'форм заявок и навигации');
  s = s.replace(/корзины и других функций/g, 'форм заявок и других функций');
  s = s.replace(/корзины, личного кабинета и оформления заказов/g, 'форм заявок');
  s = s.replace(/обеспечение корректной работы сайта, навигации, корзины/g, 'обеспечение корректной работы сайта, навигации, форм заявок');
  s = s.replace(/обеспечение корректной работы сайта, навигации, корзины товаров/g, 'обеспечение корректной работы сайта, навигации, форм заявок');

  // Third parties — gipergidroz stack
  const thirdParties = `
    <ul>
        <li>ООО «Яндекс» (ИНН 7736207543) — <a href="https://yandex.ru/" target="_blank" rel="noopener">Яндекс.Метрика</a>, сервисы аналитики;</li>
        <li>jsDelivr (<a href="https://www.jsdelivr.com/" target="_blank" rel="noopener">cdn.jsdelivr.net</a>) — подгрузка библиотек (lazyload, intersection-observer);</li>
        <li>шаблон ranx-landing (статические ресурсы сайта, ранее платформа 1С-Битрикс);</li>
        <li>партнёрам по доставке (курьерские и транспортные компании) для доставки аппарата;</li>
        <li>платёжным операторам (банки, процессинговые центры) при оплате заказа;</li>
        <li>IT-подрядчикам для технической поддержки;</li>
        <li>государственным органам по законным требованиям;</li>
        <li>иным лицам в случаях, предусмотренных законодательством РФ или с согласия Субъекта;</li>
    </ul>`;

  s = s.replace(
    /<p>4\.3\. Оператор вправе передавать[\s\S]*?<\/ul>/,
    `<p>4.3. Оператор вправе передавать персональные данные (предоставление, доступ) и/или поручать обработку следующим третьим лицам в объёме, необходимом для целей Политики:</p>${thirdParties}`,
  );

  const consentThird = `
    <ul>
        <li>ООО «Яндекс» (ИНН 7736207543) (Яндекс.Метрика) — <a href="https://yandex.ru/" target="_blank" rel="noopener">https://yandex.ru/</a>;</li>
        <li>jsDelivr (cdn.jsdelivr.net) — <a href="https://www.jsdelivr.com/" target="_blank" rel="noopener">https://www.jsdelivr.com/</a>;</li>
        <li>партнёрам по доставке (курьерские службы, транспортные компании);</li>
        <li>платёжным операторам (банки, процессинговые центры);</li>
        <li>государственным органам по законным требованиям;</li>
        <li>IT-подрядчикам для технической поддержки сервисов;</li>
        <li>в иных случаях, предусмотренных законодательством РФ;</li>
    </ul>`;

  s = s.replace(
    /<p>4\.1\. Субъект персональных данных согласен[\s\S]*?<\/ul>\s*<p>4\.2\./,
    `<p>4.1. Субъект персональных данных согласен с тем, что персональные данные могут быть переданы следующим третьим лицам:</p>${consentThird}<p>4.2.`,
  );

  s = s.replace(
    /<p>7\.3\. Для аналитики использования Сайта Оператор применяет Яндекс\.Метрику[\s\S]*?и сервис Roistat\.<\/p>/,
    '<p>7.3. Для аналитики использования Сайта Оператор применяет Яндекс.Метрику (<a href="https://yandex.ru/legal/confidential/" target="_blank" rel="noopener">политика конфиденциальности Яндекса</a>).</p>',
  );

  const recServices = `
    <ul>
        <li><a href="https://mc.yandex.ru/" target="_blank" rel="noopener">https://mc.yandex.ru/</a> — сервис Яндекс.Метрики; сбор и анализ статистики посещений и действий пользователей;</li>
        <li><a href="https://www.jsdelivr.com/" target="_blank" rel="noopener">https://www.jsdelivr.com/</a> — CDN jsDelivr; подгрузка библиотек для работы интерфейса;</li>
        <li><a href="https://drive.google.com/" target="_blank" rel="noopener">https://drive.google.com/</a> — встраивание видеоинструкций на Сайте.</li>
    </ul>
    <p>На Сайте могут использоваться встроенные блоки с информацией о товарах и услугах Оператора на основе популярности страниц и поведения пользователей.</p>`;

  s = s.replace(
    /<p>Для привлечения посетителей[\s\S]*?<\/ul>\s*<p>На Сайте также применяются встроенные рекомендательные блоки каталога[\s\S]*?<\/p>/,
    `<p>Для анализа посещений и действий на Сайте <a href="${legal.site}">${legal.site_host}</a> используются следующие технологии:</p>${recServices}`,
  );

  s = s.replace(/<p>КПП: <\/p>\n/g, '');
  s = s.replace(/<p>КПП: <\/p>/g, '');

  return s;
}

fs.mkdirSync(outDir, { recursive: true });

for (const { src, out, h1 } of MAP) {
  const raw = fs.readFileSync(path.join(srcDir, src), 'utf8');
  const doc = adapt(extractLegalDoc(raw));
  const fragment = `<article class="legal-page">
    <a class="legal-page__back" href="/">← На главную gipergidroz.su</a>
    <h1 class="legal-page__title">${h1}</h1>
    ${doc}
</article>`;
  fs.writeFileSync(path.join(outDir, out), fragment);
  console.log('Synced', out);
}
