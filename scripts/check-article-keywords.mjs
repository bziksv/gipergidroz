#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const page = process.argv[2] ?? 'ladoney';

const PAGE_CONFIG = {
  ladoney: {
    targets: 'keyword-targets.json',
    article: 'gipergidroz-ladoney-inner.html',
  },
  podmyshek: {
    targets: 'keyword-targets-podmyshek.json',
    article: 'gipergidroz-podmyshek-inner.html',
  },
  stop: {
    targets: 'keyword-targets-stop.json',
    article: 'gipergidroz-stop-inner.html',
  },
};

const cfg = PAGE_CONFIG[page];
if (!cfg) {
  console.error(`Unknown page: ${page}. Use: ladoney | podmyshek | stop`);
  process.exit(1);
}

const targetsPath = path.join(root, 'src/data', cfg.targets);
const articlePath = path.join(root, 'src/content/article', cfg.article);

const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));
const html = fs.readFileSync(articlePath, 'utf8');
const text = html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .toLowerCase();

/** Stem → regex for morphological variants in Russian */
const STEM_PATTERNS = {
  мочь: 'моч|мож',
  можно: 'можно',
  быть: 'был|была|было|были|будет|будут|быть|есть|является|являются|являться',
  дать: 'да(?:ть|ст|н|ёт|ю|ем|ёте|вать|вш)',
  который: 'котор',
  являться: 'явля',
  следовать: 'след(?:у|ова)',
  повысить: 'повыс',
  отправить: 'отправ',
  использовать: 'использ',
  использование: 'использован',
  связанный: 'связан',
  подробный: 'подробн',
  частый: 'част',
  первый: 'перв',
  вторичный: 'вторичн',
  первичный: 'первичн',
  постоянный: 'постоянн',
  персональный: 'персональн',
  необходимый: 'необходим',
  медицинский: 'медицинск',
  лазерный: 'лазерн',
  хирургический: 'хирургическ',
  нервный: 'нервн',
  потовой: 'потов',
  антиперспирант: 'антиперспирант',
  ботулотоксин: 'ботулотоксин',
  конфиденциальность: 'конфиденциальн',
  приём: 'при[её]м',
  прием: 'при[её]м',
  записаться: 'запис',
  заявка: 'заявк',
  консультация: 'консультац',
  рекомендация: 'рекомендац',
  исследование: 'исследован',
  программа: 'программ',
  операция: 'операц',
  процедура: 'процедур',
  диагностика: 'диагност',
  симптом: 'симптом',
  причина: 'причин',
  заболевание: 'заболеван',
  болезнь: 'болезн',
  нарушение: 'нарушен',
  потоотделение: 'потоотделен',
  потливость: 'потливост',
  гипергидроз: 'гипергидроз',
  ладонь: 'ладон',
  подмышка: 'подмыш',
  запах: 'запах',
  купить: 'куп',
  дезодорант: 'дезодорант',
  аксиллярный: 'аксилл',
  избавиться: 'избав',
  одежда: 'одежд',
  стопа: 'стоп',
  нога: 'ног',
  обувь: 'обув',
  грибок: 'гриб',
  ионофорез: 'ионофорез',
  аппарат: 'аппарат',
  домашний: 'домашн',
  сильный: 'сильн',
  неприятный: 'неприятн',
  помогать: 'помог',
  избавляться: 'избав',
  ступня: 'ступн',
  ванночка: 'ванноч',
  мазь: 'мазь',
  крем: 'крем',
  укол: 'укол',
  гигиена: 'гигиен',
  нормальный: 'нормальн',
  индивидуальный: 'индивидуальн',
  доставка: 'доставк',
  спб: 'спб',
  альмамед: 'альмамед',
  профессиональный: 'профессиональн',
  аптечный: 'аптечн',
  подошвенный: 'подошвен',
  эффективный: 'эффективн',
  вода: 'вод',
  носок: 'носк',
  курс: 'курс',
  повышенный: 'повышен',
  железа: 'желез',
  кожа: 'кож',
  лицо: 'лиц',
  рука: 'рук',
  тело: 'тел',
  зона: 'зон',
  область: 'област',
  организм: 'организм',
  человек: 'человек|люд',
  пациент: 'пациент',
  мужчина: 'мужчин',
  врач: 'врач',
  специалист: 'специалист',
  клиника: 'клиник',
  центр: 'центр',
  услуга: 'услуг',
  метод: 'метод',
  способ: 'способ',
  терапия: 'терап',
  лечение: 'лечен',
  препарат: 'препарат',
  средство: 'средств',
  эффект: 'эффект',
  результат: 'результат',
  отзыв: 'отзыв',
  цена: 'цен',
  акция: 'акц',
  анализ: 'анализ',
  узи: 'узи',
  ботокс: 'ботокс',
  диспорт: 'диспорт',
  инъекция: 'инъекц',
  коррекция: 'коррекц',
  удаление: 'удален',
  хирургия: 'хирург',
  пластика: 'пластик',
  лифтинг: 'лифтинг',
  омоложение: 'омоложен',
  косметология: 'косметолог',
  подология: 'подолог',
  москва: 'москв',
  онлайн: 'онлайн',
  сайт: 'сайт',
  телефон: 'телефон',
  контакт: 'контакт',
  заявка: 'заявк',
  запись: 'запис',
  политика: 'политик',
  согласие: 'соглас',
  cookie: 'cookie',
  лицензия: 'лиценз',
  условие: 'услов',
  информация: 'информац',
  статья: 'стать',
  вопрос: 'вопрос',
  помощь: 'помощ',
  здоровье: 'здоров',
  жизнь: 'жизн',
  качество: 'качеств',
  степень: 'степен',
  возраст: 'возраст',
  месяц: 'месяц',
  год: 'год',
  день: 'дн',
  время: 'врем',
  случай: 'случа',
  проблема: 'проблем',
  состояние: 'состоян',
  система: 'систем',
  влияние: 'влиян',
  стресс: 'стресс',
  форма: 'форм',
  общий: 'общ',
  другой: 'друг',
  один: 'одн',
  много: 'много',
  работа: 'работ',
  обработка: 'обработк',
  пот: 'пот',
};

function buildRegex(stem) {
  const pattern = STEM_PATTERNS[stem] ?? stem.replace(/ё/g, '[её]') + '\\w*';
  return new RegExp(pattern, 'gi');
}

function countStem(stem) {
  const regex = buildRegex(stem);
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

const rows = Object.entries(targets)
  .map(([stem, target]) => {
    const actual = countStem(stem);
    const pct = target > 0 ? Math.round((actual / target) * 100) : 100;
    return { stem, target, actual, pct };
  })
  .sort((a, b) => a.pct - b.pct);

const pad = (s, n) => String(s).padEnd(n);
const col = (s, n) => String(s).padStart(n);

const stemW = Math.max(16, ...rows.map((r) => r.stem.length));
console.log(`Страница: ${page}`);
console.log(`${pad('Слово', stemW)}  ${col('Цель', 6)}  ${col('Факт', 6)}  ${col('%', 5)}`);
console.log('-'.repeat(stemW + 24));

let totalTarget = 0;
let totalActual = 0;
let under70 = 0;

for (const { stem, target, actual, pct } of rows) {
  totalTarget += target;
  totalActual += Math.min(actual, target);
  if (pct < 70) under70++;
  const marker = pct < 70 ? ' ◀' : pct > 130 ? ' ▲' : '';
  console.log(
    `${pad(stem, stemW)}  ${col(target, 6)}  ${col(actual, 6)}  ${col(pct, 5)}${marker}`,
  );
}

console.log('-'.repeat(stemW + 24));
const overallPct = Math.round((totalActual / totalTarget) * 100);
console.log(
  `\nИтого: ${totalActual}/${totalTarget} (${overallPct}%), ниже 70%: ${under70} слов`,
);

process.exit(under70 > 0 ? 1 : 0);
