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

Редиректы с `.php` URL — в `astro.config.mjs`. `/gipergidroz-lechenie` перенаправляется на главную.

## SEO-статьи

- Исходники блоков: `src/content/article/*-inner.html`
- Сборка страниц: `node scripts/build-article-page.mjs`
- Проверка ключевых слов: `node scripts/check-article-keywords.mjs [ladoney|podmyshek|stop]`
- Цели: `src/data/keyword-targets*.json`

## Юридические документы (PNG)

На сайте опубликованы только PNG-превью. HTML-страницы удалены; старые URL редиректят на картинки.

| Документ | URL |
|----------|-----|
| Политика cookie | `/docs/previews/gipergidroz-cookies.png` |
| Политика ПДн | `/docs/previews/gipergidroz-personal-data.png` |
| Согласие на ПДн | `/docs/previews/gipergidroz-data-consent.png` |
| Рекомендательные технологии | `/docs/previews/gipergidroz-recommendations.png` |

Ссылки в футере, формах и cookie-баннере: `src/data/legal.json` → `scripts/generate-bridge.mjs`.

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
