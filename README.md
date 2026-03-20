# NextPlay — Kanban Task Manager

A polished, full-stack Kanban task board built with Next.js, TypeScript, Tailwind CSS, and Supabase. Features drag-and-drop task management, guest authentication, a backend API layer, labels, team members, comments, activity tracking, and more.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Backend API:** Next.js Route Handlers (TypeScript)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Drag & Drop:** @dnd-kit/core
- **Database & Auth:** Supabase (Postgres + Anonymous Auth + RLS)
- **Hosting:** Vercel

## Architecture

The app uses a **backend API layer** between the frontend and database:

```
Browser  ──(Supabase JS)──▶  Supabase Auth  (anonymous sign-in)
Browser  ──(fetch /api/*)──▶  Next.js API Routes  ──(supabase-js)──▶  Supabase Postgres
```

- **Auth** stays client-side (Supabase anonymous sign-in)
- **All data operations** (tasks, labels, members, comments, etc.) go through server-side API routes
- API routes authenticate requests by forwarding the user's JWT to Supabase
- Row Level Security on Supabase enforces per-user data isolation

## API Endpoints

### Tasks

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tasks` | List all tasks for the authenticated user |
| POST | `/api/tasks` | Create a new task (logs `task_created` activity) |
| PATCH | `/api/tasks/[id]` | Update a task (logs field-level changes to activity) |
| DELETE | `/api/tasks/[id]` | Delete a task and all associations |

### Labels

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/labels` | List all labels and task-label mappings |
| POST | `/api/labels` | Create a new label |
| DELETE | `/api/labels/[id]` | Delete a label |
| POST | `/api/tasks/[id]/labels` | Add a label to a task |
| DELETE | `/api/tasks/[id]/labels/[labelId]` | Remove a label from a task |

### Team Members & Assignees

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/members` | List all team members |
| POST | `/api/members` | Create a team member |
| DELETE | `/api/members/[id]` | Delete a team member |
| POST | `/api/tasks/[id]/assignees` | Assign a member to a task (logs activity) |
| DELETE | `/api/tasks/[id]/assignees/[memberId]` | Unassign a member (logs activity) |

### Comments

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tasks/[id]/comments` | List comments for a task |
| POST | `/api/tasks/[id]/comments` | Add a comment to a task |
| DELETE | `/api/tasks/[id]/comments/[commentId]` | Delete a comment |

### Activity Log

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tasks/[id]/activity` | Get activity history for a task |

## Features

- **Kanban Board** with 4 columns: To Do, In Progress, In Review, Done
- **Drag and Drop** tasks between columns to update status
- **Guest Authentication** via Supabase anonymous sign-in (no signup required)
- **Row Level Security** — each user only sees their own data
- **Backend API** — all CRUD operations route through server-side API endpoints
- **Create / Edit / Delete** tasks with title, description, priority, and due date
- **Auto-save** — title and description edits are saved automatically when closing the detail panel
- **Labels** — create custom colored labels and assign them to tasks (including during task creation)
- **Team Members & Assignees** — create team members with names and colors, assign them to tasks, see avatars on cards
- **Task Comments** — add timestamped comments to tasks, view in chronological order, delete comments
- **Activity Log** — automatic tracking of all task changes (status, priority, title, description, due date, assignments) with a human-readable timeline
- **Due Date Indicators** — visual badges that turn red when overdue
- **Search** — filter tasks by title or description
- **Filters** — filter by priority, label, or assignee
- **Board Stats** — live summary of total, completed, in-progress, and overdue tasks
- **Optimistic Updates** — instant UI feedback for all operations
- **Loading Skeletons** and empty states
- **Responsive Layout** — works on desktop and mobile

## Getting Started

### Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) project

### 1. Clone the repository

```bash
git clone https://github.com/aryanchadha4/NextPlay.git
cd NextPlay
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API** and copy your **Project URL** and **anon public key**
3. Enable **Anonymous Sign-In**: Go to **Authentication → Providers → Anonymous** and toggle it on
4. Run the database schema: Open the **SQL Editor** and paste the contents of `supabase-schema.sql`, then click **Run**

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

See [`supabase-schema.sql`](supabase-schema.sql) for the complete SQL including tables, indexes, RLS policies, and triggers.

### Tables

| Table | Description |
|-------|-------------|
| `tasks` | Core task data (title, description, status, priority, due_date) |
| `labels` | User-created labels with name and color |
| `task_labels` | Many-to-many join between tasks and labels |
| `team_members` | Team members with name and color |
| `task_assignees` | Many-to-many join between tasks and team members |
| `comments` | Task comments with content and timestamps |
| `activity_log` | Tracks all task changes (action, old/new values, timestamps) |

All tables have Row Level Security enabled with policies restricting access to `auth.uid() = user_id`.

Standalone migration files are also provided for incremental setup:
- `supabase-migration-team-members.sql`
- `supabase-migration-comments.sql`
- `supabase-migration-activity-log.sql`

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── tasks/
│   │   │   ├── route.ts              GET (list) + POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts          PATCH (update) + DELETE
│   │   │       ├── labels/
│   │   │       │   ├── route.ts      POST (add label)
│   │   │       │   └── [labelId]/route.ts   DELETE (remove label)
│   │   │       ├── assignees/
│   │   │       │   ├── route.ts      POST (assign member)
│   │   │       │   └── [memberId]/route.ts  DELETE (unassign)
│   │   │       ├── comments/
│   │   │       │   ├── route.ts      GET (list) + POST (add)
│   │   │       │   └── [commentId]/route.ts DELETE
│   │   │       └── activity/
│   │   │           └── route.ts      GET (activity history)
│   │   ├── labels/
│   │   │   ├── route.ts              GET (list) + POST (create)
│   │   │   └── [id]/route.ts         DELETE
│   │   └── members/
│   │       ├── route.ts              GET (list) + POST (create)
│   │       └── [id]/route.ts         DELETE
│   ├── layout.tsx          Root layout
│   ├── page.tsx            Main board page (client component)
│   └── globals.css         Tailwind + custom styles
├── components/
│   ├── board/
│   │   ├── Board.tsx       DnD context + column layout
│   │   ├── Column.tsx      Droppable column
│   │   ├── TaskCard.tsx    Draggable task card
│   │   ├── NewTaskDialog.tsx  Create task modal (with label picker)
│   │   └── TaskDetail.tsx  Slide-out editor (comments, activity, assignees)
│   ├── filters/
│   │   ├── SearchBar.tsx   Search input
│   │   └── FilterBar.tsx   Priority/label/assignee filter chips
│   ├── labels/
│   │   ├── LabelBadge.tsx  Colored label pill
│   │   └── LabelManager.tsx  Popover to manage labels
│   ├── members/
│   │   ├── MemberAvatar.tsx  Avatar with initials + AvatarGroup
│   │   └── TeamManager.tsx   Popover to manage team members
│   ├── layout/
│   │   ├── Header.tsx      App header
│   │   └── BoardStats.tsx  Task count summary
│   └── ui/                 shadcn/ui primitives
├── hooks/
│   ├── useAuth.ts          Anonymous auth + access token helper
│   ├── useTasks.ts         Task CRUD with optimistic updates
│   ├── useLabels.ts        Label CRUD + task-label associations
│   ├── useMembers.ts       Team member CRUD + task assignments
│   ├── useComments.ts      Task comment CRUD
│   └── useActivity.ts      Task activity log fetching
└── lib/
    ├── supabase.ts         Client-side Supabase (auth only)
    ├── supabase-server.ts  Server-side client + logActivity helper
    ├── types.ts            TypeScript types + constants
    └── utils.ts            cn() utility
```

## Deployment

Deploy to Vercel:

```bash
npm i -g vercel
vercel
```

Set the environment variables in Vercel's dashboard under **Settings → Environment Variables**.
