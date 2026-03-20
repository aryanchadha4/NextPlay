-- ============================================
-- Migration: Add Team Members & Assignees
-- Run this in the Supabase SQL Editor
-- ============================================

create table public.team_members (
  id       uuid primary key default gen_random_uuid(),
  name     text not null,
  color    text not null,
  user_id  uuid not null references auth.users(id) on delete cascade
);

create index idx_team_members_user_id on public.team_members(user_id);

create table public.task_assignees (
  task_id   uuid not null references public.tasks(id) on delete cascade,
  member_id uuid not null references public.team_members(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  primary key (task_id, member_id)
);

create index idx_task_assignees_task   on public.task_assignees(task_id);
create index idx_task_assignees_member on public.task_assignees(member_id);

alter table public.team_members enable row level security;
alter table public.task_assignees enable row level security;

create policy "Users can view their own team_members"
  on public.team_members for select
  using (auth.uid() = user_id);

create policy "Users can create their own team_members"
  on public.team_members for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own team_members"
  on public.team_members for update
  using (auth.uid() = user_id);

create policy "Users can delete their own team_members"
  on public.team_members for delete
  using (auth.uid() = user_id);

create policy "Users can view their own task_assignees"
  on public.task_assignees for select
  using (auth.uid() = user_id);

create policy "Users can create their own task_assignees"
  on public.task_assignees for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own task_assignees"
  on public.task_assignees for delete
  using (auth.uid() = user_id);
