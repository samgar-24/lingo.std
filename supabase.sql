create table leads (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text,
  phone text,
  goal text,
  score int,
  level text,
  answers jsonb
);
-- RLS включён и политик нет: публично таблицу прочитать нельзя, сервер пишет через секретный ключ.
alter table leads enable row level security;
