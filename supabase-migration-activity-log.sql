-- ============================================
-- Migration: Add Task Activity Log
-- Run this in the Supabase SQL Editor
-- ============================================

create table public.activity_log (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  action     text not null,
  old_value  text,
  new_value  text,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index idx_activity_log_task_id on public.activity_log(task_id);
create index idx_activity_log_user_id on public.activity_log(user_id);

alter table public.activity_log enable row level security;

create policy "Users can view their own activity_log"
  on public.activity_log for select
  using (auth.uid() = user_id);

create policy "Users can create their own activity_log"
  on public.activity_log for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own activity_log"
  on public.activity_log for delete
  using (auth.uid() = user_id);
