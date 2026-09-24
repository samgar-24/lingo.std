# LinGo — мобильный тест уровня английского

## Локально
1. `npm install`
2. Скопируйте `.env.example` в `.env.local`, укажите `NEXT_PUBLIC_WHATSAPP_NUMBER` (цифры, с кодом страны, без «+»)
3. `npm run dev` или `npm run build && npm start`

## Деплой на Vercel (бесплатно, ~5 минут)
1. Создайте репозиторий на github.com и загрузите в него содержимое проекта (Add file → Upload files; `.env.local` не загружать).
2. На vercel.com войдите через GitHub → Add New → Project → выберите репозиторий.
3. До нажатия Deploy откройте Environment Variables и добавьте:
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` — обязательно (значение вшивается при сборке; после смены нужен Redeploy)
   - `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` — чтобы заявки приходили менеджеру в Telegram
4. Нажмите Deploy. Ссылка вида `https://название.vercel.app` готова; свой домен — Settings → Domains.

## Хранение лидов в Supabase (бесплатно)
1. supabase.com → New project (запомните пароль БД, он не понадобится).
2. SQL Editor → New query → вставьте содержимое `supabase.sql` → Run.
3. Project Settings → API: скопируйте Project URL и `service_role` ключ (или Secret key).
4. В Vercel → Settings → Environment Variables: `SUPABASE_URL` и `SUPABASE_SERVICE_KEY` → Redeploy.
5. Лиды смотрите в Table Editor → leads (кнопка Export → CSV).

Лиды: `lib/quiz.ts → saveLead()` → `POST /api/lead` (`app/api/lead/route.ts`). Вопросы: `lib/questions.ts`.
