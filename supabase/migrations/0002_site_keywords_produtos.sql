-- Seen · migração 0002
-- Aba Site, produtos e serviços, keywords com métricas, artigos em pastas e imagens.
-- Rode no Supabase: SQL Editor → New query → cole TODO o conteúdo deste arquivo → Run.
-- Pode rodar mais de uma vez sem problema.

-- ============================================================
-- Sites: descrição para a IA, estilo de imagem e plano
-- ============================================================
alter table public.sites add column if not exists description   text;
alter table public.sites add column if not exists image_style   text not null default 'realista';
alter table public.sites add column if not exists plan          text not null default 'pro';
alter table public.sites add column if not exists brand_words   text[] not null default '{}';  -- termos a usar
alter table public.sites add column if not exists banned_words  text[] not null default '{}';  -- termos a evitar
alter table public.sites add column if not exists cta_text      text;                         -- chamada padrão no fim dos artigos

-- ============================================================
-- Produtos e serviços citados pela IA nos artigos
-- ============================================================
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  site_id      uuid not null references public.sites(id) on delete cascade,
  kind         text not null default 'produto' check (kind in ('produto','servico')),
  name         text not null,
  description  text,
  price        numeric(12,2),
  url          text,
  image_url    text,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists products_site_idx on public.products(site_id);

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

alter table public.products enable row level security;
drop policy if exists "produtos próprios" on public.products;
create policy "produtos próprios" on public.products
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid()
    and exists (select 1 from public.sites s where s.id = site_id and s.user_id = auth.uid()));

-- ============================================================
-- Keywords: dificuldade 0–10, oportunidade, tendência, origem e status
-- ============================================================
alter table public.keywords drop constraint if exists keywords_difficulty_check;
update public.keywords set difficulty = round(difficulty / 10.0) where difficulty > 10;
alter table public.keywords add constraint keywords_difficulty_check check (difficulty between 0 and 10);

alter table public.keywords add column if not exists opportunity text
  check (opportunity in ('baixa','media','alta'));
alter table public.keywords add column if not exists trend int[];                  -- volume dos últimos 12 meses
alter table public.keywords add column if not exists cpc numeric(8,2);
alter table public.keywords add column if not exists source text not null default 'manual'
  check (source in ('manual','sugerida','gerada','search_console'));
alter table public.keywords add column if not exists status text not null default 'salva'
  check (status in ('sugerida','salva','em_uso','descartada'));
alter table public.keywords add column if not exists seed text;                   -- tema que originou a keyword
alter table public.keywords add column if not exists metrics_updated_at timestamptz;

-- ============================================================
-- Artigos: favorito e métricas da palavra-chave (vindas do Google)
-- ============================================================
alter table public.articles add column if not exists starred     boolean not null default false;
alter table public.articles add column if not exists volume      int;
alter table public.articles add column if not exists difficulty  int check (difficulty between 0 and 10);
alter table public.articles add column if not exists opportunity text check (opportunity in ('baixa','media','alta'));
alter table public.articles add column if not exists cover_image text;

-- ============================================================
-- Perfil: foto
-- ============================================================
alter table public.profiles add column if not exists avatar_url text;

-- ============================================================
-- Armazenamento de imagens (artigos, produtos, foto de perfil)
-- Cada usuário só grava dentro da própria pasta: <user_id>/...
-- ============================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media: enviar na própria pasta" on storage.objects;
create policy "media: enviar na própria pasta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "media: alterar na própria pasta" on storage.objects;
create policy "media: alterar na própria pasta" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "media: apagar na própria pasta" on storage.objects;
create policy "media: apagar na própria pasta" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
