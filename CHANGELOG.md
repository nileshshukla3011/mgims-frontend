givgi# Changelog — MGIMS Portal

All changes made to the MGIMS portal frontend (`mgims-frontend/`) and the data extraction script (`../scripts/extract_data.py`), in the order they were made. All dates are 12 October 2026.

Paths are written as they were **at the time of the change**. Phase 7 moved many files; its table maps old paths to new ones.

The project was not under version control during Phases 1–8, so this file is the record of those changes. Since then the whole `ScrapData` folder is a git repository (initial commit `50137d8`); later changes are in the git history.

**Before this log:** the frontend was first generated with another AI tool (Antigravity). That tool also extracted four chapters of the UX4G handbook into `ux4g_*.txt` files and wrote a first `UX4G_COMPLIANCE_REPORT.md`, but stopped (quota exhausted) before making UX4G changes.

---

## Phase 1 — First UX4G fixes

Compared the UI with UX4G handbook chapters 5 and 7, the design-system chapter, and the website compliance checklist.

### Fixed
- **Build error:** `components/common/SearchModal.tsx` set the `type` attribute twice on one input, so `npm run build` failed (TS17001). The duplicate is removed.
- **Text contrast (UX4G 7.1, minimum 4.5:1):**
  - On light backgrounds in pages, the search dialog, breadcrumbs and header: `text-slate-400` → `text-slate-600` (was 2.6:1), `text-amber-600` → `text-amber-800` (was 3.2:1), `text-emerald-600` → `text-emerald-700` (was 3.8:1).
  - Footer small print: `text-slate-500` → `text-slate-400` (was 3.3:1 on navy).
  - Home hero badge: white on `emerald-500` → `emerald-700` (was 2.5:1).
- **Focus ring:** the amber ring was 1.7:1 on white. It's now two-tone: amber outline with a navy halo (`index.css`).
- **Links (5.5.7):** text links are always underlined.
- **Typography (7.2, 5.5.15):**
  - Removed every `uppercase` and `italic` class.
  - "ACTIVE" badges now read "Active".
  - Removed the bouncing phone icon on the Contact page (5.5.27).
- **Broken links:**
  - Search results pointing at scraped slugs (e.g. `/hospital/hospital-charges`) used to show a blank page; Hospital and About now map those slugs to the right section and send unknown ones to the overview.
  - The search page counted "pages" results but never displayed them; it now lists them.
- **Dead download buttons:**
  - Annual reports, audited statements, AQAR/SSR, NIRF, NMC, MUHS, BMW and Aaakanksha now link to the matching page on mgims.ac.in.
  - Removed file sizes ("PDF • 14.2 MB") that were not in the scraped data.
  - Replaced four made-up NMC document titles with the two real disclosure pages.
- **Keyboard and screen readers:**
  - Faculty cards were clickable `<div>`s. They now use a stretched button inside the heading.
  - The faculty profile and admin "add notice" popups now behave as dialogs: `role="dialog"`, labelled title, focus moves in and back, Esc closes.
  - Icon-only buttons are at least 44 px.
  - The 📞 emoji is replaced with an icon.
  - Search inputs have `aria-label`s; admin and filter controls have proper labels.
  - Tab and filter buttons expose `aria-pressed`.
  - The main menu is labelled "Main navigation".
- **Forms:**
  - Contact-form labels are linked to their fields.
  - Mobile number is validated (10 digits starting 6–9).
  - A consent checkbox links to the Privacy Policy (5.1.6).
- **Language:** `<html lang>` follows the language selector.

### Added
- `components/common/ExternalLinkNotice.tsx`: confirmation dialog before leaving the site through an external link (5.1.12).
- Footer links to Privacy Policy, Terms & Conditions, Disclaimer, Hyperlinking Policy, FAQs and Contact Us (5.1.3, 5.1.7).
- `pages/PolicyPage.tsx` at `/policies/:slug`. Each page says plainly that the official text has not been published yet, rather than showing invented legal text.
- Print stylesheet: prints page content only and shows external URLs (5.5.14).

### Docs
- Rewrote `UX4G_COMPLIANCE_REPORT.md`. The earlier version marked everything "Compliant" without testing.

**Verified:** 16 pages had zero contrast failures; dialogs, keyboard use, forms, redirects, phone width and print were tested in Chrome; the build passes.

---

## Phase 2 — Data extraction fixes (`../scripts/extract_data.py`)

A coverage check found 41 scraped pages missing from the frontend data. 30 were duplicates; 11 had unique content, lost because pages sharing a URL slug overwrote each other.

### Fixed
- **No overwriting:**
  - Pages sharing a slug get collision-safe keys (e.g. `cme-attended-start-1`).
  - The page with the most text keeps the plain slug. For example `cme-attended` now holds the full "show all" listing (64,152 characters) instead of page 4.
  - Existing keys used by the frontend stay the same.
- **Error pages skipped:** 8 pages that returned 403, 404 or 500 are no longer extracted. Before this, the 404 page for `foreign-contributions` had replaced the real page.
- **Notice IDs kept stable:** IDs are each notice's position among all scraped notice URLs, so skipping 3 error notices (IDs 26, 31, 32) leaves gaps instead of renumbering every later notice.
- **Contact page 1 added:** main address, toll-free number and the ambulance mobile, +91 7588161308. The directory goes from 28 to 29 entries.
- **Lists and tables kept:**
  - Lists unique to a page are kept; menus, sidebars and breadcrumbs are filtered out. 81 notices gained lists such as eligibility criteria, salary terms and selected candidates.
  - Tables are kept on notices, faculty and directory entries.
- **Boilerplate removed:** "Copyright © 1969 – 2026…" and the "email address is being protected from spambots" text no longer appear as paragraphs.
- **Accreditation pages** (NAAC, AQAR, SSR, NIRF, NMC, MUHS) are also copied into `accreditations.json`, keeping the 11 keys it had before.
- **Paths:** input and output paths are fixed relative to the repository. The script writes `extracted_data/` and copies everything to `mgims-frontend/src/data/`.

### Frontend
- `types/index.ts`: added optional `lists` and `tables` to departments, faculty, notices, contacts and section pages.

**Verified:** all 984 pages that loaded successfully are in the data with no unique content left out. Every surviving notice ID keeps its title; the frontend builds.

---

## Phase 3 — Show the official content

You chose: where official content exists, it replaces hand-written text. Hand-written text without an official source stays, marked as unverified.

### Added
- `components/content/OfficialContent.tsx`: renders a scraped page.
  - Paragraphs, with "Show more" after 40.
  - Lists and tables. Table cells that were also captured as paragraphs are skipped.
  - Lazy-loaded photos, with site-wide images and duplicates filtered out.
  - A source link to mgims.ac.in, and a notice when a page's content (usually a PDF) couldn't be captured.
- `components/content/UnverifiedNote.tsx`: "Indicative information — verify with MGIMS" banner.
- `components/content/SectionedPage.tsx`: shared side-menu layout for the section pages.
  - Redirects old and scraped slugs to the right section.
  - Supports hand-written blocks before or after the official pages.
- `components/content/ReportList.tsx`: report list showing each report's real "File size" and "Last update" from the data.

### Changed
- **Hospital** (13 sections): all 21 official pages, including the real OPD timetable with doctors' names.
  - Hand-written text is replaced.
  - The tariff table is kept, marked unverified.
  - New "Hospital IT & HIS" section.
- **About** (13 sections): official vision, history, founder, governance, Citizen Charter (73 paragraphs), cancer registry and RTI designations.
  - New "Why MGIMS" and "Press clippings" sections.
  - Annual reports and audited statements are built from the data.
  - RTI officer names and committee contacts are kept, marked unverified.
- **Academics** (9 → 16 sections):
  - Government Approval (with official intake capacity) replaces the hand-written PG seat table.
  - Added official anti-ragging, Medical Education Unit, IQAC/Ethics Committee, School of Public Health, CMEs and conferences, awards, student life and staff lists.
  - MBBS, PhD and overview text are marked unverified.
  - I removed a helpline number I had typed from memory; the official one is 1800-233-0002.
- **Research** (9 sections): all 2,091 official publications replace 7 hand-written samples. Added theses, student research, paper presentations, institutional research and grants. JBTDRC and award winners are marked unverified.
- **Accreditations:** official NAAC, NIRF, NMC and MUHS content, plus the report list.
- **Community:** now a sectioned page at `/community/:section` with five official pages. Remaining hand-written cards are marked unverified.
- **Departments:** the full official page is shown (Radiotherapy has 74 paragraphs); previously only the first 10 paragraphs. The generic Services and Curriculum tabs are marked unverified.
- **Notices:** lists, tables and photos from the official notice are shown.
- **Contact:**
  - The official address and emergency numbers replace the hand-written helpline strip.
  - The official directions replace the hand-written ones, which had wrong distances (75 vs 70 km to Nagpur; 2.5 vs 6 km to Sevagram station).
- **Search:** now covers all six section data files.
- **Navigation:** links added for the new sections.

**Verified:** 118 of 133 distinct section pages are shown; the other 15 are duplicates, partial copies or empty pages. No runtime errors; contrast passes.

---

## Phase 4 — Logo and NAAC badge

- Replaced the round "MGIMS" monogram on the admin login with the logo (`OIP.webp`).
- Added the logo to the footer, on a white tile.
- Replaced Vite's default favicon with a padded square logo (`public/mgims-logo.png`) and added `public/apple-touch-icon.png`.
- Added a **NAAC Accredited "A+" Grade** badge under the header logo, after checking the scraped notice "MGIMS awarded A+ grade by NAAC". Removed the old "NAAC Accredited" pill so the claim isn't shown twice.
- `index.html` keywords: "NAAC Grade A" → "NAAC A+ Grade".
- On phones, the header logo and badge stack above the institute name.
- Then replaced the logo everywhere with `assets/realLogo.jpg` (square 400×400), resized all uses to square, and regenerated the favicon and Apple touch icon from it.

---

## Phase 5 — Full UX4G audit

Audited against the whole handbook (355 pages): chapter 3 (audit process), 5 (website parameters), 6 (common parameters), 7 (UI foundations), the design system and the 291-row website checklist.

The audit used:
- axe-core, on 24 pages at desktop and phone width.
- Contrast measured in all three colour modes.
- Lighthouse, on three pages.
- Content checked against the scraped data.

Result: 151 pass, 53 partial, 45 fail. Five launch blockers:
1. Load time of 11–12 s.
2. Invented ticker notices.
3. Unreadable dark mode.
4. Non-working grievance form.
5. Insecure admin console.

The report replaced `UX4G_COMPLIANCE_REPORT.md`.

---

## Phase 6 — UX4G remediation

### Decisions applied
- MGIMS is run by **Kasturba Health Society**, not the Government of India:
  - Removed the "भारत सरकार / Government of India" label and link from the top bar.
  - Removed the India.gov.in link from the footer.
  - The National Emblem is not shown.
  - The About menu item "The Logo & Emblem" became "The MGIMS Logo".
- Removed the public "Admin Portal" and "Admin" links; `/admin` is disallowed in `robots.txt`.

### Performance (C1)
- `extract_data.py` also writes:
  - `notices_index.json`: notices without article bodies, 72 KB compressed.
  - `notices/<id>.json`: one file per notice.
  - `search_index.json`: a compact search index, 110 KB compressed.
- `services/api.ts` rewritten: every data file loads on demand; each notice loads its own file.
- `App.tsx`: inner pages are lazy-loaded with a skeleton fallback.
- Logo served at 160 px (`logo-160.jpg`, 11 KB) with `srcset`.
- Result: first visit 2,144 KB → 367 KB; first content 12.3 s → 2.0 s; Lighthouse performance 55 → 95.

### Content accuracy (C2, L4)
- The ticker shows the five newest official notices, can be hidden, and no longer shows invented alerts.
- Home statistics now use the official "Hospital in Numbers" table (2023): 660 beds, 8.24 lakh outpatient visits, 45,710 admissions, 4,916 deliveries. These replace "1,000+ beds", "3,000+ daily outpatients", "97+ faculty" and "100% generic".
- Removed unsupported claims: "1,000-bed", "Full coverage under Ayushman Bharat", the "MBBS Admissions 2026-27" year, and the "Active" badge on every tender.
- "Since 1944" became "Teaching hospital": 1944 is when the dispensary started, not the hospital.

### Dark and high-contrast modes (C3)
- Replaced the dark-mode CSS with complete rules: one dark surface; light shades of each text colour; borders; dark text kept on bright amber surfaces.
- Result: 0 contrast failures on 18 pages in dark and high-contrast modes. Many of the audit's dark-mode failures had been measured mid-colour-transition; the real failures are fixed.

### Grievances and feedback (C4, H3)
- Added `components/contact/InquiryForm.tsx`.
  - An error appears beside each field, and focus moves to the first error.
  - It issues a real ticket number, e.g. `MGIMS-2026-00001`.
  - In demo mode it says inquiries are stored in this browser only.
- Added `pages/TrackInquiryPage.tsx` at `/contact/track`: look up an inquiry by ticket and mobile number; shows status and update history.
- Added `components/common/FeedbackWidget.tsx`: helpful yes/no, an optional comment, and Cancel/Submit.
- The admin console lists real inquiries and staff can change their status. Removed four made-up grievances.

### Admin console (C5)
- Sign-in goes through `apiService.adminLogin` → `POST /api/auth/login`. In mock mode it opens only when `VITE_ADMIN_DEMO_PASSWORD` is set.
- Removed the hard-coded passwords, the empty-password login and the "press Login" hint.
- Deleting a notice shows an Undo option for 8 seconds.
- Replaced the false "100% GIGW 3.0" status box with real counts.

### Pages, lists, search, sharing
- Added `hooks/usePageMeta.ts`: every page sets its own `<title>` and meta description (27 of 27 unique).
- News, Tenders and Recruitment rewritten:
  - Pagination (20–24 per page).
  - Newest-first sorting with an oldest-first toggle (`aria-sort`).
  - "Clear filters" and a result count announced to screen readers.
  - Shortlists appear under Recruitment.
- Added `utils/noticeDates.ts` (parses scraped dates), `components/common/ListControls.tsx` (`SortAndReset`, `Pagination`) and `utils/paginate.ts`.
- Search page rebuilt:
  - Filters by type and relevance ranking.
  - Voice search (`hooks/useVoiceSearch.ts`) in English, Hindi or Marathi.
  - Section headings fixed.
- The search dialog gained voice search and "See all results with filters".
- Added `components/common/ShareButtons.tsx` on notice pages: the system share sheet, or WhatsApp/X, plus "Copy link".
- Added `components/common/Skeleton.tsx` loading placeholders on list, detail and section pages.

### Accessibility widget (M8)
- Preferences (font size, theme, language, reading aids) are saved in `localStorage`, guarded for private browsing.
- Added `components/common/AccessibilitySettings.tsx`: a shared settings panel and a floating accessibility button at the bottom-right.
- Added `pages/ScreenReaderPage.tsx` at `/screen-reader-access`: screen readers and keyboard shortcuts.
- Top-bar controls and the mobile menu button are at least 44 px.

### Structure and layout fixes
- The accessibility bar is now a labelled region (all content is inside landmarks).
- Official-content sections are labelled by their own headings; repeated titles are numbered.
- Empty scraped table header cells render as plain cells.
- Body text is limited to 75 characters per line (was 117–180).
- Minimum text size is 12 px.
- Footer links are larger.
- The global `button { min-height }` rule moved into the base layer, so 44 px utilities apply.
- Hidden screen-reader text inside wide tables no longer causes sideways scrolling on phones (`relative` on scroll containers).

### SEO and build
- Added `scripts/generate-sitemap.mjs`: writes `public/sitemap.xml` (769 URLs) and `public/robots.txt`; runs on `npm run build`; uses `SITE_URL`.
- `vite.config.ts`: `build.sourcemap: 'hidden'`.

### Content and copy
- Community: new "Village health assurance" section showing the official Jowar Health Assurance Scheme page.
- About 250 labels converted to sentence case. Names, acronyms and official titles were protected and every change was reviewed by hand.

### Docs
- `BACKEND_INTEGRATION_GUIDE.md`:
  - New settings.
  - New `inquiry_updates` and `page_feedback` tables.
  - New endpoints for inquiries (submit, track, list, update), feedback, sign-in (with hashing, rate limiting, CAPTCHA and MFA requirements) and ranked search.
  - Updated file counts.
- `UX4G_COMPLIANCE_REPORT.md`: added a remediation section with before/after results and updated all checklist rows (now 194 pass, 37 partial, 18 fail).
- **Correction:** the audit had said the newest scraped notice was from January 2025. It's from 5 October 2026. The C2 finding still holds.

**Verified:**
- axe-core: 0 violations on 27 pages at both widths.
- Contrast: 0 failures in all three colour modes.
- Phone width: no horizontal overflow.
- Lighthouse: performance 95, accessibility 100, best practices 100, SEO 100.
- A feature test covered: submitting and tracking an inquiry; admin sign-in being refused; pagination and sorting; the ticker; remembered settings; sharing; voice search; the sitemap.

---

## Phase 7 — Project restructure

### Moved

| Old path | New path |
|---|---|
| `src/index.css` | `src/styles/index.css` |
| `src/components/common/Layout.tsx`, `AccessibilityBar.tsx`, `Navbar.tsx`, `Breadcrumbs.tsx`, `AlertTicker.tsx` | `src/components/layout/` |
| `src/components/common/NationalHeader.tsx` | `src/components/layout/SiteHeader.tsx` (component renamed) |
| `src/components/common/NationalFooter.tsx` | `src/components/layout/SiteFooter.tsx` (component renamed) |
| `src/components/common/AccessibilitySettings.tsx`, `ExternalLinkNotice.tsx` | `src/components/accessibility/` |
| `src/components/common/SearchModal.tsx` | `src/components/search/` |
| `src/components/common/Skeleton.tsx`, `ListControls.tsx`, `ShareButtons.tsx` | `src/components/ui/` |
| `src/components/common/FeedbackWidget.tsx`, `src/components/contact/InquiryForm.tsx` | `src/components/feedback/` |
| `src/components/content/officialContentUtils.ts` | `src/utils/officialContent.ts` |
| `src/assets/realLogo.jpg`, `logo-160.jpg` | `src/assets/images/mgims-logo.jpg`, `mgims-logo-160.jpg` |
| Translations inside `src/context/AccessibilityContext.tsx` | `src/i18n/translations.ts` |
| `UX4G_COMPLIANCE_REPORT.md`, `BACKEND_INTEGRATION_GUIDE.md` | `docs/` |
| `src/assets/UX4G-Handbook.pdf`, `ux4g_*.txt` | `docs/ux4g-handbook/` (extracts in `extracts/`) |

### Changed
- All 166 relative imports now use the `@/` alias for `src/` (`tsconfig.app.json` `paths`, `vite.config.ts` `resolve.alias`).
- The per-notice file pattern is `/src/data/notices/*.json`.

### Removed (unused)
- `src/App.css`, `src/assets/hero.png`, `react.svg` and `vite.svg`: Vite template leftovers.
- `src/assets/OIP.webp`: the old logo.
- `public/favicon.svg` and `public/icons.svg`.
- `.DS_Store` files.

### Added
- `README.md`: project overview, setup, scripts, settings, structure, data and conventions. Replaces the Vite template README.
- `.env.example`: every setting, with comments.
- `.gitignore`: ignores `.env` and `.env.*`, but keeps `.env.example`.
- `CHANGELOG.md`: this file.

**Verified:** type-check, build (716 on-demand chunks) and lint pass. The feature test and audit show the same results as after Phase 6.

---

## Open items

- **For MGIMS to supply:**
  - Official Privacy Policy, Terms, Disclaimer, Hyperlinking Policy and FAQ text.
  - Hindi and Marathi page content, or a Bhashini integration.
  - Descriptive captions for key photos.
  - Real Hospital Charges and RTI content.
- **Backend:** the endpoints in `docs/BACKEND_INTEGRATION_GUIDE.md`, then set `VITE_USE_MOCK_API=false`. Until then, inquiries and feedback stay in the visitor's browser.
- **Hosting:** HTTPS, caching, compression, CDN, and self-hosted WebP photos (photos still load from mgims.ac.in).
- **Optional:** analytics with consent, error monitoring, offline cache, interactive map.
- **Engineering:**
  - Move the Playwright checks used during this work into the repo as tests.
  - Split `AdminPage.tsx` and `services/api.ts`.
- **Information architecture:** an audience-based main menu (6–7 items instead of 11), and a slimmer Academics section. See the IA review in the conversation.
