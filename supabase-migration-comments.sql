-- ============================================
-- Migration: Add Task Comments
-- Run this in the Supabase SQL Editor
-- ============================================

create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  content    text not null,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index idx_comments_task_id on public.comments(task_id);
create index idx_comments_user_id on public.comments(user_id);

alter table public.comments enable row level security;

create policy "Users can view their own comments"
  on public.comments for select
  using (auth.uid() = user_id);

create policy "Users can create their own comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.comments for delete
  using (auth.uid() = user_id);
