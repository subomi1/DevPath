# Project Architecture & Folder Structure — Developer Onboarding Portal

Monorepo, Postgres, Django REST Framework backend + React/Tailwind frontend. This is the structural reference — pair it with the Schema, API Endpoint List, and the 6 UI prompts when scaffolding or generating code.

---

## 1. Repo layout

```
appzone-onboarding-portal/
├── backend/                  Django project
├── frontend/                 React app
├── docs/                     This set of prompts, schema, API docs — kept in-repo for reference
├── docker-compose.yml        Local dev: postgres + backend + frontend
├── .env.example               Root-level template; each side also has its own
└── README.md
```

Keeping `docs/` in-repo (not just in chat history) means the AI generating code later can be pointed at actual files instead of re-explaining context every session.

---

## 2. Backend structure (`/backend`)

```
backend/
├── config/                          Project-level settings (the "appzone" Django project)
│   ├── settings/
│   │   ├── base.py                  Shared settings
│   │   ├── dev.py                   DEBUG=True, local Postgres, console email backend
│   │   └── prod.py                  DEBUG=False, env-driven secrets, real email backend
│   ├── urls.py                      Root URL conf, mounts each app's router under /api/v1/
│   ├── asgi.py / wsgi.py
│
├── apps/
│   ├── accounts/                    User model, Invitation, auth views, permissions
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── permissions.py           IsAdmin, IsHR, IsManager, IsDeveloper, IsManagerOfDeveloper
│   │   ├── urls.py
│   │   ├── services.py              invite_developer(), activate_account(), etc. — business logic
│   │   │                            lives here, not in signals or views
│   │   └── tests/
│   ├── organization/                 Department, Team
│   ├── onboarding/                   Templates, Phases, Tasks, DeveloperJourney
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── services.py              clone_template_to_journey(), recalculate_progress()
│   │   └── tests/
│   ├── knowledge_base/
│   ├── access_requests/
│   ├── mentorship/
│   ├── announcements/
│   └── dashboard/                    The 4 aggregation endpoints from the API list — kept as
│                                      its own app since it reads across other apps rather than
│                                      owning its own models.
│
├── core/                             Cross-app shared code
│   ├── permissions.py                Base permission classes reused across apps
│   ├── pagination.py                 Shared DRF pagination class
│   ├── exceptions.py                 Custom exception handler → consistent error JSON shape
│   └── utils.py
│
├── requirements/
│   ├── base.txt
│   ├── dev.txt
│   └── prod.txt
├── manage.py
└── Dockerfile
```

**Why `apps/` as a namespace rather than apps at the repo root**: keeps `manage.py`'s root clean and makes `INSTALLED_APPS` entries read clearly as `apps.accounts`, `apps.onboarding`, etc. — small thing, but avoids naming collisions with third-party packages later (e.g. an `accounts` package on PyPI).

**Why `services.py` per app**: this was flagged in the schema notes — business logic (invitation → user + journey clone, progress recalculation) belongs in explicit functions, not scattered across serializer `create()` methods or signal handlers. Views/serializers stay thin and call into services.

**Settings split**: `dev.py`/`prod.py` importing from `base.py` is the standard pattern — keeps secrets and debug flags from ever being a single toggle in one file.

---

## 3. Frontend structure (`/frontend`)

```
frontend/
├── src/
│   ├── app/
│   │   ├── routes.tsx                Route definitions, role-gated route wrapper
│   │   ├── store.ts                  Global state setup (see §5 note)
│   │   └── queryClient.ts            React Query client config
│   │
│   ├── components/
│   │   └── ui/                       Shared component library from Foundation prompt:
│   │                                  Button, StatusPill, ProgressBar, HexNode, Card,
│   │                                  DataTable, Modal, Drawer, FormField, EmptyState,
│   │                                  Toast, Avatar, Skeleton
│   │
│   ├── features/                     One folder per domain — mirrors the backend apps
│   │   ├── auth/                     Login, ForgotPassword, ResetPassword, Activate
│   │   ├── developer/                Dashboard, Journey, KnowledgeBase, AccessRequests,
│   │   │                              Mentor, Announcements, Profile
│   │   ├── manager/                  Dashboard, TeamRoster, DeveloperDetail, Approvals
│   │   ├── hr/                       Dashboard, InviteDeveloper, Developers, Templates
│   │   ├── admin/                    Dashboard, UsersRoles, Departments, TemplateBuilder,
│   │   │                              KnowledgeBaseAdmin, AnnouncementsAdmin, Settings
│   │   └── shared/                   Announcements feed, Journey timeline view — used
│   │                                  read-only by Manager/HR, so it lives outside any
│   │                                  single role folder and gets imported by both
│   │
│   ├── layouts/
│   │   ├── AppShell.tsx              Sidebar + top bar, role-aware nav (Foundation §8)
│   │   └── AuthLayout.tsx            Centered-card shell for public auth pages
│   │
│   ├── api/                          One file per backend app, matching the endpoint list
│   │   ├── client.ts                 Axios/fetch instance, JWT attach + refresh interceptor
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── onboarding.ts
│   │   ├── knowledgeBase.ts
│   │   ├── accessRequests.ts
│   │   ├── mentorship.ts
│   │   └── announcements.ts
│   │
│   ├── hooks/                        Cross-feature hooks (useAuth, useRole, useDebounce)
│   ├── theme/                        Tailwind config source of truth — Foundation §2/§3 tokens
│   ├── types/                        Shared TS types mirroring DRF serializer shapes
│   └── main.tsx
│
├── tailwind.config.ts
├── package.json
└── Dockerfile
```

**Why `features/` over a flat `pages/`**: each role's screens were specified as self-contained prompts (2 through 6) — mirroring that in the folder structure means a feature folder maps 1:1 to the prompt that defined it, which keeps future AI-assisted generation scoped correctly (point it at `features/manager/` and the Prompt 4 spec together).

**Why `shared/` for Journey and Announcements**: both of these render identically-in-spirit but with different permissions across roles (Developer edits, Manager/HR view read-only) — building them once and gating actions by role prevents three divergent implementations of the same hex-node timeline.

---

## 4. Local dev (`docker-compose.yml`)

```
services:
  db:        postgres:16, named volume for persistence
  backend:   builds ./backend, mounts source for hot-reload, runs on :8000
  frontend:  builds ./frontend, Vite dev server on :5173, proxies /api to backend:8000
```

Frontend dev server proxy config (Vite `server.proxy`) means the React app calls relative `/api/v1/...` paths in all environments — no environment-conditional base URLs scattered through the API layer, just one `client.ts` baseURL that changes per env file.

---

## 5. A few decisions worth confirming before scaffolding

- **State management**: React Query (server state — dashboards, tables, journey data) is a strong default here since almost everything in this app is server-derived rather than complex local UI state. Whether you add Zustand/Redux on top for things like sidebar-collapsed state is optional — likely unnecessary; `useState`/context is probably enough for that.
- **Rich text editor** for Announcements/Knowledge Base body fields — TipTap or a lighter markdown editor (e.g. `react-markdown` + a simple textarea) — worth picking once so both features don't independently choose different libraries.
- **File storage** for avatars, KB attachments, article images — local disk is fine for dev, but decide now whether prod targets S3-compatible storage (`django-storages`) so the `ImageField`/`FileField` config doesn't need revisiting later.

---