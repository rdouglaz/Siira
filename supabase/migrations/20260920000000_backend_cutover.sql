-- Persistent audit trail replaces the in-memory Vercel cost tracker.
create table if not exists public.llm_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  model text not null,
  tokens integer not null default 0,
  language text not null check (language in ('zh', 'de')),
  kind text not null check (kind in ('chat', 'explanation')),
  latency_ms integer,
  created_at timestamptz not null default now()
);

create index if not exists llm_usage_created_at_idx on public.llm_usage (created_at desc);
create index if not exists llm_usage_user_id_idx on public.llm_usage (user_id);
alter table public.llm_usage enable row level security;

drop policy if exists "Users can view their own AI usage" on public.llm_usage;
create policy "Users can view their own AI usage" on public.llm_usage for select using (auth.uid() = user_id);
