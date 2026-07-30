# Frontend & UI Design Prompt — Developer Onboarding Portal

Use this document as a standalone brief to design and build the frontend (React + Tailwind CSS) for the Developer Onboarding Portal. It defines the visual direction, design system, and a page-by-page specification of layout and behavior for all four roles: Admin, HR, Manager, Developer.

---

## 1. Product Context

This is an **internal enterprise tool** used by a software company (fintech-style, e.g. AppZone) to onboard new engineers. It is not a marketing site and not a generic SaaS dashboard template — it should feel like an internal tool built by a strong platform team: fast, dense-but-legible, trustworthy, and built around real engineering workflows (git, environments, access requests, code standards) rather than generic HR language.

There is no public sign-up. Every user arrives via invitation. The tool is used daily by developers during their first two weeks, and periodically after that by managers, HR, and admins.

---

## 2. Design Direction

**Avoid the generic AI-generated look**: no cream background + terracotta accent, no near-black + neon-green developer-tool cliché, no broadsheet hairline-rule newspaper layout. Ground the design in the actual subject matter: engineering onboarding. Borrow structural cues from tools engineers already trust and recognize — git branches/commits as a visual metaphor for progress, terminal/monospace accents for technical content, PR-style status chips, changelog-style activity feeds — but keep it restrained and enterprise-appropriate, not "hacker aesthetic."

**Signature element**: the onboarding journey itself should be the memorable moment of the product — visualized as a branching path/timeline (like a git log or a commit graph) rather than a flat checklist or a generic progress bar. Days/phases are commits along a line; completed tasks are filled nodes, current tasks are highlighted, future tasks are dim.

### 2.1 Color System

Define these as Tailwind theme tokens (adjust exact hex slightly during implementation if needed, but keep the relationships):

- `--color-canvas`: `#F7F8FA` — main app background, cool neutral (not warm cream)
- `--color-surface`: `#FFFFFF` — cards, panels
- `--color-ink`: `#12161C` — primary text, near-black with a blue undertone
- `--color-ink-muted`: `#5B6472` — secondary text
- `--color-border`: `#E2E5EA` — hairline borders, dividers
- `--color-primary`: `#2454FF` — primary brand/action blue (buttons, links, active states) — confident, not generic SaaS-purple
- `--color-primary-ink`: `#0F2E9E` — hover/pressed state of primary
- `--color-success`: `#1A8754` — completed, approved
- `--color-warning`: `#B5750A` — due soon, pending
- `--color-danger`: `#C4362F` — overdue, rejected, blocked
- `--color-info`: `#5B6472` on `#EEF1F5` — neutral informational chips

Status colors are used **only** on small chips/badges/progress fills — never as large background fields — so the interface reads as calm and professional, with color reserved for meaning.

### 2.2 Typography

- **Display / headings**: `Söhne` or `General Sans` (fallback: `Inter`, semi-bold/bold) — clean grotesque, used for page titles and section headers only.
- **Body**: `Inter` — used for all UI text, labels, forms, tables. Optimized for density and legibility at small sizes (13–15px base).
- **Monospace**: `JetBrains Mono` or `IBM Plex Mono` — used deliberately for anything technical: repo names, environment variables, commands, API endpoints, access-request resource names, code snippets in the knowledge base. This is the detail that signals "built for engineers."

Type scale (rem, approx): 12 (caption/meta) / 13 (body-sm) / 14 (body, default UI) / 16 (body-lg) / 20 (h3) / 24 (h2) / 32 (h1/page title). Weight range 400/500/600/700 only — no light weights (poor legibility at small UI sizes).

### 2.3 Layout

- 12-column responsive grid, 24px gutter, max content width 1440px on large screens.
- Persistent left sidebar navigation (240px expanded / 64px collapsed) for all authenticated roles, role-aware (nav items change by role).
- Top bar (56px) with breadcrumb/page title on the left, global search, notifications bell, and account menu on the right.
- Cards use 8px corner radius, 1px `--color-border`, subtle shadow only on hover/modals (flat by default — avoid heavy drop shadows, which read as templated).
- Consistent 24px page padding, 16px gap between cards in a grid.

### 2.4 Motion

Minimal and purposeful:
- Sidebar collapse/expand: 200ms ease.
- Task completion: node fill animates on the journey graph (400ms) — this is the one moment of delight, used sparingly.
- Toasts slide in from top-right, auto-dismiss 4s.
- No page-load choreography, no scroll-triggered reveals — this is a daily-use tool, not a landing page. Respect `prefers-reduced-motion` throughout.

---

## 3. Core Components (build these first, as a shared library)

- **Button**: primary (filled blue), secondary (outline), ghost (text-only), destructive (red outline→filled on hover). Sizes: sm/md/lg. Always paired with an active-state label (e.g., "Publish" → toast says "Published").
- **Status Pill**: rounded-full, small dot + label. Variants map to the color system: `Pending`, `In Progress`, `Completed`, `Overdue`, `Approved`, `Rejected`, `Under Review`.
- **Progress Bar**: thin (6px) rounded track, filled with primary color; used in cards and headers. A circular variant (ring) is used for the dashboard hero progress.
- **Journey Graph Node**: circular node + connecting line, three states (done/current/upcoming), used only in the onboarding journey view.
- **Card**: white surface, border, optional header with title + action.
- **Data Table**: sticky header, sortable columns, row hover, right-aligned actions column, pagination footer. Dense row height (44px) by default with a "comfortable" toggle.
- **Modal / Drawer**: modals for short confirmations (max 2 fields), right-side drawers for anything with more than 3 fields (invite developer, new access request, edit template).
- **Form fields**: label above input, 14px, helper text below in `--color-ink-muted`, error state in `--color-danger` with a specific message (never "invalid input").
- **Empty State**: icon + one-line explanation of what's missing + a primary action if applicable. Written as an invitation to act, not an apology.
- **Toast**: success/error/info variants, icon-led, one line.
- **Avatar**: initials-based by default, with role-colored ring (Admin/HR/Manager/Developer each get a subtle ring color for quick scanning in tables).

---

## 4. Global Navigation (role-aware sidebar)

**Developer**: Dashboard · My Journey · Knowledge Base · Access Requests · My Mentor · Announcements · Profile

**Manager**: Dashboard · My Team · Approvals · Announcements · Profile

**HR**: Dashboard · Invite Developer · Developers · Onboarding Templates (read/select) · Announcements · Profile

**Admin**: Dashboard · Users & Roles · Departments & Teams · Onboarding Templates · Knowledge Base · Announcements · System Settings

Sidebar always shows the logged-in user's name, role badge, and avatar at the bottom, with a sign-out affordance.

---

## 5. Public / Unauthenticated Pages

### 5.1 Login
Centered card (max-width 400px) on the canvas background, no marketing copy. Company logo top-left of the card. Fields: Company Email, Password (with show/hide toggle). Primary button: "Log in." Link below: "Forgot password?" No "Sign up" link anywhere (reinforce invite-only model — instead, small footnote: "Access is by invitation only. Contact HR if you need access."). Inline error banner (not a toast) if credentials are invalid: "Email or password is incorrect." Separate distinct error if the account is not yet active: "Your account hasn't been activated yet. Check your email for the activation link."

### 5.2 Forgot Password
Same centered-card layout. Single email field. On submit, replace the form with a confirmation state in place (not a redirect): "If an account exists for this email, we've sent a reset link." (Avoids confirming whether an email exists, a standard security pattern — mention this choice to the engineering team as intentional.)

### 5.3 Reset Password
Token validated on page load (show a loading spinner briefly, then either the form or an "This link has expired" error state with a button to request a new one). Fields: New Password, Confirm Password, with a live password-strength meter (weak/fair/strong bar under the field, not a blocking gate beyond a minimum).

### 5.4 Account Activation
Multi-step but on a single scrolling page (not a wizard — the developer wants this done fast):
1. Welcome header: "Welcome to [Company], {FirstName}." pulled from the invitation.
2. Set Password / Confirm Password fields with strength meter.
3. Company policies checkbox (optional, per spec) — collapsed accordion showing policy text, checkbox below it.
4. Primary button: "Activate account." On success, redirect to Login with a success toast: "Account activated. Log in to get started."

---

## 6. Developer Experience

### 6.1 Developer Dashboard
This is the most important screen in the product — it should orient a nervous new hire in under 5 seconds.

Layout (top to bottom):
- **Hero row**: Left — "Welcome back, {Name}" + one line naming today's phase (e.g., "Day 2 · Environment Setup"). Right — circular progress ring showing overall onboarding completion %.
- **Row of 3 stat cards**: Today's Tasks (count), Upcoming Events (count + next one's date), Open Access Requests (count by status).
- **Today's Tasks card** (largest element): list of today's tasks with checkboxes, priority dot, and estimated time; clicking a task opens its detail drawer.
- **Two-column lower section**:
  - Left: **Assigned Mentor** card — avatar, name, role, "Message" and "Schedule meeting" buttons.
  - Right: **Recent Announcements** card — last 3, each with a small "unread" dot, "View all" link.
- **Quick Links** row at the bottom: pill-shaped shortcuts to Knowledge Base, Access Requests, Journey — icon + label.

Empty/edge states: if it's Day 1 and no tasks are complete yet, the hero should say "Let's get started" rather than showing 0%.

### 6.2 My Journey (the signature screen)
Vertical branch/timeline visualization (the git-log-inspired signature element from §2). Each phase ("Before Day 1," "Day 1"..."Day 5" or however the assigned template defines it) is a labeled segment on the line. Within a segment, tasks are nodes; completed = filled with a check, current/active = filled with pulse ring, locked/future = hollow and dimmed with a lock icon if it depends on an earlier task.

Clicking a node opens a right-side drawer with: title, description, category, priority, due date, estimated time, verification type (self / manager-verified / automatic), and a "Mark complete" button (or "Awaiting manager verification" status if applicable, non-interactive). A filter/toggle at the top lets the developer switch between "Timeline view" and "Checklist view" (a flat, dense list) for accessibility and for those who prefer scanning a list.

### 6.3 Knowledge Base
- List view: left sidebar of categories (Coding Standards, Git Workflow, API Docs, Environment Setup, Security, FAQs, Policies), main area is a searchable, tag-filterable article grid (title, short excerpt, last-updated date, author avatar).
- Article view: clean reading layout, max-width 720px for text, sticky "on this page" mini table of contents on the right for long articles, code blocks in the monospace face with a copy button, attachments listed at the bottom as file chips.

### 6.4 Access Requests
- **List view**: table of the developer's requests — Resource, Requested Date, Status pill (Submitted → Under Review → Approved → Completed, shown also as a small horizontal stepper inline in the row), Actions.
- **New Request**: drawer form — Resource (dropdown: GitHub, Azure DevOps, SQL Server, VPN, Internal APIs, Test Environment, or "Other" with free text), Justification (textarea), Access Level if applicable. Submit shows a toast and adds the row with status "Submitted."
- **Request Detail**: drawer showing the full stepper with timestamps at each stage and who approved it.

### 6.5 My Mentor
Single-page profile layout: large mentor card at top (avatar, name, title, team, contact icons for email/Slack), "Request a meeting" primary button opening a simple date/time-preference form (not a full calendar integration unless in scope), a Notes/Goals section (read-only, populated by the mentor), and a simple list of scheduled/past meetings below.

### 6.6 Announcements
Feed layout, most recent first, filter chips at top (All / Orientation / Engineering / Office / Maintenance / Training). Unread items have a left accent bar and bold title. Clicking marks as read and expands inline (accordion) rather than navigating away, since announcements are short.

### 6.7 Profile / Settings
Simple form: personal info (mostly read-only, editable fields limited — e.g., phone, emergency contact if in scope), password change, notification preferences (email/in-app toggles per category).

---

## 7. Manager Experience

### 7.1 Manager Dashboard
- Stat row: Assigned Developers, Average Progress %, Overdue Tasks (red if >0), Pending Approvals.
- **Team roster table**: developer name/avatar, role/template, progress bar (inline), status pill, days since start, "View" action.
- **Pending Approvals** card: compact list of tasks/requests awaiting this manager's sign-off, with inline Approve/Reject buttons (reject opens a small reason field).
- **Team onboarding analytics**: a simple bar/line chart (e.g., average time-to-complete-phase, or cohort progress comparison) — keep this genuinely useful, not decorative.

### 7.2 Developer Detail (from roster)
Read-only mirror of the developer's own Journey view, plus a manager-only "Verification queue" section listing tasks marked "manager verified" that are awaiting this manager's action, and an activity log of the developer's recent actions.

### 7.3 Approvals
Dedicated table view (superset of the dashboard widget) for both task verifications and access-request approvals, filterable by type/status, with bulk-approve for straightforward cases.

### 7.4 Announcements (compose)
Same feed as developer view, plus a "New Announcement" button opening a drawer: Title, Body (rich text, minimal toolbar: bold/italic/list/link), Category, audience scope if applicable.

---

## 8. HR Experience

### 8.1 HR Dashboard
Stat row: Active Onboardings, Pending Activations, Completed This Month, Overdue Onboardings. Below: a table of all in-progress onboardings across managers/teams (searchable/filterable by department, template, status), each row showing overall progress and a "View" action into a read-only version of the developer's journey.

### 8.2 Invite Developer (the key HR flow)
This should feel like a guided, low-friction form, not a long single page. Use a **right-side drawer with a short numbered stepper** (2–3 steps, not more):
1. **Basics**: Full Name, Company Email, Department, Team.
2. **Assignment**: Role, Manager (searchable select), Mentor (searchable select), Start Date, Onboarding Template (cards with template name + short description, radio-select).
3. **Review & Send**: summary of everything entered, "Send Invitation" button. On success: toast + the new record appears at the top of the Developers list with status "Pending Activation."

### 8.3 Developers (directory)
Full searchable/filterable table of all developer users (by status, department, template, manager), with the same drawer-based detail view as the dashboard.

### 8.4 Onboarding Templates (HR view)
Read view only for HR (per spec, HR selects but doesn't build templates) — card grid of available templates with name, target role, phase/task counts, and a preview of the journey structure. HR cannot edit here; if they need a new template, a note directs them to Admin.

---

## 9. Admin Experience

### 9.1 Admin Dashboard
System-health-oriented: total users by role (small donut or stacked bar), recent system activity feed, quick links to the management areas below.

### 9.2 Users & Roles
Full data table, all users regardless of role, with role badge, status pill, department, and inline actions (edit role, suspend, archive, resend activation). Creating an HR or Manager account uses a drawer form similar in spirit to Invite Developer but simpler (name, email, role, department).

### 9.3 Departments & Teams
Two-level management: a list of departments, each expandable to show its teams, with add/edit/archive actions. Simple nested list UI, not a complex org chart (unless later requested).

### 9.4 Onboarding Templates (builder)
This is the most complex admin screen. Left panel: list of templates (Backend, Frontend, QA, DevOps, PM, +New). Main panel, once a template is selected: a **phase builder** — reorderable phases (Before Day 1, Day 1, Day 2...), each expandable to show its tasks in a reorderable list. Each task row has quick-edit inline (title, category, priority, due offset, verification type) and a "+ Add Task" affordance per phase. A "+ Add Phase" affordance at the bottom. Save state should be explicit (a persistent "Save changes" bar appears once edits are made, not silent autosave, so admins trust what's live for future invitations vs. draft).

### 9.5 Knowledge Base (management)
Same reading layout as developer view, plus an editor mode: rich-text/markdown editor for articles, category/tag assignment, attachment upload, and a version/last-updated trail.

### 9.6 Announcements (management)
Same as manager compose view, plus the ability to edit/archive any announcement system-wide and see read-rate analytics per announcement (simple: "62% of Engineering has read this").

### 9.7 System Settings
Grouped settings panels (not one long form): General (company name, logo), Security (password policy, session timeout), Email Templates (invitation/reset email previews), Integrations (placeholders for GitHub/Azure DevOps/SSO if in scope).

---

## 10. States, Errors, and Voice

- Errors are specific and actionable, written in the interface's voice: "This email is already invited" not "Error 409." Never blame the user, never apologize.
- Empty states always name what's missing and, where relevant, offer the action that fills it (e.g., Access Requests empty state: "No access requests yet." + "Request access" button).
- Loading states use skeleton screens matching the final layout (not spinners) for tables and cards; spinners are reserved for button-level async actions.
- Buttons show a loading state on click and disable to prevent double-submits (e.g., invitations, approvals).

---

## 11. Responsive & Accessibility Requirements

- Fully responsive down to a 375px mobile viewport: sidebar collapses to a bottom nav or hamburger drawer, tables become stacked cards, drawers become full-screen sheets.
- All interactive elements have a visible keyboard focus ring using `--color-primary`.
- Color is never the sole indicator of status — every status pill pairs color with a label/icon.
- Contrast ratios meet WCAG AA at minimum for all text/background pairs in the token system above.
- Respect `prefers-reduced-motion` for all transitions.

---

## 12. Deliverable Instructions for Implementation

- Build with **React + Tailwind CSS**, using the token system in §2 as the Tailwind theme extension (colors, font families, border radius, spacing scale).
- Structure the shared component library (§3) first, in a `components/ui` directory, before building page-level screens.
- Build the role-aware app shell (§4) next, then implement pages role by role: Developer → Manager → HR → Admin, since Developer contains the richest/most novel components (journey graph) that others reuse patterns from.
- Use realistic placeholder/mock data reflecting the example content in the product spec (department names, template names, task examples) rather than lorem ipsum, so the design reads true to the product.