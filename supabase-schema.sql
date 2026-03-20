-- ============================================
-- NextPlay Kanban Task Board — Supabase Schema
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ==================
-- TASKS TABLE
-- ==================
create table public.tasks (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  description text,
  status     text not null default 'todo'
               check (status in ('todo', 'in_progress', 'in_review', 'done')),
  priority   text not null default 'normal'
               check (priority in ('low', 'normal', 'high')),
  due_date   date,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tasks_user_id on public.tasks(user_id);
create index idx_tasks_status  on public.tasks(status);

-- ==================
-- LABELS TABLE
-- ==================
create table public.labels (
  id       uuid primary key default gen_random_uuid(),
  name     text not null,
  color    text not null,
  user_id  uuid not null references auth.users(id) on delete cascade
);

create index idx_labels_user_id on public.labels(user_id);

-- ==================
-- TASK ↔ LABEL JOIN
-- ==================
create table public.task_labels (
  task_id  uuid not null references public.tasks(id) on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  user_id  uuid not null references auth.users(id) on delete cascade,
  primary key (task_id, label_id)
);

create index idx_task_labels_task  on public.task_labels(task_id);
create index idx_task_labels_label on public.task_labels(label_id);

-- ==================
-- ROW LEVEL SECURITY
-- ==================

alter table public.tasks enable row level security;
alter table public.labels enable row level security;
alter table public.task_labels enable row level security;

-- Tasks: users can only CRUD their own rows
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can create their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Labels: users can only CRUD their own rows
create policy "Users can view their own labels"
  on public.labels for select
  using (auth.uid() = user_id);

create policy "Users can create their own labels"
  on public.labels for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own labels"
  on public.labels for update
  using (auth.uid() = user_id);

create policy "Users can delete their own labels"
  on public.labels for delete
  using (auth.uid() = user_id);

-- Task labels: users can only CRUD their own rows
create policy "Users can view their own task_labels"
  on public.task_labels for select
  using (auth.uid() = user_id);

create policy "Users can create their own task_labels"
  on public.task_labels for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own task_labels"
  on public.task_labels for delete
  using (auth.uid() = user_id);

-- ==================
-- AUTO-UPDATE updated_at
-- ==================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.tasks
  for each row
  execute function public.handle_updated_at();

-- ==================
-- TEAM MEMBERS TABLE
-- ==================
create table public.team_members (
  id       uuid primary key default gen_random_uuid(),
  name     text not null,
  color    text not null,
  user_id  uuid not null references auth.users(id) on delete cascade
);

create index idx_team_members_user_id on public.team_members(user_id);

-- ==================
-- TASK ↔ ASSIGNEE JOIN
-- ==================
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

-- ==================
-- COMMENTS TABLE
-- ==================
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

-- ==================
-- ACTIVITY LOG TABLE
-- ==================
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
