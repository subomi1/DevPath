# API Endpoint List — Django REST Framework

Organized by app, matching the schema. REST conventions throughout — standard `ModelViewSet` CRUD is implied for most resources, so I've mainly called out non-CRUD/custom actions and anything with role-scoping worth noting. Assume all endpoints are under `/api/v1/` and require JWT auth unless marked public.

---

## 1. `accounts` — Auth, Users, Invitations

```
POST   /auth/login/                      Public. Returns access + refresh JWT.
POST   /auth/refresh/                    Public. Refresh access token.
POST   /auth/logout/                     Blacklist refresh token.

POST   /auth/forgot-password/            Public. Always 200, generic response regardless of email existing.
POST   /auth/reset-password/             Public. Body: token, new_password.
GET    /auth/reset-password/validate/    Public. ?token= — checks validity before rendering the form.

GET    /auth/invitations/validate/       Public. ?token= — validates activation link, returns invitee name/email for the welcome header.
POST   /auth/activate/                   Public. Body: token, password, policies_accepted (optional).

GET    /users/me/                        Current user profile.
PATCH  /users/me/                        Update own editable fields (phone, notification prefs).
POST   /users/me/change-password/        Body: current_password, new_password.

GET    /users/                           Admin: all users. HR: all users. Manager: direct reports only (queryset-scoped).
POST   /users/                           Admin only — create HR/Manager account (no template/journey fields).
GET    /users/{id}/
PATCH  /users/{id}/                      Admin/HR — edit assignment (manager, mentor, template pointer), role.
POST   /users/{id}/suspend/              Admin/HR.
POST   /users/{id}/archive/              Admin/HR.
POST   /users/{id}/resend-activation/    Admin/HR — regenerates invitation token.

POST   /invitations/                     HR only. Body: full_name, email, department, team, job_role,
                                          manager, mentor, start_date, onboarding_template.
                                          → creates User(pending_activation) + Invitation + clones journey.
GET    /invitations/                     HR/Admin — list, filterable by status.
```

---

## 2. `organization`

```
GET/POST         /departments/
GET/PATCH/DELETE  /departments/{id}/
GET               /departments/{id}/teams/        Nested convenience list.

GET/POST         /teams/
GET/PATCH/DELETE  /teams/{id}/
```
Standard CRUD, Admin-write / everyone-read (read used for dropdowns across Invite Developer, filters, etc.).

---

## 3. `onboarding`

### Templates (Admin write, HR/Manager/Developer read where relevant)
```
GET/POST          /templates/                     Admin creates; HR/others list for selection/preview.
GET/PATCH/DELETE   /templates/{id}/
POST               /templates/{id}/duplicate/       Admin — clone a template as a starting point for a new one.

GET/POST          /templates/{id}/phases/
PATCH/DELETE       /phases/{id}/
POST               /phases/reorder/                 Body: [{id, order}, ...] — batch reorder from the drag-and-drop builder.

GET/POST          /phases/{id}/tasks/
PATCH/DELETE       /template-tasks/{id}/
POST               /template-tasks/reorder/          Same batch-reorder pattern, scoped within a phase.

GET/POST/DELETE   /template-tasks/{id}/resources/    Attach/remove learning resources.
```

### Developer Journeys (the live, per-developer instance)
```
GET   /journeys/me/                       Developer — own journey, full phase/task tree.
GET   /journeys/{user_id}/                Manager (own reports only) / HR / Admin — read-only view of another developer's journey.

GET   /journey-tasks/{id}/                Task detail (drawer content).
POST  /journey-tasks/{id}/complete/       Developer — self-completed tasks only; 403 if verification_type isn't self.
POST  /journey-tasks/{id}/submit/         Developer — for manager-verified tasks, moves to "awaiting verification."
POST  /journey-tasks/{id}/verify/         Manager only, and only for their own report's task.
POST  /journey-tasks/{id}/send-back/      Manager only. Body: reason.

GET   /journeys/{user_id}/progress/       Lightweight endpoint returning just overall_progress % — used by
                                           dashboard/roster tables so they don't have to pull the full tree.
```

---

## 4. `knowledge_base`

```
GET   /kb/categories/                     Public within auth — fixed list, used for the sidebar filter.
GET   /kb/tags/

GET   /kb/articles/                       ?category=&tag=&search= — search hits title/body.
POST  /kb/articles/                       Admin only.
GET   /kb/articles/{slug}/                Increments view_count on retrieve.
PATCH/DELETE /kb/articles/{slug}/         Admin only.

POST  /kb/articles/{slug}/attachments/    Admin only, multipart upload.
DELETE /kb/attachments/{id}/              Admin only.
```

---

## 5. `access_requests`

```
GET   /access-requests/                   Developer — own requests. Manager — requests from their reports
                                           (pending their approval + history). HR/Admin — all.
POST  /access-requests/                   Developer — creates with status='submitted'.
GET   /access-requests/{id}/              Includes nested status log for the stepper.

POST  /access-requests/{id}/approve/      Manager (their report's request only).
POST  /access-requests/{id}/reject/       Manager. Body: rejection_reason.
POST  /access-requests/{id}/complete/     Manager or Admin — marks provisioning done after approval.

POST  /access-requests/bulk-approve/      Manager. Body: [id, id, ...] — powers the bulk action bar.
```

---

## 6. `mentorship`

```
GET   /mentorship/me/                     Developer — own mentor's profile + notes/goals + meeting history.
GET   /mentorship/mentees/                Mentor-role view of everyone they mentor (if a user can be a mentor
                                           regardless of system role — worth confirming this against your role model).

POST  /mentor-meetings/                   Developer — requests a meeting. Body: preferred_time_note.
GET   /mentor-meetings/                   Scoped to requester or mentor.
PATCH /mentor-meetings/{id}/              Mentor — sets scheduled_at, changes status.
POST  /mentor-meetings/{id}/cancel/

GET/POST /mentor-notes/                   Mentor only for POST; developer sees only is_goal=True notes on
                                           their own profile (general notes may be mentor-private — confirm
                                           this visibility rule before building the serializer).
```

---

## 7. `announcements`

```
GET   /announcements/                     ?category=&unread=  — audience-filtered automatically based on
                                           requester's department/team/role.
POST  /announcements/                     Manager (audience_scope limited to their team), HR/Admin (wider scopes).
GET   /announcements/{id}/                Marks as read for the requesting user (creates AnnouncementRead).
PATCH/DELETE /announcements/{id}/         Author only, or Admin (any).

GET   /announcements/{id}/read-stats/     Admin only — returns read % against the resolved audience.
```

---

## 8. Dashboard aggregation endpoints (one per role, avoids many round-trips from the frontend)

```
GET   /dashboard/developer/    Today's tasks, upcoming events, open access request count, mentor summary,
                                recent announcements, overall progress — matches the Prompt 3 dashboard exactly.
GET   /dashboard/manager/      Stat cards, roster summary, pending approvals, analytics chart data.
GET   /dashboard/hr/           Stat cards, in-progress onboardings table data.
GET   /dashboard/admin/        User-by-role breakdown, recent system activity feed.
```
Worth building these as dedicated read-only endpoints rather than having the frontend stitch together 4–5 separate calls per dashboard load — keeps the dashboards fast and the frontend simpler.

---

## 9. Permissions summary (applies across all of the above)

| Role | Scope pattern |
|---|---|
| Developer | Own records only (`user=request.user` or `developer=request.user`) |
| Manager | Own records + records where `developer.manager == request.user` |
| HR | All developer-related records; no system settings/template-edit access |
| Admin | Everything |

Enforce via `get_queryset()` overrides per viewset rather than object-level permission checks scattered through views — keeps the scoping logic in one predictable place per resource.

---