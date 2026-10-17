# MGIMS website frontend — handover report

**Status (14 October 2026):** the frontend builds, passes type-checking, linting, accessibility and link checks, and runs on bundled data. The backend, database and APIs are being built separately; this report lists what the frontend expects from them. Content still awaiting MGIMS confirmation is listed in [`CONTENT_REVIEW.md`](CONTENT_REVIEW.md).

**SRS/FRS work (14 October 2026):** the frontend was compared with the RailTel SRS and FRS (June 2026). The status of each requirement, with the decisions MGIMS still has to make, is in [`SRS_FRS_GAP_ANALYSIS.md`](SRS_FRS_GAP_ANALYSIS.md). What to check when the backend is connected is in [`FRONTEND_INTEGRATION_CHECKLIST.md`](FRONTEND_INTEGRATION_CHECKLIST.md). Section 2a below summarises the changes.

## 1. Run it locally

Needs Node.js 20.19+ or 22.12+ (Vite 8's requirement).

```bash
cd mgims-frontend
npm install
cp .env.example .env    # optional; the defaults run on bundled data
npm run dev             # public website: http://localhost:5173
npm run dev:admin       # admin console (separate app): http://localhost:5174
```

| Command | Purpose |
|---|---|
| `npm run build` | Sitemap, type-check, and production builds of the public website (`dist/`) and the admin console (`dist-admin/`) |
| `npm run build:admin` | Admin console only |
| `npm run preview` / `npm run preview:admin` | Serve the production builds, on ports 4173 / 4174 |
| `npm run lint` | oxlint |

| Setting in `.env` | Use |
|---|---|
| `VITE_USE_MOCK_API` | `true` (default): bundled data. `false`: call the backend at `VITE_API_BASE_URL` |
| `VITE_ADMIN_DEMO_PASSWORD` | Demo only: opens the admin console without a backend (user `superadmin`, or `<department-id>-admin`). Leave empty in production |
| `VITE_PUBLIC_SITE_URL` | Admin console only: address of the public website for its links. Defaults to `http://localhost:5173` in development and `https://www.mgims.ac.in` in a build |
| `VITE_SHOW_REVIEW_NOTES` | `true` shows the content awaiting MGIMS confirmation, with a review banner. Leave empty for the live site |
| `VITE_ADMIN_IDLE_MINUTES` | Admin console: minutes without activity before it signs out (default 15) |
| `VITE_PATIENT_PORTAL_URL`, `VITE_STUDENT_PORTAL_URL`, `VITE_FEE_PORTAL_URL` | Address of each portal (built by other teams); empty shows a "being connected" page |
| `VITE_MEDIA_BASE_URL` | Where old-site photos are served from after `scripts/download-media.mjs`; empty keeps the original addresses |
| `VITE_MONITORING_URL`, `VITE_RELEASE` | Error and page-speed reports (JSON beacons) and the release name sent with them; empty sends nothing |
| `SITE_URL` | Read at build time: sitemap, robots.txt, canonical links, link-preview image, structured data (default `https://www.mgims.ac.in`) |

The admin console is a separate app with its own port and build. The public website has no admin pages or admin code.

## 2. What was fixed

**Scraping leftovers removed from the data and pages** (the cleanup is part of `scripts/extract_data.py`, so re-extracting repeats it):
- the "Source: … on mgims.ac.in" line under every content section (86 pages) and on the contact page;
- 161 email addresses that showed as "[email protected]" or "This email address is being protected from spambots": 157 restored with the real address (for example `centralstore@mgims.ac.in`, 80 times across tender notices); the other 4 could not be matched to a person and were removed;
- link labels captured as text: "Read More" (53), "Show Details" (24), "Tender Document" (191), "Next"/"Prev", "---" separators;
- HTML entities (`&amp;`), and a space before punctuation in 2,318 paragraphs ("Kale , Junior" → "Kale, Junior");
- faculty-grid leftovers on department pages: 110 lone designations ("Professor") and 8 lone emails or phone numbers. The Faculty tab lists each person properly;
- a "Key focus areas" box that was really the page's headings (names, "SERVICE", "Gallery");
- timetable doctor names repeated as loose paragraphs above the OPD table;
- the site menu shown as the summary of two departments without content;
- directions shown twice on the contact page.

**Content corrected against the official website:** wrong RTI and committee emails, wrong award years, the ROME camp description, distances, insurance claims and the MCH wing. Details are in [`CONTENT_REVIEW.md`](CONTENT_REVIEW.md) §2.

**Unverified hand-written content hidden:** 5 items, listed in [`CONTENT_REVIEW.md`](CONTENT_REVIEW.md) §1. The visible "Indicative information — verify with MGIMS" banners are gone from the live site. Three sections with nothing else (Ph.D., JBTDRC, Other initiatives) are hidden from the menus and sitemap.

**Interface:**
- Section pages on phones: the side menu collapses behind a button, so content comes first.
- Mobile menu links are 44 px touch targets.
- Breadcrumbs show proper names (OPD, NAAC, Medical Education Unit, "Notice #115"), and "Notices" now goes to the news list instead of a dead route.
- Wide tables can be scrolled with the keyboard.
- Academics and Research overviews show links to their sections.
- Notices that mention attachments link to the original notice for them.
- Footer: "Source content last modified" became "Last updated".
- View counts are hidden when unknown, and the data script no longer invents a date ("2024-2026") or count ("1000+") when they are missing.

**Research section rebuilt from structured records.** The official pages print names outside their paragraphs, so the scrape had attached every thesis and paper presentation to the **next** student's or presenter's name, and dropped all year and department headings. `scripts/extract_research.py` rebuilds the entries from the page text in document order:

| Section | Records | Grouped by |
|---|---|---|
| Theses | 226 (2017–2021) | year, then department |
| Student research | 109 | academic year, then programme; plus each year's committee and awards |
| Publications | 790 | year, then department |
| Funded research | 190 | year, then department; with investigators and funding details |
| Paper presentations | 117 | department |

- The theses for 2017–2021 were on the Student Research page; they are now in the Theses section.
- Each section has a year selector, a department filter and search.
- The Research overview shows the official "Research at MGIMS" text.
- In-house publications name each journal next to its editor.

Details are in [`CONTENT_REVIEW.md`](CONTENT_REVIEW.md) §2–3.

**Official hospital tariff.** The Hospital Charges page on the official site embeds its tariff from a published Google Sheet, so the page scrape had only "your browser does not support inline frames". `scripts/fetch_embedded_sheets.py` saves the sheet, and the Hospital › Hospital charges section shows all 2,094 items in four sections (Investigation, Bed, Anaesthesia, Diet), with Insured, General and Private rates. It has search (for example, "ct" finds the "C T …" scans, not "Cataract"), 50 rows per page, and Indian digit grouping. The 26-row rate table written for the earlier design is deleted.

**Official staff lists (employee records).** The official Teaching staff, Non-teaching staff and Senior residents pages also embed their lists from Google Sheets, so the scrape had none of the names. The same script saves them, and Academics › Teaching & non-teaching staff shows:

| List | People | Columns |
|---|---|---|
| Teaching staff | 132, incl. 22 visiting faculty | Name, designation, department, joined MGIMS, last promotion |
| Non-teaching staff | 881 (list updated October 2025) | Name, designation, department or unit, status, class |
| Senior residents | 67 (list dated 31/8/2025) | Name, department |

- Each list has a department or unit filter, search, and 50 rows per page. The old official links (`/academics/faculty`, `/non-teaching`, `/senior-residents`, `/non-pg-junior-residents`) open this section.
- The official non-teaching list also gives each person's caste, gender and employee number. These are not extracted, shown or stored (data minimisation under the DPDP Act, 2023; FRS WEB-SEC-6).
- The Non-PG junior residents sheet is no longer published (Google answers "410 Gone"), so there is no list for it. See [`CONTENT_REVIEW.md`](CONTENT_REVIEW.md) §3, questions 16–19.

**Admin console:** a super administrator and department administrators. A department admin sees and edits only their own department's profile, faculty, staff and research. See the backend guide, section "Admin roles".

The **Staff** tab manages the three staff lists:
- **Department admin:** sees, adds, edits and removes only their department's staff (for example, Surgery: 8 teaching staff including 3 visiting, 5 non-teaching staff, 5 senior residents); the department field is fixed to theirs.
- **Super admin:** manages everyone, including staff of hospital units that are not departments (Matron Office, Medical Store, …) and visiting faculty whose speciality is not a department.
- **Forms:** name and designation are required; teaching staff have joining and last-promotion dates (checked as DD/MM/YYYY); non-teaching staff have status and class. The form has no fields for caste, gender or employee number.

The **Research** tab manages all five record types:
- **Department admin:** sees, adds, edits and deletes only their department's records; the department field is fixed to theirs.
- **Super admin:** manages every record, including undergraduate entries that have no department.
- **Forms:** the fields fit the record type (student and guide for theses; authors and citation for publications; investigators and funding lines for funded projects), and the year and required fields are checked before saving.

The console is a **separate app**: it has its own entry (`admin/`), Vite config (`vite.admin.config.ts`), port (5174) and build (`dist-admin/`), and it shares `src/` with the public site. The public website has no `/admin` route, and none of the admin code, staff API calls or demo password ship in its bundle; this was checked by building both apps and searching their output. The console has its own `robots.txt` blocking crawlers, plus a `noindex` tag. Deploy it on its own host, ideally reachable only from the institute's network.

## 2a. SRS/FRS work (14 October 2026)

**Scope:** this frontend's scope is the public website and its admin console.

**Website:**
- **New public pages:** a landing page for each visitor group (`/patients`, `/students`, `/faculty-staff`, `/visitors`, `/regulators`), an HTML sitemap, a help page, an accessibility statement, a "page not found" page with search, 12 policy pages, and 926 old `index.php` addresses redirected to their new pages.
- **Notices:** a publish date and a removal date, so scheduled notices stay hidden and expired ones leave the lists while keeping their address. Notices also show on the pages of the departments they are tagged with.
- **Search:** suggestions while typing, and research records (theses, publications, projects) in the results.
- **Pages:** a read-aloud button on section pages; a canonical link, Open Graph tags and the organisation's structured data for search engines.
- **Synced data:** NMC updates, blood bank stock, the home page's hospital figures and result notices. Each comes from the API, with its sync time; if a feed fails, the page shows the last copy it saw, with its age.
- **Engagement:** a feedback page, surveys, newsletter sign-up with confirmation and unsubscribe, and an alumni directory with registration.
- **Language:** every request asks for the reader's language (English, Hindi or Marathi), from the first request on page load.

**Admin console:**
- **Three roles:** super admin; department approver (head of department); department admin (contributor). A department admin's edits wait for approval. Approvers publish their own edits and decide on their department's changes, now or at a set time, or reject them with a reason.
- **History and accountability:** versions and rollback, and an audit log with filters and CSV export.
- **Content tools:** a media library (type and size checks, a description required for images), and accessibility and content checks before publication.
- **Operations:** data sources with refresh intervals; reports and exports; feedback by department; a survey builder; newsletter segments.
- **Sign-in:** a second factor (one-time code), lockout messages, sign-out after inactivity, and a return to the sign-in screen when the server ends the session.

**Found by testing in live mode against a simulated backend, and fixed:**
- Public page requests did not tell the backend the reader's language.
- With Hindi saved, the first requests of a page load still asked for English.

**Bug fixed:** after publishing a notice in demo mode, the console listed it twice.

**Outside the website scope:** screens for a patient portal, a student portal, online payments and online admissions were built during this work. They have since been removed (15 October 2026), as they belong to other teams. In their place are entry points:
- One route per portal (`/patient-portal`, `/student-portal`, `/fee-portal`) in `src/config/portals.ts`, opened by `src/pages/PortalGateway.tsx`.
- `PortalLink` and `usePortal` for links to the portals.
- `VITE_*_PORTAL_URL` for each portal's address.

On the homepage, the "I am a…" cards for patients and students open their portals, and a Fee Portal button sits beside them. The lower grid keeps only general services: charges, tenders and careers.

## 2b. Frontend review (15 October 2026)

A system design review of the frontend and the status of each finding are in [`FRONTEND_REVIEW.md`](FRONTEND_REVIEW.md). In short:
- **Tests and CI:** unit tests (Vitest) and browser tests with accessibility checks (Playwright + axe), with a CI workflow.
- **Error handling:** error boundaries and error monitoring.
- **Code quality:**
  - Explicit strict TypeScript, with no `any`.
  - One HTTP client.
  - A console split into modules, with section addresses.
  - Colour tokens and typed translation keys.
- **Public site:**
  - Per-page head tags in the HTML.
  - Self-hosted fonts.
- **Deployment:**
  - nginx config with security headers.
  - Private source maps.
  - A script to move photos off the old site.

**Decisions and content still needed:** gap analysis, "Decisions and content needed" (D1–D10), and [`CONTENT_REVIEW.md`](CONTENT_REVIEW.md) questions 20–23.

## 3. Checks run (13–14 October 2026)

| Check | Result |
|---|---|
| `tsc` type-check | Pass |
| `npm run build` | Pass, for both apps. One size warning: the Academics and Research data files (1.3 MB and 1 MB) load only on those sections, in mock mode only; the backend replaces them |
| `npm run lint` | 0 errors; 4 warnings, all present before this work (3 × setState in an effect, 1 × fast-refresh export) |
| Every route at 1280 px and 375 px (109 routes, 218 page loads) | 0 console errors, 0 failed requests, 0 broken images, 0 horizontal overflow, 0 heading-level skips, one `h1` per page |
| axe-core (WCAG 2.1 A/AA) on the same 218 page loads | 0 violations |
| Internal links found on all pages (211) | All open a real page |
| Data scan of all 984 pages and 672 notices | 0 hidden-email placeholders, spam-bot notices, HTML entities or link labels left |
| Interaction test (25 checks) | Search dialog (Ctrl+K, results, Esc); search page; news pagination, sorting and search; tender search; department filters and tabs; faculty search and profile dialog; inquiry form errors, submission, ticket and tracking; feedback widget; "Show more"; text size; hiding the ticker; unknown routes; breadcrumbs; review-only redirects. All pass |
| Hospital charges (13 checks) | Four sections with counts; first row and ICU bed rates as published; search ("ct", "haemogram", no-match message); pages; Private column for bed charges; old `/hospital/hospital-charges` links; axe; no overflow at 375 px. All pass |
| Notices and session in the admin console (15 checks) | Publish (focus, today's date, Esc, saved through the API); delete with Undo; delete sent after the Undo time and before sign-out; sign-out; footer date from the API; axe on the dialog. All pass |
| Research section and Research tab (38 checks) | Theses credited correctly (e.g. the ropivacaine thesis to Kathane N, guide Dhande P); year, department and search filters; student research by year with committee and awards; in-house publications; funded-project details; presentations by department; old `/research/thesis` links; no overflow at 375 px; axe on each page; department admin limited to own department's records; add, validate, edit and delete a thesis; super admin sees all 790 publications and the department filter. All pass |
| Admin app on port 5174 (19 checks) | The public site has no `/admin`; the console loads with full styling and without the public menus; sign-in refusals; super admin (16 sections) and department admin (10 sections, own faculty only); department and faculty edits; links back to the public site; axe on the login and console screens; phone width. All pass |
| Staff lists and Staff tab (45 checks) | Three lists with their counts and columns; visiting faculty with their speciality; department and unit filters; pages; no caste, gender or employee numbers on the page; old `/academics/non-teaching` link and the Academics menu entry; axe on each list; no overflow at 375 px. In the console: super admin sees all 1,080 records; add (focus, required fields, "Other unit"), edit (an emptied status is cleared), remove with confirmation, Esc returns focus; a department admin (Surgery) sees only Surgery staff, cannot change the department, and the date format is checked; Medicine admin sees only Medicine; axe on the tab and dialog. All pass |
| **SRS/FRS work, final runs (14 October 2026):** build, type-check, lint, translations | `npm run build` passes for both apps (sitemap: 794 URLs); `tsc` passes; lint shows the same 4 warnings as before. 813 Hindi and Marathi label pairs: no empty labels or mismatched placeholders, and every label key used in the code exists |
| Live build (`VITE_USE_MOCK_API=false`) | Both apps build, with no demo modules and no demo data. Three labels written for demo mode stay in the text dictionaries; they never show in live mode |
| New public routes (30 routes at 1280 and 375 px) | 60 of 60 page loads: no console errors, no axe violations, no sideways overflow, one `h1` each. The first attempt stopped on an error in the test itself (the page navigated during a check); the re-run passed |
| Notice publication window and page metadata (27 checks) | Pass |
| Console: second-factor sign-in, lockout, sections, approvals, scheduling, rollback, media, audit log, data sources, reports, idle sign-out (47 checks) | Pass |
| Departmental approver role (18 checks) | Pass |
| Live mode against a simulated backend (27 checks: 11 for the website and console, 16 for the portal screens, since removed) | Pass |
| Earlier suites, re-run | Interaction 25, admin app 19, notices 15, research 39, staff 47, hospital charges 13: all pass |
| Portal screens, as a regression check only (86 checks; the screens were later removed) | Pass |
| After the review work (15 October 2026): lint, type-check, unit tests (33), browser tests with axe (58), production build, CSP against the built sites (12 pages, 16 console sections, 0 violations) | Pass |
| Every route at 1280 and 375 px, final crawl (109 routes, 218 page loads), with axe-core | 0 console errors, 0 failed requests, 0 axe violations, 0 broken images, 0 sideways overflow, 0 heading-level skips, one `h1` per page |

**Not checked:** the 52 external links (other websites); every one of the 672 notice pages in the browser (7 were opened; all 672 were checked in the data); the page content of the Hindi and Marathi versions; the photos' rights.

## 4. Pages audited

Home · About (13 sections) · Kasturba Hospital (13) · Academics (16) · Research (9) · Accreditations (4) · Community (7) · Departments list and all 24 department pages · Faculty directory · Tenders · Recruitment · News & CMEs · Notice pages (7 opened; all 672 in data) · Contact & directory · Track inquiry · Search · 5 policy pages · Screen reader access · Admin console.

Content was compared with the copy of the official website collected on 6 October 2026. The live website was used to recover hidden email addresses only.

## 5. What works without a backend

All navigation, menus and breadcrumbs; search (dialog and page, with voice search where the browser supports it); filters, sorting and pagination; tabs, dialogs and "Show more"; the accessibility settings (text size, dark and high-contrast modes, reading aids, language for menus); sharing a notice; the inquiry form with validation, ticket number and tracking; the feedback widget; the admin console in demo mode.

In mock mode, inquiries and feedback are stored in the visitor's own browser, and the form says so. The two apps cannot share data without the backend: inquiries sent on the public site do not reach the console (it says so), and console edits last only until the console is reloaded.

## 6. What needs the backend

All requests go through `src/services/api.ts`. Set `VITE_USE_MOCK_API=false` and `VITE_API_BASE_URL` to switch. Endpoints and payloads are specified in [`BACKEND_INTEGRATION_GUIDE.md`](BACKEND_INTEGRATION_GUIDE.md).

| Feature | Endpoint(s) | Notes |
|---|---|---|
| Departments, faculty, section pages, directory | `GET /departments`, `/faculty`, `/hospital`, `/institute`, `/academics`, `/research`, `/accreditations`, `/community`, `/directory` | Same shapes as the files in `src/data` |
| Notices, tenders, jobs | `GET /notices?category=&search=`, `GET /notices/:id` | Lists use summaries without the article body. New optional field `attachments_url`; `doc_links` should hold the real attachments |
| Search | `GET /search?q=` | Ranked results in four groups |
| Inquiries | `POST /inquiries`, `GET /inquiries/:ticketId?phone=`, staff `GET /inquiries`, `PATCH /inquiries/:ticketId` | |
| Feedback | `POST /feedback` | |
| Admin sign-in and roles | `POST /auth/login` returns `{ username, name, role, departmentId }`; `GET /auth/me` restores the session on load; `POST /auth/logout` ends it | Field mapping is in one function, `toAdminUser()` in `src/admin/adminApi.ts`. The server must enforce the role rules itself |
| Notices in the admin console | `POST /notices`, `DELETE /notices/:id` | Delete is sent after the 8-second Undo time, or at once on the next delete or on sign-out |
| Hospital charges, site information | `GET /hospital-charges`, `GET /site-info` | The tariff and the footer's "Last updated" date |
| Admin edits | `PATCH /departments/:id`, `PATCH /faculty/:id` | |
| Research records | `GET /research-records?kind=`, `GET /student-research-info`; staff `POST`, `PATCH`, `DELETE /research-records` | One table for theses, student research, publications, funded projects and presentations. The server must enforce department ownership |
| Staff lists | `GET /staff`; staff `POST /staff`, `PATCH /staff/:id`, `DELETE /staff/:id` | Teaching, non-teaching and senior resident lists. Public fields only. The server must enforce department ownership |
| SRS/FRS website and console features (14 October) | Listed in the backend guide, §3b: synced data, engagement, sign-in with a second factor, approval workflow, audit log, media, data sources, reports | Plus new notice fields (`departmentIds`, `publish_at`, `expires_at`) and `GET /search/suggest` |

**Left to the backend:** notice view counts. The list shows the counts at collection time; the server decides whether to keep counting views. In demo mode (no backend), a reload of the admin console signs out, since demo sign-ins are not kept.

## 7. Files changed and key decisions

**Data pipeline (repository root):**
- `scripts/extract_data.py`: cleanup step (`clean_raw_items`), department-page cleanup, `attachments_url`, no invented dates or counts; writes the research records.
- New `scripts/extract_research.py`: parses theses, student research, publications, funded projects and presentations into `src/data/research/*.json`.
- New `scripts/fetch_embedded_sheets.py`: saves the Google Sheets that official pages embed (hospital tariff, teaching staff, non-teaching staff, senior residents) into `SCRAP_DATA_FROM_WEBSITE /embedded_sheets/`. `extract_data.py` turns them into `src/data/hospital_charges.json` and `src/data/staff.json`, and writes the site's last-modified date to `src/data/site_info.json`.
- New `scripts/recover_emails.py`: one-off, polite fetch of the encoded addresses from the live site. Output: `SCRAP_DATA_FROM_WEBSITE /recovered_emails.json`.
- `src/data` and `extracted_data` are regenerated output.

**Frontend:**
- **New:** `components/content/ReviewContent.tsx` (replaces `UnverifiedNote`), `utils/departments.ts`.
- **New for the hospital tariff:** `components/hospital/HospitalChargesTable.tsx`.
- **New for the staff lists:** `components/staff/StaffListsView.tsx` (public lists) and `src/admin/StaffManager.tsx` (the Staff tab).
- **New for Research:**
  - Public views: `components/research/ResearchRecordsView.tsx` (year, department and search filters; grouping) and `components/research/ResearchViews.tsx` (one view per record type).
  - Admin: `src/admin/ResearchManager.tsx`, the Research tab.
  - Helpers: `utils/research.ts`.
- **Admin console app:**
  - `admin/` holds the HTML shell, entry, `robots.txt` and favicon.
  - `vite.admin.config.ts` configures it.
  - `src/admin/` holds `AdminPage` (moved from `pages/`), `DepartmentEditor`, `FacultyEditDialog`, `access.ts` (role rules), `adminApi.ts` (staff API calls, moved out of `services/api.ts`) and `publicSite.ts`.
- **Changed components:** `OfficialContent` (source line removed, table fragments filtered, keyboard-scrollable tables), `SectionedPage` (index and review-only sections, collapsible menu on phones), `Breadcrumbs`, `Navbar`, `SiteFooter`.
- **Changed pages:** `HomePage`, `AboutPage`, `AcademicsPage`, `ResearchPage`, `CommunityPage`, `HospitalPage`, `DepartmentsPage`, `DepartmentDetailPage`, `DirectoryContactPage`, `NoticeDetailPage`, `NewsPage`, `PolicyPage`, `FacultyPage`; `App.tsx` (no `/admin` route).
- **Changed services and types:** `services/api.ts`, `types/index.ts`.
- **Changed build config:** `vite.config.ts` (fixed ports), `package.json` scripts, `tsconfig.app.json` / `tsconfig.node.json`, `.gitignore`.
- **Changed styles and HTML:** `styles/index.css` (Tailwind scan base set explicitly; output unchanged), `index.html` (meta description no longer says "1000-bed").
- **Build and docs:** `scripts/generate-sitemap.mjs`, `README.md`, `.env.example`, `docs/BACKEND_INTEGRATION_GUIDE.md`, and the new `docs/CONTENT_REVIEW.md` and `docs/HANDOVER.md`.

**Decisions:**
- **Fix at the source:** content fixes are made in the extraction script, not by hand in `src/data`, so a re-scrape keeps them.
- **Unverified content is hidden, not deleted:** it is hidden by default and shown only with the review flag, so the live site never presents unconfirmed facts and MGIMS can still confirm items.
- **Links to mgims.ac.in that stay:** in-text references, the notice-attachment link, and the link for sections whose content is a PDF. Only the per-section "Source" line was removed.
- **Admin is a separate app, not a hidden route,** so it can be deployed and firewalled on its own and the public bundle carries no admin code. Both apps share one codebase, so there is no duplication.
- **Staff lists show only public fields:** name, designation, department or unit, dates, status and class. Personal details in the official sheet (caste, gender, employee number) are dropped at extraction, so they never reach the bundle, the API contract or the admin forms.
- **Research is records, not page text:** each thesis, project, paper or presentation is a row with a year and department, so pages can group and filter it, and department admins can manage their own rows.
- **No new dependencies.** No changes to the stack or visual design beyond the fixes above; the only route removed is the public `/admin`.
