# FlowState — Work Schedule App

A personal productivity app built around **90-minute deep-work blocks**. Manage tasks, schedule your week, track focus sessions, and write notes — all in one place.

Built with **React + Vite + TypeScript + Tailwind CSS + shadcn/ui**.

---

## Getting Started

```bash
npm install
npm run dev    # dev server at http://localhost:5173
npm run build  # production build
```

---

## Project Structure

```
src/
├── app/
│   ├── App.tsx                    # Root component
│   ├── routes.ts                  # React Router config
│   ├── types.ts                   # Shared TypeScript interfaces
│   ├── storage.ts                 # localStorage persistence layer
│   ├── components/
│   │   ├── Layout.tsx             # Sidebar + page shell
│   │   ├── Timer.tsx              # 90-min countdown timer
│   │   ├── TaskList.tsx           # Task CRUD component
│   │   ├── WeekView.tsx           # Weekly schedule grid
│   │   ├── GoogleCalendarSettings.tsx
│   │   └── ui/                    # shadcn/ui primitives
│   └── pages/
│       ├── Home.tsx               # Dashboard
│       ├── Tasks.tsx              # Task manager
│       ├── Schedule.tsx           # Weekly schedule view
│       ├── Notes.tsx              # Notes / journal
│       └── QuickStart.tsx         # Quick focus timer
├── styles/
│   ├── index.css                  # Entry stylesheet
│   ├── theme.css                  # CSS variables / design tokens
│   ├── fonts.css                  # Font imports
│   └── tailwind.css               # Tailwind directives
└── main.tsx                       # App entry point

supabase/functions/server/
├── index.tsx                      # Hono API (Google Calendar OAuth)
└── kv_store.tsx                   # KV storage helpers
```

---

## Data Model (`src/app/types.ts`)

| Type | Key Fields |
|---|---|
| `Task` | title, priority, category, steps, reflection, estimatedBlocks |
| `TimeBlock` | date, startTime, endTime, type (work/break/meeting/lunch), taskId |
| `WorkSession` | startTime, endTime, duration, taskId |

All data persists to `localStorage` via `src/app/storage.ts`.

---

## Design Tokens (`src/styles/theme.css`)

| Token | Value |
|---|---|
| `--background` | `#f7f5f2` |
| `--foreground` | `#1a1f2e` |
| `--accent-blue` | `#4f6ef7` |
| `--accent-green` | `#2dba7e` |
| `--accent-amber` | `#f0a030` |
| `--accent-rose` | `#e85d75` |
| `--font-sans` | DM Sans |
| `--font-serif` | DM Serif Display |

---

## Editing with Claude Code

```bash
# Open project in Claude Code
claude .
```

Example prompts:
- *"Add a Habits tracker page with a daily checkbox grid"*
- *"Make WeekView support drag-and-drop to reschedule blocks"*
- *"Add Supabase auth so data syncs across devices instead of localStorage"*
- *"Add a dark mode toggle to the sidebar"*
- *"Wire up the Google Calendar OAuth flow in GoogleCalendarSettings.tsx"*

---

## Supabase Backend

Edge Function lives in `supabase/functions/server/index.tsx` (Hono).

```bash
supabase functions deploy
```

Required env vars:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
