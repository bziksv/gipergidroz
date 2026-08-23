# gipergidroz.su — Astro

Статический лендинг SwiSto3 (ООО «Альмамед»), перенесённый с Bitrix.

## Репозиторий

- GitHub: [github.com/bziksv/gipergidroz](https://github.com/bziksv/gipergidroz)

```bash
git clone https://github.com/bziksv/gipergidroz.git
cd gipergidroz
npm install
```

## Сервер (production)

| Параметр | Значение |
|----------|----------|
| Домен | [gipergidroz.su](https://gipergidroz.su/) |
| SSH | `vilmed` |
| Путь на сервере | `/var/www/amplipuls_su_usr/data/www/gipergidroz.su` |

### Деплой

```bash
./scripts/deploy-prod.sh
```

Скрипт: `npm ci` → `npm run build` → выкладка `dist/` на сервер → `git pull` в `_repo/` на сервере.

Ручной деплой:

```bash
npm run build
tar czf - -C dist . | ssh vilmed "cd /var/www/amplipuls_su_usr/data/www/gipergidroz.su && tar xzf -"
```

## Запуск локально

```bash
npm install
npm run dev
```

Сайт: http://localhost:47821

## Страницы

| URL | Описание |
|-----|----------|
| `/` | Главная |
| `/gipergidroz-ladoney` | Гипергидроз ладоней |
| `/gipergidroz-podmyshek` | Гипергидроз подмышек |
| `/gipergidroz-stop` | Гипергидроз стоп |
| `/gipergidroz-lechenie` | Обзор: лечение гипергидроза |

Редиректы с `.php` URL — в `astro.config.mjs`.

## SEO-статьи

- Исходники блоков: `src/content/article/*-inner.html`
- Сборка страниц: `node scripts/build-article-page.mjs`
- Проверка ключевых слов: `node scripts/check-article-keywords.mjs [ladoney|podmyshek|stop|lechenie]`
- Цели: `src/data/keyword-targets*.json`

## Юридические документы

| Страница | URL |
|----------|-----|
| Политика cookie | `/docs/gipergidroz-cookies` |
| Политика ПДн | `/docs/gipergidroz-personal-data` |
| Согласие на ПДн | `/docs/gipergidroz-data-consent` |
| Рекомендательные технологии | `/docs/gipergidroz-recommendations` |

Реквизиты оператора: `src/data/legal.json`. Синхронизация с gnkmed-шаблонами: `npm run sync:legal`.

## Формы заявок

- Модалки и согласие: `scripts/generate-bridge.mjs` → `public/js/bridge.js`
- **Локалка:** заявки в консоль браузера
- **Прод:** POST → `/api/submit.php` → email `sale@gipergidroz.su`, лог в `_submissions/` на сервере
- Настройки PHP: `public/api/config.php` (пример — `config.php.example`)

## Синхронизация контента с оригинала

```bash
# обновить src/raw/*.html с gipergidroz.su, затем:
npm run sync
```

## Сборка

```bash
npm run build
npm run preview
```

Статика собирается в `dist/`.
