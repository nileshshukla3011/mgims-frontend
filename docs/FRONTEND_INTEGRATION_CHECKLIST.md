# Frontend integration and testing checklist — MGIMS website

For connecting the backend to the website and its admin console, and for testing them together. Endpoints and payloads are in [`BACKEND_INTEGRATION_GUIDE.md`](BACKEND_INTEGRATION_GUIDE.md). The requirement-by-requirement status is in [`SRS_FRS_GAP_ANALYSIS.md`](SRS_FRS_GAP_ANALYSIS.md).

**Scope:** the public website and the admin console. The patient, student and fee portals are built by other teams. The website has only their entry points (`/patient-portal`, `/student-portal`, `/fee-portal`), set with `VITE_*_PORTAL_URL` (see the README, "Portals"); they need no API from this website's backend.

## 1. Switch the frontend to the backend

- [ ] Build both apps against the API:
  ```bash
  VITE_USE_MOCK_API=false VITE_API_BASE_URL=/api SITE_URL=https://www.mgims.ac.in npm run build
  ```
  This writes `dist/` (website) and `dist-admin/` (console).
- [ ] Leave `VITE_ADMIN_DEMO_PASSWORD` **empty**. With the backend connected it is not used, and it must never reach a production build.
- [ ] Check that no demo code shipped: `ls dist/assets dist-admin/assets | grep -i mock` prints nothing.
- [ ] Serve `index.html` for every path that is not a file (single-page app), on both hosts.
- [ ] Proxy `/api` to the backend on both hosts, so cookies are same-origin and no CORS is needed. If the API must be on another origin, see §3.
- [ ] Host the console separately, ideally reachable only from the institute's network (it has its own `robots.txt` and a `noindex` tag).
- [ ] Add the legacy-URL map `docs/legacy-redirects.nginx.conf` (926 old `index.php/...` addresses → 301 to the new pages) to the website's server configuration.
- [ ] Optional settings: `VITE_ADMIN_IDLE_MINUTES` (console idle sign-out, default 15) and `VITE_PUBLIC_SITE_URL` (console links to the website).

## 2. Contract the frontend relies on everywhere

| Topic | What the frontend does | What the backend must do |
|---|---|---|
| Language | Every website request sends `Accept-Language: en`, `hi` or `mr`, from the first request on page load | Return translated content where it exists, English otherwise |
| Format | Sends and expects JSON; field names as in `src/types/index.ts` | Use the same names (snake_case on notices: `publish_at`, `expires_at`, `is_active`) |
| Dates | ISO 8601 date-times (`2026-10-20T18:30:00.000Z`). A "remove on" date is sent as local midnight of that day | Store and compare as instants |
| Errors | Any non-2xx is a failure; the page shows its own message with a "Try again" button | Answer with the right status. `{ "message": "…" }` is welcome but not required |
| Empty optional fields | A field the editor emptied is sent as `null` in `PATCH` bodies | Clear the field on `null` |
| Deletes | Expects `204 No Content` | — |

## 3. Admin console: sign-in, session and roles

- [ ] `POST /auth/login` `{ username, password }` answers:
  - `200` with the user `{ username, name, role, departmentId }` when no second factor is needed;
  - `202` `{ mfaRequired: true, challengeId, channel: "sms" | "email" | "totp", destination }` to ask for the second factor (WEB-SEC-1: this should be every sign-in);
  - `401` `{ attemptsLeft }` for a wrong user or password (the console shows how many attempts are left);
  - `423` or `429` with a `Retry-After` header (seconds) when sign-in is locked.
- [ ] `POST /auth/mfa/verify` `{ challengeId, code }` → `200` with the user and the session cookie; `401` `{ attemptsLeft }` for a wrong code; `410` when the code expired.
- [ ] `POST /auth/mfa/resend` `{ challengeId }` sends a new code (rate-limit it).
- [ ] `GET /auth/me` → `200` with the user while the session is valid, `401` otherwise. The console calls it on load, so a reload stays signed in.
- [ ] `POST /auth/logout` ends the session.
- [ ] **Session ended:** any staff request answered `401` (other than sign-in and MFA) makes the console return to its sign-in screen with "Your session has ended. Please sign in again." Answer `401`, not `403`, when the session has expired.
- [ ] `role` is `super_admin`, `department_approver` or `department_admin`; the two department roles need a `departmentId` (e.g. `medicine`). Unknown roles are refused by the console.
- [ ] Enforce the role rules on the server and answer `403` otherwise:

| | Super admin | Department approver | Department admin |
|---|---|---|---|
| Notices, tenders, recruitment, inquiries | All | Department news only (`departmentIds` = own department) | Proposes department news (approval needed) |
| Department profile, faculty, staff, research | All | Own department, published directly | Own department, through approval |
| Approve, reject, roll back changes | All departments | Own department | — |
| Media library | All | Own department | Own department |
| Audit log, data sources, reports, exports | Yes | — | — |

- [ ] Session cookie: `HttpOnly; Secure; SameSite=Lax` when same-origin. Cross-origin console: `SameSite=None; Secure`, `Access-Control-Allow-Credentials: true` for the console's origin only (never `*`), and CSRF protection (for example, check the `Origin` header).

## 4. Website features

| ✓ | Feature | Endpoint | Check |
|---|---|---|---|
| [ ] | Notices, tenders, recruitment | `GET /notices?category=&search=&departmentId=` | Public lists contain only notices whose `publish_at` has passed (or is empty) and whose `expires_at` has not (or is empty). The frontend filters the same way as a second guard |
| [ ] | Notice page | `GET /notices/:id` | `404` for a notice scheduled for later. An expired notice still answers `200` (its page says it was removed from the lists, so old links keep working) |
| [ ] | Department notices | `GET /notices?departmentId=medicine` | Notices carry `departmentIds: string[]`; they show in the department's Notices tab and on the home page |
| [ ] | Search | `GET /search?q=` | Groups `departments`, `faculty`, `notices`, `pages`, `research`, each ranked. Only public content |
| [ ] | Search suggestions | `GET /search/suggest?q=` | Up to 8 `{ title, url, type }`, fast (it runs while typing) |
| [ ] | NMC updates (Accreditations › NMC) | `GET /regulatory-updates?source=NMC` | `RegulatoryUpdate[]`: `{ id, title, date, url, source, category? }` |
| [ ] | Blood bank (Hospital › Blood bank) | `GET /blood-availability` | `BloodAvailability`, or `null` while e-RaktKosh is not connected (the page then shows the blood bank's number) |
| [ ] | Home-page hospital figures | `GET /hospital/statistics` | `{ period, source, updatedAt?, items: [{ id, label, value, note? }] }` |
| [ ] | Result notices (Academics › Examination results) | `GET /results/public` | `[{ id, title, date, url, programme? }]` |
| [ ] | Freshness | the four endpoints above | Send `updatedAt` (time of the last sync). If a feed fails, the page shows the last copy it saw, marked "may be out of date" |
| [ ] | Feedback page | `POST /feedback/site` | Body `{ rating 1–5, lookingFor?, found?, comment?, departmentId?, page?, email? }`. Answer `{ reference }` |
| [ ] | Surveys | `GET /surveys?status=open`, `GET /surveys/:id`, `POST /surveys/:id/responses` `{ answers }` | Closed or draft surveys answer `404` |
| [ ] | Newsletter | `GET /newsletter/segments`, `POST /newsletter/subscriptions` | Send a confirmation email (double opt-in); nothing is sent before it is confirmed. Body includes `consent: true` and `language` |
| [ ] | Manage or unsubscribe | `GET`, `PATCH`, `DELETE /newsletter/subscriptions/:token` | The token comes from the email link (`/newsletter/manage?token=`). `DELETE` unsubscribes and erases the address |
| [ ] | Alumni | `GET /alumni?q=`, `POST /alumni/registrations` | Only alumni who chose `showInDirectory` are listed; registration includes `consent: true` |
| [ ] | Page feedback, inquiries, site info | existing endpoints | Unchanged; see the backend guide |

## 5. Admin console features

| ✓ | Feature | Endpoint | Check |
|---|---|---|---|
| [ ] | Approval workflow | `GET /content-changes?status=&departmentId=&author=&entity=&entityId=`; `POST /content-changes` `{ entity, action, entityId?, departmentId?, summary, before?, after?, issues?, submit }`; `POST /content-changes/:id/submit`, `/withdraw`, `/approve` `{ publishAt?, note? }`, `/reject` `{ note }` (required), `/rollback` | `ContentChange` as in `src/admin/workflow.ts`. The server applies a change when it is approved, keeps every version, and answers `403` to users who may not decide on that department |
| [ ] | Scheduled publishing | (server job) | Publishes approved changes at `publishAt`, and takes notices out of public lists at `expires_at` |
| [ ] | Direct edits by approvers | `PATCH /departments/:id`, `/faculty/:id`, `/staff/:id`, `/research-records/:id`; `POST`/`DELETE` as before | Version and audit them like approved changes |
| [ ] | Notices with dates and departments | `POST /notices` `{ title, category, date, excerpt, departmentIds?, publish_at?, expires_at? }`; `GET /notices?include=unpublished` (staff session) | The console lists scheduled and expired notices too |
| [ ] | Audit log | `GET /audit-log?actor=&action=&from=&to=` → `[{ id, at, actor, actorName, role, action, summary, entity?, entityId? }]`; `POST /audit-log/events` `{ action, summary, entity?, entityId? }` | Append-only. The server records every staff request itself; the console only posts events the server cannot see (exports built in the browser) |
| [ ] | Media library | `GET /admin/media?departmentId=`; `POST /admin/media` (multipart: `file`, `title`, `alt`, `departmentId`); `PATCH /admin/media/:id` `{ title, alt }`; `DELETE /admin/media/:id` | Re-check type and size (JPG, PNG, WebP up to 2 MB; PDF up to 10 MB), scan uploads, answer `409` when a file is still used on a page |
| [ ] | Data sources | `GET /admin/data-sources`; `PATCH /admin/data-sources/:id` `{ refreshMinutes }`; `POST /admin/data-sources/:id/sync` | `{ id, name, description, refreshMinutes, lastSyncAt?, lastStatus: OK / Failed / Never run, lastMessage? }` |
| [ ] | Service uptake | `GET /admin/analytics/service-uptake?from=&to=` | `[{ date, appointments, reportsDownloaded, payments, certificateRequests }]`, one per day. Zeros are fine while the portals are not in use |
| [ ] | Feedback by department | `GET /admin/feedback?departmentId=`; `PATCH /admin/feedback/:id` `{ status: New / Seen / Actioned }`; `GET /admin/feedback/summary?from=&to=` | Summary: `{ byDepartment: [{ departmentId?, department, responses, averageRating }], weekly: [{ week, responses, averageRating }] }`. A department admin sees only their department |
| [ ] | Surveys | `GET /admin/surveys`; `POST /admin/surveys`; `PUT /admin/surveys/:id`; `POST /admin/surveys/:id/status` `{ status }`; `GET /admin/surveys/:id/results` | Results: `{ responses, questions: [{ id, text, type, counts?, average?, texts? }] }` |
| [ ] | Newsletter segments | `GET /admin/newsletter/segments` → `[{ id, title, subscribers }]`; `GET /admin/exports/newsletter-subscribers.csv` | — |
| [ ] | Accessibility report | `GET /admin/accessibility/report` → `{ generatedAt, pages: [{ url, title?, violations: [{ id, impact, description, nodes: [{ target, html? }], helpUrl? }] }] }` | Produced by an automated axe-core run over every page (scheduled, or in CI) |
| [ ] | Exports | `GET /admin/exports/:report.csv` for `inquiries`, `staff`, `research`, `workflow`, `audit`, `newsletter-subscribers` | Super admin only; each export recorded in the audit log |

## 6. Screens to check by hand with the backend connected

**Rendering and responsive layout**
- [ ] Home, a section page, a department page, News, Search, Feedback, Alumni and the console at 375, 768 and 1280 px: no sideways scrolling, menus usable, tables scroll inside their own box.
- [ ] Dark and high-contrast modes, and the largest text size, on the same pages.
- [ ] Hindi and Marathi: labels fit; translated content appears where the backend has it.
- [ ] Keyboard only: skip link, menus, search suggestions (arrow keys, Enter, Esc), dialogs (focus moves in, Esc closes, focus returns).

**Loading, empty and error states**
- [ ] Slow network (browser throttling): skeletons appear, nothing jumps or flashes an error.
- [ ] Empty answers: each list says there is nothing to show (no notices for a department, no survey open, no alumni found, nothing waiting for approval).
- [ ] Failed answers (stop the API): each section shows "could not be loaded" with "Try again"; dynamic feeds show their last copy with its age.
- [ ] Console: a save that the server refuses (`403`) leaves the form filled in with an error message.

**Client-side validation (the server must validate the same)**

| Form | Rules in the browser |
|---|---|
| Feedback | Rating required; email optional but valid; consent required when an email is given |
| Survey | Every required question answered |
| Newsletter | Valid email, at least one topic, consent |
| Alumni registration | Name; joining year (4 digits, 1960 onwards); valid email; 10-digit mobile if given; consent |
| Inquiry | Existing rules (name, email, 10-digit mobile, category, message, consent) |
| Console: notice and department news | Title (up to 200 characters) and text required; content checks (pasted HTML, placeholders, "click here", bare URLs…); removal date after the publication date and in the future |
| Console: department profile, faculty, staff, research | Required fields per form; faculty emails and phones; staff dates as DD/MM/YYYY; content checks |
| Console: media | File type and size as above; a description for every image, and not the file name |
| Console: survey builder | At least one question; choice questions need two or more choices |
| Console: sign-in | User ID and password; one-time code |

## 7. Go-live items

- [ ] `SITE_URL` set at build time: it is used in `sitemap.xml`, `robots.txt`, canonical links, the link-preview image and the organisation's structured data.
- [ ] Legacy redirects installed (§1) and spot-checked: `/index.php/hospital/hospital-charges` → `/hospital/charges`.
- [ ] Link previews on social media show the site-wide title and image, because those services do not run scripts. For per-page previews, pre-render the pages' `<head>` at the server (a backend or hosting decision).
- [ ] Photos still load from mgims.ac.in: copy them to the new hosting (see `CONTENT_REVIEW.md` §3).
- [ ] Remove or confirm content awaiting MGIMS (`CONTENT_REVIEW.md`); policy texts are still missing.

## 8. What was checked during development (14 October 2026, demo mode unless noted)

| Check | Result |
|---|---|
| Type-check (`tsc -b`), lint (`oxlint`) | Pass; lint shows only the 4 warnings present before this work |
| Every public route at 1280 and 375 px with axe-core (WCAG 2.1 A/AA) | 0 violations, no sideways overflow, one `h1` per page (see the handover report for the latest full run) |
| Console: sign-in with second factor, lockout, roles, approvals, scheduling, rollback, media, audit, data sources, reports, idle sign-out | Pass (browser test, 47 checks) |
| Departmental approver role | Pass (17 checks): a department admin's change waits for the department's approver; another department's approver cannot see it; approvers publish their own edits |
| Notice publication window and page metadata | Pass (27 checks): scheduled and expired notices left out of public lists; console shows their status; canonical link, Open Graph and structured data on each page |
| **Live mode against a simulated backend** (requests intercepted in the browser) | Pass (11 website and console checks; 16 more for the portal screens, which were later removed): notices filtered; `Accept-Language` on every request, Hindi from the first request when saved; console sign-in with `401` / `423` + `Retry-After` / `202` second factor; approver queue asks only for its department; approval posted; a `401` returns the console to sign-in with the reason |

Browser tests ran with Playwright and axe-core during development; the scripts are not part of the repository.
