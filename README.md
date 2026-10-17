# MGIMS Website — Frontend

Public website for **Mahatma Gandhi Institute of Medical Sciences (MGIMS), Sevagram** and Kasturba Hospital, run by Kasturba Health Society. Built to the UX4G (User Experience for Government) handbook; see the audit in [`docs/UX4G_COMPLIANCE_REPORT.md`](docs/UX4G_COMPLIANCE_REPORT.md). Changes up to the first git commit are listed in [`CHANGELOG.md`](CHANGELOG.md); later ones are in the git history. The handover report is [`docs/HANDOVER.md`](docs/HANDOVER.md).

**Stack:** React 19 · TypeScript (strict) · Vite 8 · Tailwind CSS 4 · React Router 7 · lucide-react icons · self-hosted Noto Sans fonts. Tests: Vitest (unit) and Playwright with axe (browser and accessibility). No Joomla, WordPress or other CMS platform: content comes from the backend API, edited in the admin console.

A frontend design review and the status of each finding are in [`docs/FRONTEND_REVIEW.md`](docs/FRONTEND_REVIEW.md).

## Getting started

```bash
npm install
cp .env.example .env   # optional; defaults work for local development
npm run dev            # public website: http://localhost:5173
npm run dev:admin      # admin console (separate app): http://localhost:5174
```

| Script | What it does |
|---|---|
| `npm run dev` | Public website with hot reload, on port 5173 |
| `npm run dev:admin` | Admin console with hot reload, on port 5174 |
| `npm run build` | Generates `sitemap.xml` / `robots.txt`, type-checks, builds the public website to `dist/`, writes each page's title, description and link-preview tags into `dist/<route>/index.html`, and builds the admin console to `dist-admin/`. Source maps are moved to `sourcemaps/` (not deployed) |
| `npm run build:admin` | Type-checks and builds the admin console only |
| `npm run preview` / `npm run preview:admin` | Serve the production builds locally, on ports 4173 / 4174 |
| `npm run lint` | Lints with oxlint (also blocks imports of `src/admin` from the public site) |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Browser tests of both apps, with automatic accessibility checks (Playwright + axe). Builds must exist: run `npm run build` with `VITE_ADMIN_DEMO_PASSWORD=demo123` first; `npx playwright install chromium` once on a new machine |
| `npm run sitemap` | Regenerates `public/sitemap.xml` and `public/robots.txt` only |
| `node scripts/download-media.mjs <folder>` | Copies the photos and files the site uses from the old website into `<folder>`, keeping their paths (see `VITE_MEDIA_BASE_URL`) |

Continuous integration (`../.github/workflows/frontend.yml`) runs lint, type-check, unit tests, a live build (checked to contain no demo code), a demo build and the browser tests on every push.

## Configuration

Set in `.env` (see [`.env.example`](.env.example)). Everything prefixed `VITE_` ends up in the public bundle.

| Variable | Default | Purpose |
|---|---|---|
| `VITE_USE_MOCK_API` | `true` | `true` uses the bundled scraped data in `src/data`; `false` calls the backend |
| `VITE_API_BASE_URL` | `/api` | Backend base URL |
| `VITE_ADMIN_DEMO_PASSWORD` | *(empty)* | Mock mode only: opens the admin console. Sign in as `superadmin`, or `<department-id>-admin` (e.g. `medicine-admin`) for a department admin. Leave empty in production |
| `VITE_PUBLIC_SITE_URL` | `http://localhost:5173` in development, `https://www.mgims.ac.in` in a build | Admin console only: address of the public website, for its "View public page" links |
| `VITE_SHOW_REVIEW_NOTES` | *(empty)* | `true` shows content awaiting MGIMS confirmation, with a review banner (see [`docs/CONTENT_REVIEW.md`](docs/CONTENT_REVIEW.md)). Leave empty for the live site |
| `VITE_ADMIN_IDLE_MINUTES` | `15` | Admin console: minutes without activity before it signs out |
| `VITE_PATIENT_PORTAL_URL`, `VITE_STUDENT_PORTAL_URL`, `VITE_FEE_PORTAL_URL` | *(empty)* | Address of each portal (built by other teams). Empty: the portal route shows a "being connected" page. See [Portals](#portals) |
| `VITE_MEDIA_BASE_URL` | *(empty)* | Where old-site photos and files are served from after `scripts/download-media.mjs`. Empty: original addresses |
| `VITE_MONITORING_URL` | *(empty)* | Receives error reports and page-speed figures as JSON beacons (any service). Empty: errors only go to the browser console |
| `VITE_RELEASE` | `dev` | Release name sent with error reports, e.g. the git commit |
| `SITE_URL` | `https://www.mgims.ac.in` | Origin used at build time in the sitemap, robots.txt, canonical links, link-preview image and structured data |

The backend contract (tables and endpoints) is in [`docs/BACKEND_INTEGRATION_GUIDE.md`](docs/BACKEND_INTEGRATION_GUIDE.md). The status of each SRS/FRS requirement is in [`docs/SRS_FRS_GAP_ANALYSIS.md`](docs/SRS_FRS_GAP_ANALYSIS.md), and what to check when the backend is connected is in [`docs/FRONTEND_INTEGRATION_CHECKLIST.md`](docs/FRONTEND_INTEGRATION_CHECKLIST.md).

## Project structure

```
mgims-frontend/
├── admin/                        Admin console app: index.html, main.tsx entry, public/ (robots.txt blocks crawlers)
├── docs/                         Audit report, backend guide, handover, content review, UX4G handbook and extracts
├── public/                       Static files served as-is (icons, robots.txt, sitemap.xml)
├── deploy/nginx/                 Server configuration: both sites, /api proxy, old-address redirects, security headers (CSP)
├── e2e/                          Browser tests (Playwright + axe) of the website and the console
├── scripts/
│   ├── generate-sitemap.mjs      Builds sitemap.xml, robots.txt and the HTML sitemap's data from routes and data
│   ├── generate-legacy-redirects.mjs  Maps old index.php addresses to new pages (app data and an nginx map)
│   ├── prerender-meta.mjs        Writes per-page head tags into dist/<route>/index.html after the build
│   └── download-media.mjs        Copies old-site photos and files for self-hosting
└── src/
    ├── main.tsx                  Entry point
    ├── App.tsx                   Providers and route table (inner pages are lazy-loaded)
    ├── admin/                    Admin console (used only by the admin app): AdminPage (sign-in or console), AdminConsole
    │                             (sections with their own addresses, sections.ts), panels and editors, role rules,
    │                             approval workflow, audit log, media library, accessibility checks, reports
    ├── assets/images/            Logo files imported by components
    ├── components/
    │   ├── ErrorBoundary.tsx     Error boundary (per page and for the whole app); ErrorFallbacks.tsx: their screens
    │   ├── navigation/           PortalLink: the one way to link to a portal
    │   ├── layout/               Site chrome: Layout, AccessibilityBar, SiteHeader, Navbar,
    │   │                         AlertTicker, Breadcrumbs, SiteFooter
    │   ├── accessibility/        Accessibility settings panel and floating widget, external-link notice
    │   ├── search/               Search dialog
    │   ├── content/              Section-page template, official-content renderer, ReviewContent
    │   ├── research/             Research record lists (theses, student research, publications, funded projects, presentations)
    │   ├── staff/                Official staff lists (teaching, non-teaching, senior residents)
    │   ├── feedback/             Inquiry form and feedback widget
    │   ├── dynamic/              Synced content: NMC updates, blood stock, hospital figures, results, department notices
    │   ├── engagement/           Newsletter sign-up
    │   ├── forms/                Labelled fields and the error summary used by forms
    │   └── ui/                   Small reusable pieces: skeletons, pagination/sort, share buttons, dialog, status badges
    ├── config/                   Persona landing pages (tasks and links per visitor group); portals.ts (portal entry points)
    ├── context/                  AccessibilityContext (font size, theme, language, saved preferences)
    ├── data/                     Mock data generated by ../scripts/extract_data.py — do not edit by hand
    ├── hooks/                    usePageMeta (title, description, noindex), usePortal, useAsync, useIdleTimeout, useVoiceSearch
    ├── i18n/                     UI translations (English, Hindi, Marathi), with typed keys; services/ holds the labels of the newer screens
    ├── mocks/                    Demo-mode answers for the newer services (left out of a live build)
    ├── pages/                    One component per route (…Page.tsx)
    ├── services/api.ts           Data layer: mock data or backend API behind one interface
    ├── services/http.ts          The one HTTP client: language header, timeout, one retry, short cache of public reads,
    │                             session-expiry handling, errors as ApiError, last-known-good copies
    ├── styles/index.css          Tailwind entry, design tokens (brand, ink and link colours), accessibility and theme styles
    ├── styles/fonts.ts           Self-hosted fonts (Latin and Devanagari)
    ├── types/                    Shared TypeScript types
    └── utils/                    Pure helpers: notice dates, pagination, official-content helpers, media addresses,
                                  monitoring, downloads, department membership
```

**Imports** use the `@/` alias for `src/` (configured in `tsconfig.app.json` and `vite.config.ts`), e.g. `import { apiService } from '@/services/api'`.

## Portals

The patient, student and fee portals are built by other teams; this website only provides their entry points. The homepage "I am a…" cards for patients and students open the Patient Portal and the Student Portal, and a Fee Portal button sits beside them. Each portal has one route (`/patient-portal`, `/student-portal`, `/fee-portal`), defined once in [`src/config/portals.ts`](src/config/portals.ts) and opened by [`src/pages/PortalGateway.tsx`](src/pages/PortalGateway.tsx):

1. If the portal is a module in this app (`module: () => import(...)` in `portals.ts`), it is loaded on demand and handles its own routes under that path.
2. Otherwise, if its address is set (`VITE_PATIENT_PORTAL_URL` and the like), the route forwards there, keeping the rest of the address.
3. Otherwise it shows a page saying the portal is being connected, with links to related pages.

Link to a portal with `<PortalLink portal="fee">` or the `usePortal('fee')` hook, never with a hard-coded address.

## Admin console

The admin console is a separate app, `admin/` plus `src/admin/`, configured in `vite.admin.config.ts`. It runs on its own port (5174) and builds into `dist-admin/`, so it can be deployed on its own host, ideally reachable only from the institute's network. Each section has its own address (for example `/approvals`), so Back, bookmarks and reloads work. The public website does not include it: there is no `/admin` route, and public code must not import from `src/admin/` (the lint rule enforces this). A build with `VITE_ADMIN_DEMO_PASSWORD` set prints a warning: such a build must not be deployed. Both apps share the components, services, types and styles in `src/`.

Roles: a super administrator manages everything and approves for every department. A department approver (head of department) approves their department's changes and publishes their own edits. A department administrator edits their own department's profile, faculty, staff, research and news, and each edit waits for approval. Approved changes keep versions that can be rolled back, and every action is in the audit log. The backend enforces the same rules (see the backend guide).

Without a backend, the two apps cannot share data: inquiries sent from the public website stay in that site's browser storage, and edits made in the console are not seen by the public site.

## Data

`src/data` is produced from the scraped MGIMS website by `../scripts/extract_data.py` (run from the repository root: `python3 scripts/extract_data.py`). Before extracting, it cleans scraping artifacts: decodes HTML entities, fixes spacing before punctuation, drops link labels captured as text ("Read More", "Show Details", "Tender Document"), and restores email addresses the original site hid from spam bots. Cloudflare-hidden addresses are recovered once from the live site by `python3 scripts/recover_emails.py` into `SCRAP_DATA_FROM_WEBSITE /recovered_emails.json`, so extraction itself runs offline. It writes:

- section pages (`hospital.json`, `institute.json`, `academics.json`, `research.json`, `accreditations.json`, `community.json`), `departments.json`, `faculty.json`, `directory.json`
- `notices_index.json` for list pages and `notices/<id>.json` for each notice page
- `hospital_charges.json`: the official tariff, and `staff.json`: the official teaching, non-teaching and senior resident lists (without caste, gender or employee numbers). Both come from the Google Sheets that the official pages embed, saved once by `python3 scripts/fetch_embedded_sheets.py` into `SCRAP_DATA_FROM_WEBSITE /embedded_sheets/`
- `site_info.json`: the date the official site was last modified
- `research/*.json`: theses, student research, publications, funded projects and paper presentations as records with year and department (built by `../scripts/extract_research.py`)
- `search_index.json` for search in mock mode

Each file loads only on the page that needs it.

## Conventions

- **Pages** live in `src/pages`, one per route; content-heavy sections use `components/content/SectionedPage`.
- **Official vs. hand-written content:** text from the official MGIMS website is rendered with `OfficialContent`. Hand-written text that could not be verified is wrapped in `ReviewContent` and hidden unless `VITE_SHOW_REVIEW_NOTES=true`; a section with nothing else gets `reviewOnly: true`. When MGIMS confirms an item, remove the wrapper. The list is in [`docs/CONTENT_REVIEW.md`](docs/CONTENT_REVIEW.md).
- **Accessibility:** use labelled controls, at least 44 px touch targets, sentence-case labels, and the colour tokens in `styles/index.css` (dark and high-contrast modes depend on them). Re-run the checks in the audit report after visual changes.
- **Data access:** every request goes through `services/http.ts` (`apiFetch`), so the language header, timeout, retry, cache and session-expiry handling apply everywhere. Do not call `fetch` directly.
- **Colours:** use the tokens (`text-ink`, `text-link`, `bg-brand-navy`, `border-brand-blue`, …), never hex values in class names.
- **Translations:** keys are typed (`TranslationKey`); a missing or misspelt key fails the type-check.
- **Tests:** add a unit test next to a helper (`*.test.ts`) and a browser test in `e2e/` for a new user journey. Browser tests fail on console errors and accessibility violations.
