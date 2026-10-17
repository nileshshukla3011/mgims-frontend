# MGMIS Web Portal — Backend & Database Integration Guide

Welcome to the **Mahatma Gandhi Institute of Medical Sciences (MGIMS), Sevagram** portal development repository.

This document serves as the handoff contract and guide for the **Backend & Database Engineer**. The React frontend has been built following the Government of India's **UX4G (User Experience for Government)** guidelines and is fully integrated with a flexible API service layer (`src/services/api.ts`).

---

## 1. Quick Switch: Mock Mode vs. Live Backend API

The frontend includes a toggle switch controlled by environment variables in `.env`:

```env
# Set to 'false' when your backend server is running
VITE_USE_MOCK_API=false

# Base URL pointing to your backend REST API or GraphQL gateway
VITE_API_BASE_URL=http://localhost:5000/api

# Demo only (mock mode): password that opens the admin console. Leave unset in production;
# with no value the console never opens in mock mode.
VITE_ADMIN_DEMO_PASSWORD=

# Admin console: minutes without activity before it signs out (default 15)
VITE_ADMIN_IDLE_MINUTES=

# Production origin, read at build time: sitemap.xml, robots.txt, canonical links, link-preview image, structured data
SITE_URL=https://www.mgims.ac.in
```

- When `VITE_USE_MOCK_API=true` (default), the frontend uses the high-fidelity scraped datasets extracted into `src/data/*.json`.
- When set to `false`, the frontend makes asynchronous `fetch` calls to your endpoints.

---

## 2. Recommended Database Schema Entities

The scraped dataset has been structured into clean schemas that you can map to SQL tables (PostgreSQL/MySQL) or MongoDB collections:

### 1. `departments` Table
| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR(50) PRIMARY KEY | Slug (e.g. `medicine`, `anatomy`, `radiotherapy`) |
| `name` | VARCHAR(100) NOT NULL | Department Name |
| `category` | VARCHAR(50) | `Pre-clinical`, `Para-clinical`, `Clinical`, `Super-speciality` |
| `overview` | TEXT | Executive summary of department |
| `text` | LONGTEXT | Full department history and details |
| `paragraphs`| JSONB / JSON | Array of structured paragraphs |
| `headings` | JSONB / JSON | Subheadings and focus areas |
| `faculty_ids`| JSONB / ARRAY | References to associated faculty |

### 2. `faculty` Table
| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR(50) PRIMARY KEY | Unique identifier / slug |
| `name` | VARCHAR(150) NOT NULL | Full name with title (e.g. `Dr. SP Kalantri`) |
| `slug` | VARCHAR(100) UNIQUE | URL friendly slug |
| `department` | VARCHAR(100) | Department name |
| `designation` | VARCHAR(100) | Professor & Head, Associate Professor, etc. |
| `bio` | TEXT | Biography and clinical focus |
| `text` | LONGTEXT | Full faculty academic profile |
| `phones` | JSONB / ARRAY | Contact phone numbers |
| `emails` | JSONB / ARRAY | Official email addresses |

### 3. `notices` Table (Covers 675 EasyBlog articles)
| Column | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Notice reference number |
| `title` | VARCHAR(255) NOT NULL | Announcement title |
| `category` | VARCHAR(50) | `Tender`, `Recruitment`, `Eligible/Ineligible List`, `CME & Academic Events`, `Awards & Honors`, `News & Events` |
| `date` | VARCHAR(50) | Publication date (e.g. `05 October 2026`); may be empty |
| `hits` | INT | View counter, as scraped; may be empty, and the frontend then hides it |
| `excerpt` | TEXT | Short summary for cards |
| `text` | LONGTEXT | Full article body |
| `doc_links` | JSONB / JSON | Attached tender/form links `[{ url, text }]` (the scrape captured none; fill these when notices are re-entered) |
| `attachments_url` | VARCHAR(500) NULL | Original notice page, set when the notice mentions attachments that are not in `doc_links`; the notice page links to it. Drop once `doc_links` are filled |
| `is_active` | BOOLEAN | Active flag for current tenders/jobs |
| `department_ids` | JSONB / ARRAY | Departments the notice belongs to (JSON field `departmentIds`); it then shows on those department pages (WEB-DYN-3) |
| `publish_at` | TIMESTAMPTZ NULL | Scheduled publication; the notice is not public before it (WEB-CMS-6) |
| `expires_at` | TIMESTAMPTZ NULL | Automatic removal from public lists; the notice page itself stays reachable (WEB-CMS-6) |

### 4. `hospital_services` Table
| Column | Type | Description |
|---|---|---|
| `slug` | VARCHAR(50) PRIMARY KEY | Service slug (e.g. `charges`, `emergency`, `opd`, `cath-lab`) |
| `title` | VARCHAR(150) NOT NULL | Title of service or wing |
| `paragraphs`| JSONB / JSON | Detailed clinical service descriptions |
| `tables` | JSONB / JSON | Tariff tables, OPD schedules, bed strengths |

### 5. `directory_contacts` Table
| Column | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Auto ID |
| `title` | VARCHAR(100) | Section name (e.g. `Dean Office`, `Blood Bank`, `Accounts`) |
| `person` | VARCHAR(100) | Official name |
| `role` | VARCHAR(100) | Designation |
| `raw_details`| TEXT | Extension number, phone, email |
| `phones` | JSONB / ARRAY | Phone array |
| `emails` | JSONB / ARRAY | Email array |

### 6. `citizen_inquiries` Table (Form Submissions)
| Column | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Unique inquiry ticket ID |
| `name` | VARCHAR(100) | Citizen / patient name |
| `email` | VARCHAR(100) | Email address |
| `phone` | VARCHAR(20) | Mobile number |
| `ticket_id` | VARCHAR(20) UNIQUE | Public ticket shown to the citizen, e.g. `MGIMS-2026-00001` |
| `category` | VARCHAR(50) | `General Enquiry`, `MBBS Admissions`, `Hospital Charges`, `Tenders`, `Recruitment`, `Grievance` |
| `message` | TEXT | Inquiry message |
| `consent` | BOOLEAN | Citizen agreed to the Privacy Policy (required, UX4G 5.1.6) |
| `created_at` | TIMESTAMP | Submission timestamp |
| `status` | VARCHAR(20) | `Received`, `In Progress`, `Resolved` |

### 7. `inquiry_updates` Table (status history shown on the tracking page)
| Column | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | |
| `ticket_id` | VARCHAR(20) | References `citizen_inquiries.ticket_id` |
| `note` | TEXT | Update shown to the citizen |
| `created_at` | TIMESTAMP | |

### 8. `page_feedback` Table
| Column | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | |
| `page` | VARCHAR(200) | Page or step the feedback is about |
| `helpful` | BOOLEAN | Yes / No answer |
| `comment` | TEXT NULL | Optional comment (max 500 characters) |
| `created_at` | TIMESTAMP | |

### 9. `hospital_charges` Table (official tariff)
The Hospital Charges page shows the tariff that the official page embeds from a published Google Sheet (saved by `scripts/fetch_embedded_sheets.py`; data in `src/data/hospital_charges.json`): 2,094 items in four sections.

| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR(20) PRIMARY KEY | e.g. `charge-0001` |
| `section` | VARCHAR(50) | `Investigation Charges`, `Bed Charges`, `Anaesthesia Charges`, `Diet Charges` |
| `name` | VARCHAR(200) | Service, as published |
| `insured` | NUMERIC | Rate for insured patients, in rupees |
| `general` | NUMERIC | Rate for general patients, in rupees |
| `private` | NUMERIC NULL | Rate for private patients (bed, anaesthesia and diet charges only) |

### 10. `research_records` Table (Research section)
One table for theses, undergraduate research, publications, funded projects and paper presentations. The extracted data is in `src/data/research/*.json`, one file per kind.

| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR(40) PRIMARY KEY | e.g. `thesis-0001` |
| `kind` | VARCHAR(20) NOT NULL | `thesis`, `student-research`, `publication`, `funded-project`, `presentation` |
| `year` | VARCHAR(7) NULL | `2021` for theses; academic year `2021-22` for the others; empty for presentations |
| `department_id` | VARCHAR(50) NULL | References `departments.id`; decides which department admin may manage the record. Empty only for undergraduate records with no department (super admin only) |
| `department` | VARCHAR(100) NULL | Department name as displayed |
| `category` | VARCHAR(150) NULL | Undergraduate programme, e.g. `ICMR short-term studentships (ICMR-STS)` |
| `people` | TEXT NULL | Student(s), authors, investigators or presenters |
| `guide` | VARCHAR(200) NULL | Guide(s) of a thesis or student project |
| `title` | TEXT NOT NULL | Title, or the description of a presentation |
| `details` | TEXT NULL | Degree, journal citation, venue, award or funding details; one item per line, `Label: value` where there is a label |

The Student Research page also shows, per academic year, the Committee for Promotion of Undergraduate Research, award results and other notes, plus the scheme's description. These are in `src/data/research/student_research_info.json` (`{ intro, scheme, years: [{ year, source, inferred, committee, notes }] }`).

### 11. `staff_records` Table (official staff lists)
Academics › Teaching & non-teaching staff shows the three lists that the official Teaching staff, Non-teaching staff and Senior residents pages embed from published Google Sheets (saved by `scripts/fetch_embedded_sheets.py`; data in `src/data/staff.json`): 132 teaching staff, 881 non-teaching staff and 67 senior residents. The official non-teaching list also gives each person's caste, gender and employee number. These are not extracted and should not be stored for the website (data minimisation under the DPDP Act, 2023; FRS WEB-SEC-6).

| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR(40) PRIMARY KEY | e.g. `staff-teaching-0001` |
| `staff_group` | VARCHAR(20) NOT NULL | `teaching`, `non-teaching`, `senior-resident` (JSON field `group`) |
| `name` | VARCHAR(150) NOT NULL | Name with title, as published |
| `designation` | VARCHAR(100) NULL | e.g. `Professor & Head`, `Staff Nurse`, `Senior Resident` |
| `department_id` | VARCHAR(50) NULL | References `departments.id`; decides which department admin may manage the record. Empty for hospital units that are not departments (e.g. Matron Office) and for visiting faculty whose speciality is not a department (super admin only) |
| `department` | VARCHAR(100) NULL | Department, unit or (visiting faculty) speciality, as displayed |
| `joined` | VARCHAR(10) NULL | Teaching staff: date of joining MGIMS, `DD/MM/YYYY` |
| `last_promotion` | VARCHAR(10) NULL | Teaching staff: date of last promotion, `DD/MM/YYYY` |
| `status` | VARCHAR(20) NULL | Non-teaching staff: `Regular`, `Contractual` or `Adhoc` |
| `staff_class` | VARCHAR(20) NULL | Non-teaching staff: `III Class` or `IV Class` |

Each list also has a title, the official page it comes from, and the date the list was last updated (`October 2025` for non-teaching staff, `31/8/2025` for senior residents; none for teaching staff). Keep these per list, or derive the date from the latest change.

---

## 3. Required REST API Endpoints Specification

### Medical Departments
- `GET /api/departments`
  - Response: `Department[]`
- `GET /api/departments/:id`
  - Response: `Department`

### Faculty Directory
- `GET /api/faculty`
  - Response: `FacultyMember[]`
- `GET /api/faculty/:id`
  - Response: `FacultyMember`

### Notices, Tenders & Recruitment
- `GET /api/notices?category={category}&search={search}&departmentId={id}`
  - Response: `NoticeSummary[]` — list fields only (`id, title, category, date, hits, excerpt, url, is_active, departmentIds, publish_at, expires_at`), no article body, so list pages stay small
  - Public answers contain only notices inside their window: `publish_at` empty or past, and `expires_at` empty or future. The frontend filters the same way as a second guard
  - `include=unpublished` *(staff session)*: also scheduled and expired notices, for the admin console
- `GET /api/notices/:id`
  - Response: `NoticeItem`. `404` while the notice is scheduled for later; an expired notice still answers `200`, so old links keep working (its page says it was removed from the lists)
- `GET /api/tenders`
  - Response: `NoticeItem[]` (filtered where category='Tender')
- `GET /api/recruitment`
  - Response: `NoticeItem[]` (filtered where category='Recruitment')

### Hospital & Patient Care
- `GET /api/hospital`
  - Response: `Record<string, GenericPageContent>`
- `GET /api/hospital/:slug`
  - Response: `GenericPageContent`

### Institute & Governance
- `GET /api/institute`
  - Response: `Record<string, GenericPageContent>`
- `GET /api/institute/:slug`
  - Response: `GenericPageContent`

### Academics, Research & Accreditations
- `GET /api/academics`
  - Response: `Record<string, GenericPageContent>`
- `GET /api/research`
  - Response: `Record<string, GenericPageContent>`
- `GET /api/accreditations`
  - Response: `Record<string, GenericPageContent>`

### Directory & Inquiries
- `GET /api/directory`
  - Response: `ContactCard[]`
- `POST /api/inquiries`
  - Request body: `{ name, email, phone, category, message }`
  - Response: `InquiryRecord` — `{ ticketId, status, createdAt, updates: [{ at, note }], ...input }`
- `GET /api/inquiries/:ticketId?phone={mobile}`
  - Public tracking. Return the record only when the phone matches; otherwise 404 (do not reveal whether the ticket exists).
- `GET /api/inquiries` *(staff only)*
  - Response: `InquiryRecord[]`
- `PATCH /api/inquiries/:ticketId` *(staff only)*
  - Request body: `{ status, note }` — appends an entry to `updates`

### Hospital charges and site information
- `GET /api/hospital-charges`
  - Response: `HospitalCharges` — `{ source, sections: [{ title, columns: ['Insured', 'General', 'Private'?] }], items: [{ id, section, name, insured, general, private? }] }`
- `GET /api/site-info`
  - Response: `{ lastUpdated }`, e.g. `{ "lastUpdated": "06 October 2026" }`; shown in the footer

### Notices (admin console)
- `POST /api/notices` *(staff only)* — body: `{ title, category, date, excerpt, departmentIds?, publish_at?, expires_at? }`; response: the created `NoticeSummary` with its `id`. Super admins may post any notice; a department approver only department news with `departmentIds: [their department]`
- `DELETE /api/notices/:id` *(staff only, super admin)* — `204 No Content`. The console sends it 8 seconds after the admin deletes a notice (the Undo time), or at once when they delete another notice or sign out.

### Research records
- `GET /api/research-records?kind={kind}`
  - Response: `ResearchRecord[]` (fields as in the table above, camelCase: `departmentId`)
- `GET /api/student-research-info`
  - Response: `StudentResearchInfo`
- `POST /api/research-records` *(staff only)* — body: a record without `id`; response: the created record
- `PATCH /api/research-records/:id` *(staff only)* — body: the edited fields (an emptied optional field is sent as `null`); response: the updated record
- `DELETE /api/research-records/:id` *(staff only)* — `204 No Content`
- Rules: a department admin may create, edit and delete only records whose `departmentId` is their own department, and may not change a record's department; records without a department are the super admin's. Answer `403` otherwise.

### Staff lists (employee records)
- `GET /api/staff`
  - Response: `StaffDirectory` — `{ groups: [{ id, title, updated?, source, count }], records: StaffRecord[] }`, where `id` is `teaching`, `non-teaching` or `senior-resident` and records use the fields of the table above in camelCase (`group`, `departmentId`, `lastPromotion`, `staffClass`). This is public: return only these fields.
- `POST /api/staff` *(staff only)* — body: a record without `id`; response: the created record
- `PATCH /api/staff/:id` *(staff only)* — body: the edited fields (an emptied optional field is sent as `null`); response: the updated record
- `DELETE /api/staff/:id` *(staff only)* — `204 No Content`
- Rules: a department admin may add, edit and remove only staff whose `departmentId` is their own department, and may not move anyone to another department; records without a department (hospital units, visiting faculty of other specialities) are the super admin's. Answer `403` otherwise. Keep `count` in `groups` up to date.

### Feedback
- `POST /api/feedback`
  - Request body: `{ page, helpful, comment? }`

### Staff sign-in
Two steps with a second factor, lockout and session expiry are described in §3b below.
- `POST /api/auth/login`
  - Request body: `{ username, password }`; respond `200` and set an HttpOnly, Secure, SameSite session cookie on success, `202` to ask for the second factor, `401` otherwise.
  - Store passwords hashed (bcrypt or argon2), rate-limit attempts, add CAPTCHA after failures, and require MFA for staff (UX4G 6.2.3). Protect every staff-only endpoint with this session.
- `GET /api/auth/me` — `200` with the same body as the sign-in response while the session is valid, `401` otherwise. The console calls it on load, so a reload keeps the admin signed in.
- `POST /api/auth/logout` — ends the session (clear the cookie); the console calls it from Logout.
  - The success body tells the console who signed in: `{ username, name, role, departmentId }`, where `role` is `super_admin`, `department_approver` or `department_admin` and `departmentId` is a department `id` (e.g. `medicine`), required for the two department roles. The admin console reads it in `toAdminUser()` in `src/admin/adminApi.ts`; if your response uses other field names, that function is the only place to change.

### Admin roles
The console shows each role only what it may manage. These are display rules only, so the server must enforce the same rules and answer `403` otherwise.

The three tiers of FRS §6. A department admin (contributor) edits their department's content, and each edit is a change waiting for approval. A department approver (head of department or nominated faculty) approves those changes, and their own edits are published directly. A super admin (the Dean's office or IT head, SRS 4.14.2) can do everything.

| | Super admin | Department approver | Department admin |
|---|---|---|---|
| Notices, tenders, recruitment, citizen inquiries | All | Department news for own department | Proposes department news (approval needed) |
| Department profile | Any department | Own department | Own department, through approval |
| Faculty | All faculty | Faculty whose `department` equals their department's `name` | Same, through approval |
| Research records | All | Records whose `departmentId` is their department | Same, through approval |
| Staff lists (employee records) | All | Staff whose `departmentId` is their department | Same, through approval |
| Approve, reject, roll back changes | All departments | Own department | — |
| Media library | All | Own department | Own department |
| Audit log, data sources, reports and exports | Yes | — | — |

- `PATCH /api/departments/:id` *(staff only)*
  - Request body: any of `{ overview, paragraphs }`; response: the updated `Department`
- `PATCH /api/faculty/:id` *(staff only)*
  - Request body: any of `{ designation, phones, emails, bio }`; response: the updated `FacultyMember`

### The admin console is a separate app
The public website and the admin console are deployed separately: the console runs on its own port (5174 in development) and is built into `dist-admin/` for its own host, for example an address reachable only from the institute's network. All staff requests come from the console, sign-in included, and send the session cookie (`credentials: 'include'`).

- **Recommended:** serve `/api` from the console's own host through a reverse proxy to the backend, and set `VITE_API_BASE_URL=/api` for the console build. The session cookie is then same-origin, and no CORS is needed for staff endpoints.
- **If the console calls the API on another origin:**
  - allow that one console origin with `Access-Control-Allow-Credentials: true` (never `*`) on `/auth/*` and the staff endpoints;
  - mark the session cookie `SameSite=None; Secure`;
  - protect state-changing requests against CSRF, for example by checking the `Origin` header.
- Staff endpoints (`/auth/*`, `GET /inquiries`, `PATCH /inquiries/:ticketId`, `PATCH /departments/:id`, `PATCH /faculty/:id`, `POST` / `DELETE /notices`, `GET /notices?include=unpublished`, `POST` / `PATCH` / `DELETE` on `/research-records` and `/staff`, `/content-changes*`, `/audit-log*` and everything under `/admin/`) do not need to be reachable from the public website at all.

### Universal Search
- `GET /api/search?q={keyword}`
  - Response: `SearchResults` — `{ departments: [{id, name, overview}], faculty: [{id, slug, name, department, designation}], notices: [{id, title, category, date}], pages: [{title, url, snippet, category}], research: [{id, kind, title, people?, year?, department?, url}] }`, each list ranked by relevance (title matches first). Index public content only (WEB-MLS-4)
- `GET /api/search/suggest?q={keyword}`
  - Response: up to 8 `{ title, url, type }` for suggestions while typing (WEB-MLS-2); it is called on every keystroke after a short pause, so keep it fast

---

## 3b. Added for the SRS/FRS website features (14 October 2026)

The requirement behind each item is given as its FRS ID. The status of every requirement is in [`SRS_FRS_GAP_ANALYSIS.md`](SRS_FRS_GAP_ANALYSIS.md), and what to test is in [`FRONTEND_INTEGRATION_CHECKLIST.md`](FRONTEND_INTEGRATION_CHECKLIST.md).

### All requests
All requests go through one client, `src/services/http.ts`:
- `VITE_API_BASE_URL` is the base address. Staff requests send cookies (`credentials: 'include'`).
- A request times out after 30 seconds. A failed `GET` is retried once on a network error; other methods are never retried.
- Public `GET` answers are cached in the browser for 30 seconds, and identical requests in flight are shared. Staff requests are never cached. Any `POST`, `PUT`, `PATCH` or `DELETE` clears the cache.
- Errors are expected as `{ message }` JSON with a fitting status. `401` on a staff request returns the console to sign-in. `PATCH` and `PUT` send `null` for a field the editor emptied: treat `null` as "clear this field".
- Website requests send `Accept-Language: en`, `hi` or `mr`, the reader's choice, from the first request on page load. Return translated content where you have it, and English otherwise (WEB-MLS-1/3).
- Dates are ISO 8601 date-times. A "remove from the website on" date is sent as local midnight of that day.

### Website: dynamic content (WEB-DYN-*)
Send `updatedAt` (time of the last sync) where the shape has it. If a feed fails, the page shows the last copy it saw, with its age (WEB-DYN-5).
- `GET /api/regulatory-updates?source=NMC` → `[{ id, title, date, url, source, category? }]`, pulled from NMC on a schedule (WEB-DYN-1)
- `GET /api/blood-availability` → `{ bankName, updatedAt, source, components: ["Whole blood", "PRBC", …], stock: [{ group: "A+", units: { "<component>": number } }] }`, or `null` until e-RaktKosh is connected (WEB-DYN-4)
- `GET /api/hospital/statistics` → `{ period, source, updatedAt?, items: [{ id, label, value, note? }] }`, the home page's hospital figures (SRS 4.8)
- `GET /api/results/public` → `[{ id, title, date, url, programme? }]`, result notices released to the public (WEB-ACD-2)

### Website: engagement (WEB-ENG-*, WEB-ACD-6)
Payload types are in `src/types/services.ts`.
- `POST /api/feedback/site` `{ rating (1–5), lookingFor?, found?: "Yes" | "Partly" | "No", comment?, departmentId?, page?, email? }` → `{ reference }`. `departmentId` routes it to that department (WEB-ENG-4)
- `GET /api/surveys?status=open`, `GET /api/surveys/:id` → `Survey` `{ id, title, description?, departmentId?, status, closesOn?, anonymous, questions: [{ id, text, type: rating | single | multiple | text | longtext, options?, required }] }`; `POST /api/surveys/:id/responses` `{ answers: { [questionId]: string | string[] } }`
- `GET /api/newsletter/segments` → `[{ id, title, description }]`; `POST /api/newsletter/subscriptions` `{ email, segments, language, consent: true }` → `{ token, email, segments, language, status: "Pending confirmation" }`. Send the confirmation email (double opt-in) with a link to `/newsletter/manage?token=…`
- `GET` / `PATCH` `{ segments, language }` / `DELETE /api/newsletter/subscriptions/:token`. `DELETE` unsubscribes and erases the address (WEB-ENG-5, DPDP)
- `GET /api/alumni/distinguished` → `[{ slug, name, role, photo? }]`, in display order: the distinguished alumni of the official alumni page
- `GET /api/alumni/distinguished/:slug` → `{ slug, name, role, photo?, paragraphs: [string] }`, the profile shown at `/alumni/:slug`; 404 for an unknown slug
- `GET /api/alumni/overview` → the figures of the official alumni page, shaped as `AlumniOverview` in `src/types/index.ts`: `{ source, lede, enrolled: { total, men, women }, graduated: {…}, firstBatch, studying: [{ label, count }], postgraduation: { fromClass, toClass, atMgims, elsewhere, notPursued }, specialties: [{ label, count }], otherPaths: [string], countries: [{ label, count }], countriesNote?, states: [{ label, count }], closing }`; labels in the requested language
- `GET /api/alumni?q=` → `[{ id, name, batch, currentRole?, organisation?, city?, specialty? }]`, only those who chose to be listed; `POST /api/alumni/registrations` `{ name, batch, email, phone?, currentRole?, organisation?, city?, specialty?, showInDirectory, consent: true }` → `{ reference }`

### Admin console: sign-in, second factor and session (WEB-SEC-1, WEB-SEC-7)
- `POST /auth/login` `{ username, password }` →
  - `200` with the user, when no second factor is needed;
  - `202` `{ mfaRequired: true, challengeId, channel: "sms" | "email" | "totp", destination }` to ask for the second factor (FRS WEB-SEC-1 asks for it on every staff sign-in);
  - `401` `{ attemptsLeft }`;
  - `423` or `429` with `Retry-After` (seconds) while locked.
- `POST /auth/mfa/verify` `{ challengeId, code }` → `200` with the user and the session cookie, `401` `{ attemptsLeft }`, or `410` when expired. `POST /auth/mfa/resend` `{ challengeId }` sends a new code.
- A `401` on any other staff request means the session has ended: the console returns to its sign-in screen and says so. Use `401` for an expired session and `403` for a forbidden action.
- `role` is `super_admin`, `department_approver` or `department_admin` (see "Admin roles" above). The mapping is in `toAdminUser()` in `src/admin/adminApi.ts`.

### Admin console: approval workflow, versions and audit (WEB-CMS-2..6, WEB-SEC-5)
A **content change** (`ContentChange` in `src/admin/workflow.ts`):
`{ id, entity: department | faculty | research | staff | notice, action: create | update | delete, entityId?, departmentId?, summary, before?, after?, status: Draft | Submitted | Approved | Published | Rejected | Withdrawn, author: { username, name }, createdAt, submittedAt?, reviewer?, reviewedAt?, note?, publishAt?, publishedAt?, version?, issues?, rollbackOf? }`

| Endpoint | Use |
|---|---|
| `GET /content-changes?status=&departmentId=&author=&entity=&entityId=` | Queue, history and versions; a departmental approver always asks with their `departmentId` |
| `POST /content-changes` `{ entity, action, entityId?, departmentId?, summary, before?, after?, issues?, submit }` | A department admin's edit: a draft (`submit: false`) or a submission |
| `POST /content-changes/:id/submit` · `/withdraw` | The author sends a draft, or takes back a draft or submission |
| `POST /content-changes/:id/approve` `{ publishAt?, note? }` | Publish now, or at `publishAt`; the server applies `after` to the record and stores the version |
| `POST /content-changes/:id/reject` `{ note }` | `note` is required; the author sees it |
| `POST /content-changes/:id/rollback` | Restore the state before a published change, as a new version |
| `GET /audit-log?actor=&action=&from=&to=` | `[{ id, at, actor, actorName, role, action, summary, entity?, entityId? }]`, newest first, append-only |
| `POST /audit-log/events` `{ action, summary, entity?, entityId? }` | Only for events the server cannot see (exports built in the browser); the server logs every staff request itself |

- **Rules:** only an approver for the change's department (or a super admin) may approve, reject or roll back. Approvers' own edits go straight to the usual endpoints (`PATCH /departments/:id` and so on); version and audit those too.
- **`issues`** holds the results of the frontend's content checks (WEB-CMP-6): `[{ rule, severity: error | warning, field, message, excerpt?, guideline }]`. Re-check on the server; the console blocks submission when there is an error.
- **Scheduled job:** publish approved changes whose `publishAt` has come.

### Admin console: media, data sources, reports
| Endpoint | Use |
|---|---|
| `GET /admin/media?departmentId=` → `[{ id, url, fileName, title, kind: image \| document, mimeType, sizeKb, alt?, departmentId?, uploadedBy, uploadedAt, usedOn? }]` | Media library (WEB-CMS-7) |
| `POST /admin/media` (multipart: `file`, `title`, `alt`, `departmentId`) · `PATCH /admin/media/:id` `{ title, alt }` · `DELETE /admin/media/:id` | Accept JPG, PNG, WebP up to 2 MB and PDF up to 10 MB; scan uploads; `409` when the file is still used on a page |
| `GET /admin/data-sources` → `[{ id, name, description, refreshMinutes, lastSyncAt?, lastStatus?: OK \| Failed \| Never run, lastMessage? }]` · `PATCH /admin/data-sources/:id` `{ refreshMinutes }` · `POST /admin/data-sources/:id/sync` | Refresh interval per source (WEB-DYN-6); the sync answers with the updated source |
| `GET /admin/analytics/service-uptake?from=&to=` → `[{ date, appointments, reportsDownloaded, payments, certificateRequests }]` | Daily usage (WEB-RPT-2); zeros while the portals are not in use |
| `GET /admin/feedback?departmentId=` · `PATCH /admin/feedback/:id` `{ status: New \| Seen \| Actioned }` · `GET /admin/feedback/summary?from=&to=` → `{ byDepartment: [{ departmentId?, department, responses, averageRating }], weekly: [{ week, responses, averageRating }] }` | Feedback routed to departments, trends and red flags (WEB-ENG-4, WEB-RPT-4) |
| `GET /admin/surveys` · `POST /admin/surveys` · `PUT /admin/surveys/:id` · `POST /admin/surveys/:id/status` `{ status }` · `GET /admin/surveys/:id/results` → `{ responses, questions: [{ id, text, type, counts?, average?, texts? }] }` | Survey builder and results (WEB-ENG-1) |
| `GET /admin/newsletter/segments` → `[{ id, title, subscribers }]` | Subscribers per segment |
| `GET /admin/accessibility/report` → `{ generatedAt, pages: [{ url, title?, violations: [{ id, impact, description, nodes: [{ target, html? }], helpUrl? }] }] }` | From an automated axe-core run over every page (WEB-RPT-3) |
| `GET /admin/exports/:report.csv` (`inquiries`, `staff`, `research`, `workflow`, `audit`, `newsletter-subscribers`) | Super admin only; record each export in the audit log (WEB-RPT-5) |

### Suggested new tables
`content_changes` (the shape above), `audit_log` (append-only), `media`, `data_sources`, `site_feedback`, `surveys` and `survey_responses`, `newsletter_segments` and `newsletter_subscriptions` (with the confirmation token and the consent time), `alumni` (with the listing choice and the consent time). Notices get `department_ids`, `publish_at` and `expires_at` (see the notices table above).

### Legacy URLs (WEB-ENG-3)
`docs/legacy-redirects.nginx.conf` maps 926 old `index.php/...` addresses to the new pages with `301`. Include it in the website's server configuration. `scripts/generate-legacy-redirects.mjs` rebuilds it, with `src/data/legacy_redirects.json`, which the app uses for old links that reach it anyway.

### Portals (outside the website scope)
The patient, student and fee portals are built by other teams, and their screens are no longer in this code. The website only links to them through `/patient-portal`, `/student-portal` and `/fee-portal`. These routes forward to the address in `VITE_PATIENT_PORTAL_URL`, `VITE_STUDENT_PORTAL_URL` or `VITE_FEE_PORTAL_URL`, keeping the rest of the path, or load a module plugged in through `src/config/portals.ts`. The website needs no portal endpoints. The gap analysis still lists the endpoints that were drafted for them (rows marked [portal]), for reference.

---

## 4. Seeding the Database from Extracted Data

All scraped records (984 pages that loaded successfully; re-generate with `python3 scripts/extract_data.py`) are located in:
```
/Users/nileshkumarshukla/ScrapData/extracted_data/
├── departments.json       (24 medical departments)
├── faculty.json           (97 full faculty profiles)
├── notices_items.json     (672 categorized tenders, jobs & circulars, full text)
├── notices_index.json     (the same notices without article bodies, for list pages)
├── notices/<id>.json      (one file per notice, for the notice page)
├── search_index.json      (compact index used by mock-mode search)
├── hospital.json          (21 clinical service sections)
├── institute.json         (53 governance, history & cancer registry items)
├── academics.json         (43 academic curricula & skills lab items)
├── research.json          (10 research archives & 2,000+ publications)
├── accreditations.json    (NAAC, SSR, AQAR, NIRF, NMC disclosures)
├── community.json         (Community medicine & Seva-Bhaav programs)
├── directory.json         (29 official contact lines & extensions)
├── hospital_charges.json  (official tariff: 2,094 items in 4 sections)
├── research/              (theses, student research, publications, funded projects, presentations)
├── staff.json             (official staff lists: 132 teaching, 881 non-teaching, 67 senior residents)
└── site_info.json         (date the official site was last modified)
```

You can write a simple Python or Node.js migration script to loop through these JSON files and insert rows directly into your database tables.

---

## 5. Contact & Collaboration
If you need any adjustments to payload shapes or additional filter parameters, modify `src/types/index.ts` and `src/services/api.ts`.
