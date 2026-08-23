# gipergidroz.su — Astro

Статический лендинг SwiSto3, перенесённый с Bitrix.

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
| IP | `217.28.220.186` |
| Путь на сервере | `/var/www/amplipuls_su_usr/data/www/gipergidroz.su` |

### Деплой на сервер

```bash
ssh user@217.28.220.186
cd /var/www/amplipuls_su_usr/data/www/gipergidroz.su

git pull origin main
npm ci
npm run build
# статика в dist/ — настроить nginx на dist или скопировать в webroot
```

## Запуск локально

```bash
npm install
npm run dev
```

Сайт: http://localhost:47821

## Страницы

- `/` — главная
- `/gipergidroz-ladoney` — гипергидроз ладоней
- `/gipergidroz-podmyshek` — гипергидроз подмышек
- `/gipergidroz-stop` — гипергидроз стоп

Редиректы с `.php` URL настроены в `astro.config.mjs`.

## Юридические документы

| Страница | URL |
|----------|-----|
| Политика cookie | `/docs/gipergidroz-cookies` |
| Политика ПДн | `/docs/gipergidroz-personal-data` |
| Согласие на ПДн | `/docs/gipergidroz-data-consent` |
| Рекомендательные технологии | `/docs/gipergidroz-recommendations` |

Исходники HTML: `legal-html/`. Реквизиты оператора: `src/data/legal.json`.

## Синхронизация контента с оригинала

```bash
# обновить src/raw/*.html с gipergidroz.su, затем:
npm run sync
```

## Формы

На локалке заявки логируются в консоль браузера (`public/js/bridge.js`).
На проде подключить email/Telegram/CRM в `scripts/generate-bridge.mjs` или заменить `rxRunComponentAction` на API.

## Сборка

```bash
npm run build
npm run preview
```

Статика собирается в `dist/`.
