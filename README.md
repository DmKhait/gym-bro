# Gym Bro

Мобільний дашборд КБЖВ, води та ваги з Google Sheets. Стек: Vue 3, TypeScript, Pinia, Tailwind CSS, Chart.js, Google Apps Script, GitHub Pages.

## Локальний запуск

```sh
npm ci
npm run dev
```

Кнопка «Переглянути демо» відкриває приклад із синтетичними даними. Для перевірки збірки виконай `npm run build`, а для її перегляду — `npm run preview`.

## Підключення приватної таблиці

1. У Google Sheets встанови **Обмежений доступ** у меню «Поділитися» й київський час у налаштуваннях таблиці.
2. Створи окремий проєкт Apps Script від акаунта з доступом до таблиці. Додай [Dashboard.js](apps-script/Dashboard.js) і [appsscript.json](apps-script/appsscript.json). У властивостях скрипту встанови `SPREADSHEET_ID`. Скрипт читає денні й тижневі показники з «Дашборду» та середню вагу з «Трекера».
3. Прив’яжи скрипт до стандартного проєкту Google Cloud. Увімкни **Apps Script API** та **Google Sheets API**. Налаштуй екран згоди й додай свій Google-акаунт до тестових користувачів, якщо проєкт у режимі Testing.
4. У тому самому проєкті Google Cloud створи OAuth-клієнт типу **Web application**. Додай фактичний origin Pages (наприклад, `https://username.github.io`) до **Authorized JavaScript origins**. Для тестування з Vite можна також додати `http://localhost:5173`. Застосунок запитує дозволи `spreadsheets.readonly` для читання таблиць Google-акаунта та `userinfo.email` для виклику `scripts.run`. Дозволи на редагування не запитуються.
5. Розгорни Apps Script як **API executable** з доступом **Only myself**. Скопіюй ID розгортання. Перевір, що вхід у застосунок відбувається з акаунта, який розгорнув скрипт.
6. Для локальної роботи скопіюй `.env.example` у `.env.local` та заповни `VITE_GOOGLE_CLIENT_ID` і `VITE_APPS_SCRIPT_DEPLOYMENT_ID`. Для Pages додай дві repository variables, `GOOGLE_CLIENT_ID` і `APPS_SCRIPT_DEPLOYMENT_ID`, потім перезапусти workflow. Це публічні ідентифікатори. ID таблиці залишається у властивостях скрипту, токен — у пам’яті відкритого застосунку.

## GitHub Pages та iPhone

У GitHub відкрий **Settings → Pages** і вибери джерело **GitHub Actions**. Workflow розгортає збірку з гілки `main`.

На iPhone відкрий посилання в Safari, вибери **Поділитися → На початковий екран** і ввімкни **Відкрити як вебзастосунок**. З іконки перевір вхід та «Оновити». Застосунок кешує файли інтерфейсу, а для завантаження показників із Google Sheets потрібна мережа.

[Налаштування Apps Script API](https://developers.google.com/apps-script/api/how-tos/execute) · [Google OAuth](https://developers.google.com/identity/oauth2/web/guides/use-token-model) · [Інструкція Apple](https://support.apple.com/guide/iphone/iphea86e5236/ios)
