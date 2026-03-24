create table if not exists public.site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  created_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "public can read site content" on public.site_content;
create policy "public can read site content"
on public.site_content
for select
using (true);

drop policy if exists "authenticated can upsert site content" on public.site_content;
drop policy if exists "admins can manage site content" on public.site_content;
drop policy if exists "authenticated users can manage site content" on public.site_content;
create policy "authenticated users can manage site content"
on public.site_content
for all
to authenticated
using (true)
with check (true);

drop policy if exists "admins can read own admin record" on public.admin_users;
create policy "admins can read own admin record"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

insert into public.site_content (id, content)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists "public can read site assets" on storage.objects;
drop policy if exists "authenticated can upload site assets" on storage.objects;
drop policy if exists "authenticated can update site assets" on storage.objects;
drop policy if exists "authenticated can delete site assets" on storage.objects;
drop policy if exists "admins can upload site assets" on storage.objects;
drop policy if exists "admins can update site assets" on storage.objects;
drop policy if exists "admins can delete site assets" on storage.objects;

create policy "public can read site assets"
on storage.objects
for select
using (bucket_id = 'site-assets');

drop policy if exists "authenticated users can upload site assets" on storage.objects;
drop policy if exists "authenticated users can update site assets" on storage.objects;
drop policy if exists "authenticated users can delete site assets" on storage.objects;

create policy "authenticated users can upload site assets"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'site-assets');

create policy "authenticated users can update site assets"
on storage.objects
for update
to authenticated
using (bucket_id = 'site-assets')
with check (bucket_id = 'site-assets');

create policy "authenticated users can delete site assets"
on storage.objects
for delete
to authenticated
using (bucket_id = 'site-assets');

-- Admin users table is optional in this setup.
-- Any authenticated Supabase user can access the admin panel and manage content.



