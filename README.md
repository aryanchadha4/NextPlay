# TaskBoard — Kanban Task Manager

A polished, full-stack Kanban task board built with Next.js, TypeScript, Tailwind CSS, and Supabase. Features drag-and-drop task management, guest authentication, a backend API layer, labels, filtering, and more.

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
- **All data operations** (tasks, labels) go through server-side API routes
- API routes authenticate requests by forwarding the user's JWT to Supabase
- Row Level Security on Supabase enforces per-user data isolation

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tasks` | List all tasks for the authenticated user |
| POST | `/api/tasks` | Create a new task |
| PATCH | `/api/tasks/[id]` | Update a task |
| DELETE | `/api/tasks/[id]` | Delete a task and its label associations |
| GET | `/api/labels` | List all labels and task-label mappings |
| POST | `/api/labels` | Create a new label |
| DELETE | `/api/labels/[id]` | Delete a label and its task associations |
| POST | `/api/tasks/[id]/labels` | Add a label to a task |
| DELETE | `/api/tasks/[id]/labels/[labelId]` | Remove a label from a task |

## Features

- **Kanban Board** with 4 columns: To Do, In Progress, In Review, Done
- **Drag and Drop** tasks between columns to update status
- **Guest Authentication** via Supabase anonymous sign-in (no signup required)
- **Row Level Security** — each user only sees their own tasks
- **Backend API** — all CRUD operations route through server-side API endpoints
- **Create / Edit / Delete** tasks with title, description, priority, and due date
- **Labels** — create custom colored labels and assign them to tasks
- **Due Date Indicators** — visual badges that turn red when overdue
- **Search** — filter tasks by title or description
- **Filters** — filter by priority level or label
- **Board Stats** — live summary of total, completed, in-progress, and overdue tasks
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

All tables have Row Level Security enabled with policies restricting access to `auth.uid() = user_id`.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── tasks/
│   │   │   ├── route.ts              GET (list) + POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts          PATCH (update) + DELETE
│   │   │       └── labels/
│   │   │           ├── route.ts      POST (add label to task)
│   │   │           └── [labelId]/
│   │   │               └── route.ts  DELETE (remove label)
│   │   └── labels/
│   │       ├── route.ts              GET (list) + POST (create)
│   │       └── [id]/
│   │           └── route.ts          DELETE
│   ├── layout.tsx          Root layout
│   ├── page.tsx            Main board page (client component)
│   └── globals.css         Tailwind + custom styles
├── components/
│   ├── board/
│   │   ├── Board.tsx       DnD context + column layout
│   │   ├── Column.tsx      Droppable column
│   │   ├── TaskCard.tsx    Draggable task card
│   │   ├── NewTaskDialog.tsx  Create task modal
│   │   └── TaskDetail.tsx  Slide-out task editor
│   ├── filters/
│   │   ├── SearchBar.tsx   Search input
│   │   └── FilterBar.tsx   Priority/label filter chips
│   ├── labels/
│   │   ├── LabelBadge.tsx  Colored label pill
│   │   └── LabelManager.tsx  Popover to manage labels
│   ├── layout/
│   │   ├── Header.tsx      App header
│   │   └── BoardStats.tsx  Task count summary
│   └── ui/                 shadcn/ui primitives
├── hooks/
│   ├── useAuth.ts          Anonymous auth + access token helper
│   ├── useTasks.ts         Task CRUD via /api/tasks with optimistic updates
│   └── useLabels.ts        Label CRUD via /api/labels + task-label associations
└── lib/
    ├── supabase.ts         Client-side Supabase (auth only)
    ├── supabase-server.ts  Server-side Supabase client (used by API routes)
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
