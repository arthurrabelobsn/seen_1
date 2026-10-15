-- Seen · schema inicial
-- Rode no Supabase: SQL Editor → New query → cole tudo → Run.
-- Cada linha pertence a um usuário (user_id) e as políticas RLS garantem
-- que cada cliente só enxerga e altera os próprios dados.

-- ============================================================
-- Perfis (1 por usuário do Supabase Auth)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  company     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Cria o perfil automaticamente quando alguém se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Sites (um usuário pode ter vários)
-- ============================================================
create table if not exists public.sites (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name               text not null,
  url                text not null,
  platform           text not null default 'wordpress'
                       check (platform in ('wordpress','github','webhook','shopify','nuvemshop','outro')),
  niche              text,
  audience           text,
  business_facts     text,           -- diferenciais, preços, perguntas de clientes
  competitors        text[] not null default '{}',
  tone               text not null default 'profissional',
  language           text not null default 'pt-BR',
  posts_per_week     int  not null default 2 check (posts_per_week between 1 and 7),
  autopublish        boolean not null default false,
  connection_status  text not null default 'desconectado'
                       check (connection_status in ('desconectado','conectado','erro')),
  gsc_property       text,           -- propriedade do Search Console (fase seguinte)
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists sites_user_idx on public.sites(user_id);

-- ============================================================
-- Palavras-chave do plano
-- ============================================================
create table if not exists public.keywords (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  site_id     uuid not null references public.sites(id) on delete cascade,
  term        text not null,
  volume      int,
  difficulty  int check (difficulty between 0 and 100),
  intent      text check (intent in ('informacional','comercial','transacional','navegacional')),
  cluster     text,
  created_at  timestamptz not null default now(),
  unique (site_id, term)
);
create index if not exists keywords_site_idx on public.keywords(site_id);

-- ============================================================
-- Artigos
-- ============================================================
create table if not exists public.articles (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users(id) on delete cascade,
  site_id            uuid not null references public.sites(id) on delete cascade,
  keyword_id         uuid references public.keywords(id) on delete set null,
  title              text not null,
  slug               text,
  focus_keyword      text,
  secondary_keywords text[] not null default '{}',
  brief              text,           -- orientação para a redação
  content            text not null default '',   -- Markdown
  meta_title         text,
  meta_description   text,
  status             text not null default 'ideia'
                       check (status in ('ideia','rascunho','aprovado','agendado','publicado')),
  scheduled_for      date,
  published_at       timestamptz,
  published_url      text,
  word_count         int not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists articles_site_idx on public.articles(site_id);
create index if not exists articles_schedule_idx on public.articles(site_id, scheduled_for);

-- ============================================================
-- Métricas diárias por artigo (alimentadas pelo Search Console)
-- ============================================================
create table if not exists public.article_metrics (
  id           bigint generated always as identity primary key,
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  site_id      uuid not null references public.sites(id) on delete cascade,
  article_id   uuid references public.articles(id) on delete cascade,
  date         date not null,
  clicks       int not null default 0,
  impressions  int not null default 0,
  position     numeric(5,2),
  unique (article_id, date)
);
create index if not exists metrics_site_date_idx on public.article_metrics(site_id, date);

-- ============================================================
-- updated_at automático
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
drop trigger if exists sites_touch on public.sites;
create trigger sites_touch before update on public.sites
  for each row execute function public.touch_updated_at();
drop trigger if exists articles_touch on public.articles;
create trigger articles_touch before update on public.articles
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Segurança por linha (RLS)
-- ============================================================
alter table public.profiles        enable row level security;
alter table public.sites           enable row level security;
alter table public.keywords        enable row level security;
alter table public.articles        enable row level security;
alter table public.article_metrics enable row level security;

drop policy if exists "perfil próprio" on public.profiles;
create policy "perfil próprio" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "sites próprios" on public.sites;
create policy "sites próprios" on public.sites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Nas tabelas filhas, o site também precisa ser do usuário
drop policy if exists "palavras próprias" on public.keywords;
create policy "palavras próprias" on public.keywords
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid()
    and exists (select 1 from public.sites s where s.id = site_id and s.user_id = auth.uid()));

drop policy if exists "artigos próprios" on public.articles;
create policy "artigos próprios" on public.articles
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid()
    and exists (select 1 from public.sites s where s.id = site_id and s.user_id = auth.uid()));

drop policy if exists "métricas próprias" on public.article_metrics;
create policy "métricas próprias" on public.article_metrics
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid()
    and exists (select 1 from public.sites s where s.id = site_id and s.user_id = auth.uid()));
