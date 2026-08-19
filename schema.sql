-- Kaizen du Mariage — stockage en ligne Supabase
-- À exécuter dans Supabase > SQL Editor.

create table if not exists public.kaizen_marriage_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.kaizen_marriage_state enable row level security;

drop policy if exists "Users can read own kaizen state" on public.kaizen_marriage_state;
create policy "Users can read own kaizen state"
on public.kaizen_marriage_state
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own kaizen state" on public.kaizen_marriage_state;
create policy "Users can insert own kaizen state"
on public.kaizen_marriage_state
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own kaizen state" on public.kaizen_marriage_state;
create policy "Users can update own kaizen state"
on public.kaizen_marriage_state
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
