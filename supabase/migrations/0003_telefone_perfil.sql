-- Seen · 0003 — telefone e empresa vindos do cadastro
-- Pode rodar mais de uma vez sem problema.

alter table public.profiles add column if not exists phone text;

-- O perfil criado no cadastro passa a guardar empresa e telefone também
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, company, phone)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'company', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Preenche quem se cadastrou antes desta migração
update public.profiles p
set company = coalesce(p.company, nullif(u.raw_user_meta_data ->> 'company', '')),
    phone   = coalesce(p.phone,   nullif(u.raw_user_meta_data ->> 'phone', ''))
from auth.users u
where u.id = p.id;
