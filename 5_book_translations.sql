-- ============================================================================
-- ПЕРЕКЛАД КНИГ: таблиця для збережених перекладів
-- Supabase → SQL Editor → New query → вставити → Run
-- Записує сюди лише серверна функція translate-book (service role);
-- для сайту є тільки читання. Усі переклади видаляються разом із книгою.
-- ============================================================================
create table if not exists public.book_translations (
    book_id        bigint not null references public.books(id) on delete cascade,
    lang           text   not null check (lang in ('en','de','pl','es','zh','hi')),
    title          text,
    description    text,
    author_name    text,
    author_surname text,
    chapters       jsonb  not null default '[]'::jsonb,   -- [{ "title": "...", "content": "..." }, ...]
    chars          integer not null default 0,            -- скільки символів переклав сервіс (для обліку витрат)
    translated_at  timestamptz not null default now(),
    primary key (book_id, lang)
);

alter table public.book_translations enable row level security;

drop policy if exists bt_select on public.book_translations;
create policy bt_select on public.book_translations
    for select to anon, authenticated using (true);

revoke insert, update, delete on public.book_translations from anon, authenticated;

-- Перевірка: має повернути 0 рядків (перекладів ще немає)
select count(*) as translations from public.book_translations;
