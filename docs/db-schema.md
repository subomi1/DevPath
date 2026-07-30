# Database Schema — Developer Onboarding Portal (Django + DRF)

Structured as Django apps, since that's how you'll actually organize the project. Each app maps cleanly to a domain from the spec. I'll note relationships, key fields, and a few implementation decisions worth flagging as we go.

---

## App structure

```
accounts/        → custom User model, roles, invitations, auth
organization/     → Departments, Teams
onboarding/       → Templates, Phases, Tasks, per-developer progress
knowledge_base/   → Articles, Categories, Tags, Attachments
access_requests/  → Access Request workflow
mentorship/       → Mentor assignment, meetings, notes
announcements/    → Announcements, read tracking
```

---

## 1. `accounts`

### `User` (extends `AbstractUser`, use email as `USERNAME_FIELD`)
```
id                  UUID (pk)
email               EmailField (unique, used for login)
full_name           CharField
role                CharField (choices: admin, hr, manager, developer)
department          FK → organization.Department (nullable)
team                FK → organization.Team (nullable)
manager             FK → self (nullable, related_name='direct_reports')
mentor              FK → self (nullable, related_name='mentees')
status              CharField (choices: pending_invitation, pending_activation, active, suspended, archived)
job_role             CharField (e.g. "Backend Engineer" — distinct from `role`/system permission)
start_date          DateField (nullable)
avatar              ImageField (nullable)
phone               CharField (nullable)
created_at / updated_at
```
Note: keep `role` (system permission) and `job_role` (title/track) as clearly separate fields — this was flagged as a naming risk back in the Invite Developer UI too.

### `Invitation`
```
id                  UUID (pk)
user                FK → User (one-to-one)
invited_by          FK → User (related_name='sent_invitations')
token               CharField (unique, indexed) — securely generated, hashed at rest
onboarding_template FK → onboarding.OnboardingTemplate
expires_at          DateTimeField
accepted_at         DateTimeField (nullable)
created_at
```
Invitation creation is the trigger point: creating an `Invitation` also creates the associated `User` with `status='pending_activation'` and clones the selected template into a `DeveloperJourney` (see §3) — that clone-at-invite-time approach matters, so template edits later don't retroactively change a journey already in progress.

### Auth
- Use **`djangorestframework-simplejwt`** for JWT access/refresh tokens.
- Custom `authenticate()` backend using `email` instead of `username`.
- Password reset via DRF + a signed, time-limited token (`django.core.signing` or `PasswordResetTokenGenerator`), not the invitation token — keep these two token types and flows separate even though they look similar in the UI.
- Role-based permissions as DRF `permissions.BasePermission` subclasses (`IsAdmin`, `IsHR`, `IsManager`, `IsDeveloper`, plus composite ones like `IsManagerOfDeveloper`) rather than group/permission-table sprawl — matches the four fixed roles in the spec, no need for Django's full permission-object system.

---

## 2. `organization`

### `Department`
```
id, name, description, created_at
```

### `Team`
```
id, name, department (FK → Department), created_at
```

Straightforward two-level nesting matching the Admin "Departments & Teams" screen — no need for deeper org-chart complexity.

---

## 3. `onboarding`

This is the core domain. Two layers: **templates** (reusable, admin-authored) and **journeys** (a frozen, per-developer copy created at invitation time).

### `OnboardingTemplate`
```
id, name, target_role, description, is_active, created_by (FK → User), created_at, updated_at
```

### `TemplatePhase`
```
id, template (FK → OnboardingTemplate), name, order (IntegerField), created_at
```

### `TemplateTask`
```
id, phase (FK → TemplatePhase), title, description, category, priority (low/medium/high),
due_offset_days (IntegerField — days from start date), estimated_minutes,
verification_type (self / manager_verified / automatic),
order (IntegerField), created_at
```

### `TemplateTaskResource` (learning resources/documents attached to a task)
```
id, task (FK → TemplateTask), title, url_or_file, resource_type (link/document)
```

---

### `DeveloperJourney` (the cloned, per-developer instance)
```
id, developer (FK → User, one-to-one), template (FK → OnboardingTemplate, for reference only),
started_at, completed_at (nullable), overall_progress (cached %, recalculated on task changes)
```

### `JourneyPhase` (cloned from `TemplatePhase` at invite time)
```
id, journey (FK → DeveloperJourney), name, order
```

### `JourneyTask` (cloned from `TemplateTask`, this is what actually gets checked off)
```
id, phase (FK → JourneyPhase), title, description, category, priority,
due_date (DateField — resolved from due_offset_days + start_date),
estimated_minutes, verification_type,
status (locked / upcoming / current / completed / verified / sent_back),
completed_at (nullable), verified_by (FK → User, nullable), verified_at (nullable),
verification_note (TextField, nullable — used for "send back" reasons),
order
```
`status` here directly drives the hex-node states in the frontend (locked/upcoming = hollow, current = pulsing, completed/verified = filled).

---

## 4. `knowledge_base`

### `Category`
```
id, name, slug (fixed set per spec: Coding Standards, Git Workflow, API Documentation,
Environment Setup, Security Best Practices, FAQs, Internal Policies — seed these, don't let them be freely created unless you want that flexibility later)
```

### `Tag`
```
id, name (free-form, many-to-many with Article)
```

### `Article`
```
id, title, slug, category (FK → Category), tags (M2M → Tag),
body (TextField — markdown or rich-text JSON depending on editor choice),
author (FK → User), view_count (IntegerField, default 0),
created_at, updated_at
```

### `Attachment`
```
id, article (FK → Article), file, filename, file_size, uploaded_at
```

---

## 5. `access_requests`

### `AccessRequest`
```
id, developer (FK → User), resource (choices: github, azure_devops, sql_server, vpn,
internal_apis, test_environment, other), resource_other_label (CharField, nullable — used when resource='other'),
access_level (CharField, nullable), justification (TextField),
status (submitted / under_review / approved / completed / rejected),
reviewed_by (FK → User, nullable), rejection_reason (TextField, nullable),
created_at, updated_at
```

### `AccessRequestStatusLog` (powers the stepper's timestamps in the UI)
```
id, access_request (FK → AccessRequest), status, changed_by (FK → User), changed_at
```
Rather than only storing the current status on `AccessRequest`, log each transition — the frontend stepper needs a timestamp per stage, and this avoids overloading `updated_at`.

---

## 6. `mentorship`

Mentor assignment itself lives on `User.mentor` (§1) — this app covers the relationship's activity.

### `MentorMeeting`
```
id, developer (FK → User), mentor (FK → User), requested_at,
preferred_time_note (TextField — informal preference, not full calendar integration per the frontend spec),
scheduled_at (DateTimeField, nullable), status (requested / scheduled / completed / cancelled)
```

### `MentorNote`
```
id, developer (FK → User), mentor (FK → User), content (TextField),
is_goal (BooleanField — distinguishes general notes from onboarding goals), created_at
```

---

## 7. `announcements`

### `Announcement`
```
id, title, body (TextField/rich-text), category (orientation/engineering/office/maintenance/training),
author (FK → User), audience_scope (all / department / team / manager_team),
audience_department (FK → Department, nullable), audience_team (FK → Team, nullable),
published_at, created_at, updated_at
```

### `AnnouncementRead`
```
id, announcement (FK → Announcement), user (FK → User), read_at
```
Unique together on `(announcement, user)`. This table both drives the "unread" left-accent-bar state per user and powers the Admin read-rate stat ("62% of Engineering has read this") via a simple aggregate query against the audience.

---

## 8. Cross-cutting notes

- **Signals vs. explicit service functions**: use Django signals sparingly (e.g., `post_save` on `Invitation` → send email) but prefer explicit service-layer functions (`services/invitations.py`, `services/onboarding.py`) over signal chains for anything with real business logic like journey cloning — easier to test and reason about than implicit signal cascades.
- **Progress calculation**: `DeveloperJourney.overall_progress` should be a stored/cached field recalculated on `JourneyTask` save (via a service function called from the serializer/view, not a signal), rather than computed on every read — the dashboard and roster tables read this frequently.
- **Soft delete for `User`**: `status='archived'` is your soft-delete — never hard-delete users, since they're referenced across journeys, access requests, and announcements history.
- **DRF viewsets**: one `ModelViewSet` per resource with role-scoped querysets (e.g., `Manager` sees only `User.objects.filter(manager=request.user)` for their roster) enforced in `get_queryset()`, backed by the permission classes from §1.
- **Migrations**: seed `Category` (Knowledge Base) and default `OnboardingTemplate`s via a data migration, not admin-panel manual entry, so a fresh environment isn't empty.