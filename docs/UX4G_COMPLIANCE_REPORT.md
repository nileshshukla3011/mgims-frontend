# UX4G Audit Report — MGIMS Portal (new frontend)

**Standard:** UX4G User Experience Handbook (`docs/ux4g-handbook/UX4G-Handbook.pdf`, 355 pages). Covered: Ch. 3 UX Audit Process, Ch. 5 Website Parameters, Ch. 6 Common Parameters, Ch. 7 UI Foundations, UX4G Design System, and the Website Compliances checklist (pp. 328–350).
**Audited:** 12 October 2026, production build served locally (`vite build` + `vite preview`).
**Remediated and re-tested:** 12 October 2026 — see Section 0.
**Scope:** The public portal and the admin console. 24 representative pages at desktop (1280 px) and phone (375 px) widths: home, About, Hospital, Academics, Departments, Faculty, Research, Accreditations, Tenders, Recruitment, News, a notice, Community, Contact, Search, a policy page and Admin.

## Method

Following the handbook's audit process (Ch. 3):

| Area | How it was checked |
|---|---|
| Accessibility | axe-core 4.10 (WCAG 2.0/2.1/2.2 A and AA rules plus best practice) on all 24 pages; contrast measured on every text element in normal, dark and high-contrast modes; keyboard tab-through; landmark and heading structure. |
| Performance | Google Lighthouse 12 (mobile, simulated slow 4G) on the home, OPD and Publications pages. |
| Design & layout | Measured in Chrome: touch-target sizes, line length, font sizes, italics and all-caps, link underlines, phone-width overflow, overflow at the largest text size. |
| Navigation & search | Manual walkthrough of menus, breadcrumbs, search, filters and redirects. |
| Content | Content checked against the scraped official MGIMS website data. |
| Checklist | Each Website Compliances item was answered from the above and from the source code. |

**Not covered:** testing with real users, or with screen readers such as NVDA, JAWS and VoiceOver. Hosting items (HTTPS, caching, CDN, compression) can only be verified once the site is deployed.

---

## 0. Remediation status (after fixes)

All findings that could be fixed in the frontend have been implemented and re-tested with the same tools.

| Measure | Before | After |
|---|---|---|
| Lighthouse performance (home, mobile) | 55 | **95** |
| First contentful paint (home / inner pages) | 12.3 s / 11.0 s | **2.0 s / 2.2 s** |
| Data downloaded on first visit | 2,144 KB | **367 KB** |
| Lighthouse accessibility · best practices · SEO | 96 · 100 · 92 | **100 · 100 · 100** |
| axe-core violations (27 pages) | 344 nodes (5 rules) | **0** |
| Contrast failures: normal / dark / high-contrast | 0 / hundreds / 0 | **0 / 0 / 0** |
| Pages with a unique title | 1 of 24 | **27 of 27** |
| Checklist rows: pass · partial · fail | 151 · 53 · 45 | **194 · 37 · 18** |

| Finding | Status | What was done |
|---|---|---|
| C1 Slow first load | ✅ Fixed | Pages and data load on demand; notice index, one file per notice, and a compact search index replace the 8.8 MB bundle. |
| C2 Invented ticker notices | ✅ Fixed | Ticker shows the five newest official notices and can be hidden. The unsupported "MBBS admissions 2026-27" label was also removed. |
| C3 Dark mode unreadable | ✅ Fixed | Complete dark-theme colour rules; 0 failures on 18 pages. |
| C4 Grievances | ⚠️ Frontend done | Form submits and issues a ticket; tracking page; staff can change status. Needs the backend endpoints (see `BACKEND_INTEGRATION_GUIDE.md`) to store inquiries centrally. |
| C5 Admin security | ⚠️ Frontend done | No hard-coded or empty password; sign-in goes through `POST /api/auth/login`; admin links removed from public menus; `/admin` disallowed in robots.txt. Server-side hashing, CAPTCHA and MFA are specified for the backend. |
| H1 Page titles | ✅ Fixed | Every page sets its own title and description. |
| H2 Policy text | ❌ Open | Needs the official Privacy Policy, Terms, Disclaimer, Hyperlinking Policy and FAQs from MGIMS. |
| H3 Feedback | ✅ Fixed | Feedback widget (helpful yes/no + comment, Cancel/Submit). |
| H4 Line length | ✅ Fixed | Body text limited to 75 characters per line. |
| H5 Lists | ✅ Fixed | Pagination, newest/oldest sort and "Clear filters" on News, Tenders and Recruitment. The false "Active" badge on every tender was removed. |
| M1–M3 Landmarks, labels, headings, tables | ✅ Fixed | |
| M4 Touch targets | ✅ Fixed | |
| M5 Search | ✅ Fixed | Filters by type, relevance ranking, voice search, "See all results". |
| M6 Translation | ❌ Open | Needs Bhashini integration or professional Hindi/Marathi translation of content. |
| M7 Images | ⚠️ Partly | Logo resized with srcset. Scraped photos are still hot-linked from mgims.ac.in with generic alt text; self-hosting, WebP conversion and descriptive alt text need an asset decision. |
| M8 Accessibility widget | ✅ Fixed | Remembered settings, sticky widget, Screen Reader Access page. |
| M9 Help & undo | ⚠️ Partly | Undo added; FAQ content pending (H2). |
| M10 Sharing | ✅ Fixed | |
| M11 robots.txt & sitemap | ✅ Fixed | Generated at build time (769 URLs; set `SITE_URL`). |
| L1 Sentence case | ✅ Fixed | 251 labels converted; proper names and acronyms kept. |
| L2 Small text | ✅ Fixed | 12 px minimum. |
| L3 Skeletons | ✅ Fixed | |
| L4 Home figures | ✅ Fixed | Replaced with official "Hospital in Numbers" (2023) figures. |
| L5 Source maps | ✅ Fixed | Hidden source maps generated for error monitoring. |

**Decisions recorded (from MGIMS):** MGIMS is run by Kasturba Health Society, not the Government of India. The "भारत सरकार / Government of India" label and link were removed from the top bar (and the India.gov.in link from the footer), and the National Emblem is not shown; the checklist item is marked not applicable.

**Correction to the original audit:** the original report said the latest scraped notice was from January 2025. That was wrong — the newest notices are dated 5 October 2026. The finding itself (C2) stands: no notice mentions "MBBS 2026-27" counselling or "2025-26" award nominations.

---

## 1. Summary (original audit, before fixes)

| Lighthouse (mobile) | Home | OPD | Publications |
|---|---|---|---|
| Performance | **55** | **56** | **56** |
| Accessibility | 96 | 96 | 96 |
| Best practices | 100 | 100 | 100 |
| SEO | 92 | 92 | 92 |
| First contentful paint | **12.3 s** | **11.0 s** | **11.0 s** |

- **Strong:** keyboard access, focus visibility, normal-mode colour contrast (0 failures), structure (breadcrumbs, landmarks, skip link), footer trust content, external-link warning, accessibility widget.
- **Blocking issues:** page load time is about 6× the handbook's 2-second target, dark mode is unreadable on several pages, the news ticker shows invented notices, and grievance redressal does not work.

| Checklist result (291 rows in Section 4; a few rows group related items) | Rows |
|---|---|
| ✅ Pass | 151 |
| ⚠️ Partial | 53 |
| ❌ Fail | 45 |
| ➖ Not applicable (no citizen login, data visualisations or offline service) | 34 |
| 🔍 Verify after deployment | 8 |

---

## 2. Findings by priority (original audit — see Section 0 for current status)

### Critical — fix before launch

| # | Finding | Evidence | Handbook ref | Recommendation |
|---|---|---|---|---|
| C1 | **Very slow first load.** Nothing appears for 11–12 s on a mid-range phone; the target is under 2 s. | Lighthouse FCP 11.0–12.3 s. A single 8.8 MB JavaScript file (2.0 MB compressed) contains all scraped data. | 5.2.1, 5.6.14, 6.16.1 | Serve data from the API (`VITE_USE_MOCK_API=false`) or load each section's JSON on demand; code-split routes with `React.lazy`. |
| C2 | **Invented notices in the ticker.** "MBBS 2026-27 Counseling & Reporting Guidelines released" and "Dr PRJ Gangadharam Award 2025-26 Nominations Open" have no matching official notice. | `AlertTicker.tsx` is hard-coded; there are 0 matches for "2026-27" or "2025-26" in the 672 notices (newest notice: 5 October 2026). | 6.10.9, Ch. 3 (content accuracy), 5.1 trust | Drive the ticker from the newest real notices, or remove it until MGIMS supplies alerts. |
| C3 | **Dark mode is unreadable on key pages.** Faculty cards: light text on light grey (1.13–1.15:1). Home service cards stay white under light text (1.22:1). News cards 4.4:1. Category badges 1.66:1. Amber labels 2.07:1. | Contrast measured in dark mode: up to 3,356 failing elements on /news and 297 on /faculty; 0 in normal mode. | 6.4.2, 7.1 (4.5:1 minimum) | Replace the CSS overrides in `index.css` with proper dark-theme colour tokens, or remove dark mode until it passes. |
| C4 | **Grievances cannot be filed or tracked.** The inquiry form shows a success message with a random "Reference ID" but sends nothing; there's no status tracking and no resolution communication. | `DirectoryContactPage.tsx` `handleSubmit` only toggles state. | 5.1.8 | Connect `POST /api/inquiries`, return a real ticket ID, and add a "Track your grievance" page. Until then, remove the fake reference ID. |
| C5 | **Admin console has no real security.** It accepts an empty password checked in the browser, and is linked from every page. | `AdminPage.tsx` `handleLogin`. | 7.2.3 (6.2.3) | Use server-side authentication with hashed credentials, CAPTCHA and MFA; remove the public "Admin Portal" link. |

### High

| # | Finding | Evidence | Ref | Recommendation |
|---|---|---|---|---|
| H1 | Every page has the same `<title>` and meta description. | 24 of 24 pages share one title and one description. | 5.3.11, 6.6.1, 6.16 | Set a page-specific title and description on each route, e.g. "Outpatient Services – Kasturba Hospital – MGIMS". |
| H2 | Policy pages (Privacy, Terms, Disclaimer, Hyperlinking, FAQs) are placeholders. | `/policies/*` state that the official text is not yet published. | 5.1.3, 5.1.7 | MGIMS to supply the text; publish before launch. |
| H3 | No feedback or rating mechanism. | No feedback widget anywhere. | 5.1.9, Design System "Feedback Widget" | Add the UX4G feedback widget (optional, with Cancel/Submit) on the Contact page and after form submission. |
| H4 | Long lines of text are hard to read. | 117–180 characters per line (handbook range 50–100); /departments/medicine runs at 180. | 5.5.21 | Limit body text width to about 70ch (`max-w-prose`). |
| H5 | Large lists render everything at once with no sorting. | /news renders 576 cards; Tenders, Recruitment and News have no date sorting, pagination or "clear filters". | 6.7.1–6.7.3, 6.16 | Add pagination or "load more", sorting by date (newest first, toggle) and a reset-filters control. |

### Medium

| # | Finding | Evidence | Ref | Recommendation |
|---|---|---|---|---|
| M1 | The accessibility bar and ticker sit outside landmarks. | axe `region`: 6 nodes per page. | 6.11.2 (ARIA landmarks) | Move both into `<header>`, or give the bar `role="region"` and an `aria-label`. |
| M2 | Duplicate landmark names and one heading-level skip. | axe `landmark-unique` (/academics/pg); `heading-order` (/search uses h4 under h2). | 7.4 / WCAG | Give each official-content section a unique label; use h3 in search results. |
| M3 | Scraped tables have empty header cells. | axe `empty-table-header` on /hospital/overview. | WCAG 1.3.1 | Render empty header cells as `<td>`. |
| M4 | Some touch targets are too small. | Footer policy links fail axe `target-size` (8 per page). The mobile menu toggle and dark-mode toggle are under 44 px. | 5.2.1 (42 px), 6.6.1 (44 px) | Use `min-h-11` with spacing on footer links; make icon buttons 44×44. |
| M5 | Search has no result filters, sorting or voice search. | /search lists results by type only. | 6.3.4, 6.3.6, 6.3.7 | Add filters by category and date; consider Bhashini voice input. |
| M6 | Only menu labels are translated into Hindi and Marathi. | The language switch changes about 25 navigation strings; all page content stays in English. | 5.2.2, 6.13.5 | Translate key pages, or integrate Bhashini. |
| M7 | Image alt text is generic, and images are not optimised. | Alt text reads like "Photo 3 from Arogyadham"; photos are hot-linked from mgims.ac.in with no `srcset` or WebP. Lighthouse flags responsive images and next-gen formats. | 6.9.8, 6.10.8, 6.16.1 | Self-host the photos; generate WebP with `srcset`; write descriptive alt text for key images. |
| M8 | Accessibility widget is incomplete. | No "Screen reader" option; settings are not remembered between visits; widget is not sticky at the bottom-right. | Design System Accessibility Widget, 6.5.4 | Add a screen-reader access page, remember preferences in `localStorage`, and add a sticky widget button. |
| M9 | No help centre and no undo. | FAQ is a placeholder; Admin deletes have no confirmation or undo. | 6.12.1, 6.11.1, 6.12.3 | Publish FAQs; add a confirm dialog and an undo toast for deletes. |
| M10 | No content sharing on notices or news. | No share control (a `Share2` icon is imported but unused). | 6.1.6 | Add a share button (WhatsApp, X, copy link) on notice pages. |
| M11 | No `robots.txt` or sitemap. | `/robots.txt` returns the app's HTML; Lighthouse "robots.txt is not valid". | 6.16, SEO | Add `public/robots.txt` and generate `sitemap.xml`. |

### Low

| # | Finding | Ref | Recommendation |
|---|---|---|---|
| L1 | Headings, table headers and buttons use Title Case; the handbook asks for sentence case. | 7.2 | Copy-editing pass. |
| L2 | "Active" badges render at 11 px (below 12 px). | 7.2 | Use at least 12 px. |
| L3 | Loading states are text only; no skeleton screens. | 6.11.1 | Add skeletons on Faculty, News and Departments. |
| L4 | Home page statistics and hand-typed sections are unverified (marked on inner pages, not on the home page). | 6.10.9 | Verify the figures with MGIMS, or source them from official pages. |
| L5 | Missing source maps for production JavaScript (Lighthouse). | 6.16.2 | Generate source maps for error monitoring. |

### Decisions for MGIMS (resolved — see Section 0)

- **National Emblem (5.1.4):** not shown; MGIMS is run by Kasturba Health Society.
- **"भारत सरकार / Government of India" label:** removed.
- **Meri Pehchaan SSO (5.1.5, 6.2):** only needed if citizen login is introduced.

---

## 3. What already meets the handbook

- **Trust:** ownership, contact details, copyright and last-updated date in the footer; Contact Us in the main menu; privacy, terms and FAQ links in every footer; redirection notice for every external link; consent checkbox on the inquiry form.
- **UI foundations:**
  - Noto Sans with Devanagari support, rem-based text resizing, and contrast in normal mode (0 failures across 24 pages).
  - High-contrast mode passes; no italics, no all-caps.
  - Text links are underlined; consistent outlined icons.
- **Accessibility:**
  - Skip link is the first Tab stop, and focus is visible on every element tabbed through.
  - Labelled form fields; dialogs with Esc and focus handling; `lang` follows the language choice.
  - axe found no serious issues apart from touch-target spacing.
- **Navigation:** persistent sticky menu with dropdowns; a hamburger menu on mobile; breadcrumbs on all inner pages; the logo links home; consistent section layouts; old and scraped URLs redirect to the right section.
- **Responsive:** no horizontal scroll at 375 px, including at the largest text size; viewport meta tag; fluid grid.
- **Content:** official MGIMS content is shown on Hospital, About, Academics, Research, Accreditations and Community pages, with source links; unverified hand-typed content is labelled.
- **Search:** in the header on every page, with live suggestions as you type, a scope hint, a loading indicator and keyboard shortcut (Ctrl+K).
- **Print:** print stylesheet that hides the site chrome.

---

## 4. Website Compliances checklist (pp. 328–350) — current status after fixes

Legend: ✅ Pass · ⚠️ Partial · ❌ Fail · ➖ N/A · 🔍 Verify after deployment. A finding ID (e.g. C1) points to Section 2.

### Trust & Credibility
| Item | Status | Note |
|---|---|---|
| SSL / https (6.1.1) | 🔍 | Hosting. |
| Ownership information displayed | ✅ | Footer. |
| Contact details provided | ✅ | Footer, Contact page. |
| Consent before collecting or storing data | ✅ | Inquiry-form consent; no cookies or analytics used. |
| Informed what data is collected and how it's used | ⚠️ | Consent text on the form; Privacy Policy text still to be supplied by MGIMS (H2). |
| National Emblem in header | ➖ | Not applicable: MGIMS is run by Kasturba Health Society, not a central government body (decision recorded). |
| Trusted login (Meri Pehchaan) | ➖ | No citizen login. |
| Grievance redressal mechanism | ✅ | Inquiry form submits and returns a ticket number (C4). Production storage needs the backend endpoints. |
| Track complaint status | ✅ | Track-your-inquiry page by ticket and mobile number (C4). |
| Communicate resolutions | ⚠️ | Status and update history shown on the tracking page; SMS or email notification needs the backend. |
| Feedback, reviews, ratings | ✅ | Feedback widget (helpful yes/no + comment) after submitting an inquiry (H3). |
| Redirection notice for external links | ✅ | |
| Privacy Policy and Terms available | ⚠️ | Linked, but placeholder text (H2). |
| Clearly visible Contact Us | ✅ | |

### Mobile First
| Item | Status | Note |
|---|---|---|
| Core content accessible on mobile | ✅ | |
| Flexible grids, fluid images, media queries | ✅ | |
| Touch targets (42 px) | ✅ | All icon buttons at least 44 px (M4). |
| Spacing between interactive elements | ✅ | axe target-size: 0 issues (M4). |
| Mobile navigation pattern (hamburger) | ✅ | |
| Load time under 2 s | ✅ | First contentful paint 2.0 s on the home page, 2.2 s on inner pages, Lighthouse slow 4G (C1). |
| Lazy loading of images | ✅ | Content images use `loading="lazy"`. |
| Expandable sections | ✅ | "Show more", mobile submenus. |
| Language selection reachable on mobile | ✅ | |
| Form validation and error handling | ✅ | Inline error next to each field, focus moves to the first error. |

### Homepage
| Item | Status | Note |
|---|---|---|
| Stands out from other pages | ✅ | Hero banner. |
| Professional first impression | ✅ | |
| Clear visual hierarchy | ✅ | |
| Valuable content within one click | ✅ | |
| Progressive disclosure | ✅ | Tabs, cards. |
| Primary task highlighted (CTA) | ✅ | Emergency, Charges, Admissions CTAs. |
| Overview / entry points to internal pages | ✅ | |
| Recent items plus archive link | ✅ | Notice board with "View Full Archive". |
| Content meaningful, not decorative | ✅ | |
| Motivates exploration | ✅ | |
| Value proposition / tagline | ✅ | |
| Descriptive title, ARIA labels, alt text | ✅ | Unique page titles and descriptions (H1). |
| Organisational info in a dedicated section | ✅ | About Us. |
| URL reflects purpose | 🔍 | Domain. |
| Social media handles | ✅ | Footer. |
| Consistent branding across devices | ✅ | |

### About Us
| Item | Status | Note |
|---|---|---|
| Mission, vision, values | ✅ | Official Vision page. |
| Organisation overview | ✅ | |
| Core values | ✅ | Gandhian principles. |
| Key leaders / Who's Who | ⚠️ | Governance pages; no leader profiles with photos. |
| Achievements and milestones | ✅ | Growth, awards. |
| Brief history | ✅ | |
| Images of team or office | ⚠️ | History and life-at-Sevagram photos; no leadership photos. |
| Links to careers / press | ✅ | Recruitment, Press clippings. |

### Page Layout & Visual Design
| Item | Status | Note |
|---|---|---|
| Scanning patterns (F/Z) | ✅ | |
| Easy to scan, no overload | ✅ | Long lists paginated (H5). |
| Suitable screen density | ✅ | |
| Fonts legible | ✅ | 12 px minimum (L2); text width limited to 75 characters (H4). |
| Layout guides the next action | ✅ | |
| Clear visual starting point | ✅ | |
| Consistent layout | ✅ | Shared section template. |
| Key information above the fold | ✅ | |
| Clickable items recognisable | ✅ | |
| Non-clickable items don't look clickable | ✅ | |
| Radio buttons and checkboxes used properly | ✅ | |
| Hyperlinks identifiable | ✅ | Underlined. |
| Standard, intuitive icons | ✅ | |
| Same font throughout | ✅ | Noto Sans. |
| Colour used to group items | ✅ | |
| Harmonious colour scheme, WCAG ratios | ✅ | 0 contrast failures in normal, dark and high-contrast modes (C3). |
| Print-friendly | ✅ | |
| No italics; underline only for links | ✅ | |
| Underlying grid | ✅ | |
| Related items grouped | ✅ | |
| Section-by-section structure | ✅ | |
| Consistent logo placement | ✅ | |
| Logo links to home | ✅ | |
| Attention-grabbers used sparingly | ✅ | |
| Components match the theme | ✅ | |
| Graphs give access to data | ➖ | No charts. |

### Responsiveness
| Item | Status | Note |
|---|---|---|
| Branding consistent across sizes | ✅ | |
| Touch-friendly spacing | ✅ | M4. |
| Images flexible within containers | ✅ | |
| Performance optimised for mobile | ✅ | Data and pages load on demand; first load about 370 KB (C1). |
| Responsive containers | ✅ | |
| Adaptive grid | ✅ | |
| Text size and line height by device | ✅ | H4. |
| CSS media queries | ✅ | |
| Fluid relative units | ✅ | |
| Viewport meta tag | ✅ | |

### Exploration Without Login
| Item | Status | Note |
|---|---|---|
| Content accessible without login | ✅ | |
| Teaser of premium features | ➖ | |
| Limited interactivity for guests | ➖ | |
| SSO integrated | ➖ | |
| Offline access to viewed content | ❌ | No service worker (optional, "where feasible"). |
| Prompt login for restricted features | ➖ | |

### Login & Signup (Meri Pehchaan)
| Item | Status | Note |
|---|---|---|
| SSO API, documentation, login button, branding, consent, account linking, testing, updates, trust badges (10 items) | ➖ | No citizen login. |
| Authentication security (encryption, hashing, CAPTCHA, MFA) | ⚠️ | No credentials in the frontend any more; hashing, CAPTCHA and MFA are specified for the backend (C5). |
| Privacy and terms communicated at login | ⚠️ | Linked; policy text pending (H2). |

### Search
| Item | Status | Note |
|---|---|---|
| Persistent and prominent in header | ✅ | |
| Auto-suggestions while typing | ✅ | Live results in the search dialog. |
| Global vs local scope indicated | ✅ | Placeholder states scope; page filters are labelled. |
| Filter or sort results | ✅ | Filter by type; ranked by relevance (M5). |
| Autocomplete suggestions | ⚠️ | Live results, not query completion. |
| Results relevant and ranked | ✅ | Ranked by relevance, title matches first (M5). |
| Voice search | ✅ | Voice search in English, Hindi or Marathi where the browser supports it (M5). |
| Fast, with loading indicator | ✅ | |
| Lazy loading of results | ⚠️ | Capped at 10–15 per type. |

### Personalisation
| Item | Status | Note |
|---|---|---|
| Personalised content with consent | ➖ | |
| Data-protection compliance | 🔍 | Backend. |
| Light and dark themes | ✅ | Dark mode fixed (C3). |
| Adjustable font size, styles and layout | ✅ | Settings now remembered between visits (M8). |
| Recommendations / location-based services | ➖ | |
| Notification preferences | ➖ | |
| Real-time personalisation | ➖ | |

### Task Orientation
| Item | Status | Note |
|---|---|---|
| Irrelevant information avoided | ✅ | |
| Media not overused | ✅ | |
| No unnecessary registration | ✅ | |
| Minimal steps and clicks | ✅ | |
| Matches real-life order | ✅ | |
| Automated actions (e.g. pincode autofill) | ➖ | |
| Compare items | ➖ | |
| Frequent features easy to reach; sticky accessibility widget | ✅ | Sticky accessibility button at bottom-right (M8). |
| No repeated data entry | ✅ | |
| Multi-step progress feedback | ➖ | |
| Recognition over recall | ✅ | |
| Familiar conventions for data formats | ✅ | |
| No technical jargon | ⚠️ | Some scraped page names, e.g. "CBCWD". |
| Recovery from critical errors (confirm before submit) | ✅ | Undo after deleting a notice (M9). |
| Tooltips for common tasks | ⚠️ | Help text and hints on forms; no tooltips. |
| Resume where left off | ➖ | |
| Sorting and filtering on content-heavy pages | ✅ | H5. |
| Button text and icons relevant | ✅ | |
| Timeout warning before logout | ➖ | |
| Novice and expert support | ⚠️ | Ctrl+K shortcut; no guided help. |
| Edit submitted info | ➖ | |
| Onboarding guides | ➖ | |
| Buttons for actions, links for navigation | ✅ | |
| Real-time validation | ✅ | Errors shown as soon as a field is left. |

### Navigation & IA
| Item | Status | Note |
|---|---|---|
| Page titles recognisable | ✅ | H1. |
| Clear, logical hierarchy | ✅ | |
| Primary navigation clearly labelled | ✅ | |
| Consistent patterns (breadcrumbs) | ✅ | |
| Persistent navigation | ✅ | Sticky. |
| Prominent placement | ✅ | |
| Large enough to click (44 px) | ✅ | M4. |
| Visual feedback on navigation | ✅ | |
| Smooth transitions | ✅ | |
| Back navigation | ✅ | |
| Breadcrumbs beyond 3 levels | ✅ | |
| Information architecture based on user needs | ⚠️ | Not user-tested. |
| Related content grouped | ✅ | |
| Shallow hierarchy | ✅ | |
| Consistent structure | ✅ | |
| Multiple pathways (menu, search, shortcuts) | ✅ | |
| IA refined from feedback | ⚠️ | Feedback is now collected (H3); review process is for MGIMS. |

### Lists, Filters & Sorting
| Item | Status | Note |
|---|---|---|
| Logical, concise list items | ✅ | |
| Consistent styling | ✅ | |
| Dividers between items | ✅ | |
| Easily clickable | ✅ | |
| Visual feedback on click | ✅ | |
| Lazy loading or pagination for large lists | ✅ | 20–24 items per page (H5). |
| Loading indicators | ✅ | |
| Filters prominent | ✅ | |
| Collapsible filters | ➖ | |
| Clear filter labels | ✅ | |
| Multi-select filters | ❌ | |
| Real-time filtering | ✅ | |
| Active filters shown | ✅ | |
| Reset or clear filters | ✅ | "Clear filters" button (H5). |
| Save filter preferences or custom filters | ➖ | |
| Sorting by relevant criteria | ✅ | Date sort on News, Tenders and Recruitment (H5). |
| Logical default order | ✅ | Newest first. |
| Ascending / descending toggle | ✅ | Newest / oldest toggle. |
| Combination sorting | ➖ | |
| Sort indicators; active sort highlighted | ✅ | Button shows the current order; tables expose aria-sort. |

### Forms & Data Entry
| Item | Status | Note |
|---|---|---|
| Only essential fields | ✅ | |
| Steppers for long forms | ➖ | |
| Progress indicators | ➖ | |
| Labels positioned clearly | ✅ | |
| Appropriate input types | ✅ | `tel`, `email`, numeric keypad. |
| Real-time validation with solution | ✅ | Errors shown as soon as a field is left. |
| Touch-optimised fields | ✅ | |
| Autofill | ✅ | `autocomplete` attributes. |
| Suggestions or predictive text | ➖ | |
| Placeholder text | ✅ | |

### Banners & Graphics
| Item | Status | Note |
|---|---|---|
| Clear purpose; relevant; consistent branding | ✅ | |
| High-resolution images | ⚠️ | Scraped photos vary in quality. |
| Appealing, not overwhelming | ✅ | |
| Positioned without blocking | ✅ | |
| Sized for screens | ✅ | |
| Clear CTA | ✅ | |
| Interactive where useful | ✅ | |
| Subtle animation | ✅ | |
| Animation doesn't hurt performance | ✅ | Reduced-motion supported. |
| Concise text, good contrast | ✅ | |
| Alt text | ⚠️ | Every image has alt text, but scraped photos only have generic descriptions (M7). |
| Not too many banners; carousel | ✅ | |
| Banners updated regularly | ✅ | Ticker shows the five newest official notices (C2). |
| Localised | ❌ | M6. |
| Contextually relevant | ✅ | |
| Optimised images | ⚠️ | Logo resized with srcset; scraped photos still hot-linked from mgims.ac.in (M7). |
| Lazy loading | ✅ | |
| Dismissible notifications | ✅ | Ticker can be hidden. |

### Writing & Content Quality
| Item | Status | Note |
|---|---|---|
| Organised into categories | ✅ | |
| Personalised recommendations | ➖ | |
| Easy to understand | ✅ | |
| Tailored to audience | ⚠️ | English only (M6). |
| Consistent brand voice | ✅ | |
| Tone adjusted to context | ✅ | |
| Headings, subheadings, bullets | ✅ | |
| Important information highlighted | ✅ | |
| Grammar and spelling | ⚠️ | Scraped text has typos, e.g. "Affiliattion" in source URLs. |
| Short paragraphs, whitespace | ✅ | |
| Guidance for navigating features | ⚠️ | |
| WCAG adherence | ✅ | axe: 0 violations on 27 pages; all three colour modes pass contrast. |
| Descriptive alt text | ⚠️ | M7. |
| Content up to date and accurate | ⚠️ | Invented alerts and unsourced home figures replaced (C2, L4); remaining hand-written content is labelled unverified. |
| Feedback and analytics refine content | ⚠️ | Feedback collected; no analytics yet. |
| Clear placeholder text | ✅ | |
| Concise tooltips | ➖ | |

### Micro & Macro Interactions
| Item | Status | Note |
|---|---|---|
| Loading, success and error messages | ✅ | |
| Button states (hover, active, disabled) | ✅ | |
| Form fields highlighted on focus | ✅ | |
| Tooltips on hover | ⚠️ | Native `title` attributes only. |
| Skeleton loading screens | ✅ | L3. |
| Textual updates for long processes | ✅ | |
| Consistent notification location | ✅ | |
| Confirmation messages | ✅ | Inquiry confirmation shows a real ticket number. |
| Undo recent actions | ✅ | M9. |
| Consistent animations | ✅ | |
| Accordions / expandable sections | ✅ | |
| Interactive maps | ❌ | Contact page has directions, no map. |
| Keyboard access to all interactive elements | ✅ | |

### Help, Feedback & Error Tolerance
| Item | Status | Note |
|---|---|---|
| Help centre / FAQs / knowledge base | ⚠️ | FAQ page exists; content to be supplied by MGIMS (M9). |
| Context-sensitive help | ❌ | |
| Searchable help | ⚠️ | Site search only. |
| Feedback forms to report issues | ✅ | C4, H3. |
| Surveys / polls | ❌ | |
| Contact support (email, phone) | ✅ | |
| Clear error messages | ⚠️ | |
| Undo / revert | ⚠️ | Undo after deleting a notice in the admin console; no other destructive actions on the public site. |
| Tutorials / walkthroughs | ➖ | |
| Tooltips and hints | ⚠️ | |
| Feedback acknowledged, tracked and followed up (3 items) | ⚠️ | Acknowledged with a ticket and trackable; follow-up messages need the backend. |
| Auto-save / recovery | ➖ | |
| Basic function when features fail | ✅ | Missing data shows a message, not a crash. |
| Self-service knowledge base | ❌ | |
| Tips / articles / videos | ➖ | |
| Help accessible to people with disabilities | ✅ | |
| Help in multiple languages | ❌ | |
| Error reporting tools | 🔍 | Sentry or similar not set up. |

### Government Service Integration
| Item | Status | Note |
|---|---|---|
| DigiLocker / myScheme / Bhashini identified | ⚠️ | Ayushman Bharat / MJPJAY are referenced; Bhashini recommended (M6). |
| Use cases, API documentation, encryption, consent, role and benefits explained, consistent UI, onboarding, updates, help, scalability, future plans | ➖ / 🔍 | No integrations yet. |

### Offline Functionality
| Item | Status | Note |
|---|---|---|
| All 10 items | ➖ | No offline features; worth considering for rural users (6.14). |

### Data Visualisation
| Item | Status | Note |
|---|---|---|
| All 9 items | ➖ | No charts; data is shown as accessible tables. |

### Performance Optimisation
| Item | Status | Note |
|---|---|---|
| HTTP requests minimised (bundling) | ✅ | |
| Lazy loading of media | ✅ | |
| Asynchronous JavaScript | ✅ | Module script. |
| Responsive images (`srcset`) | ⚠️ | Logo uses srcset; scraped photos do not (M7). |
| Compressed images | ⚠️ | |
| Next-gen formats (WebP) | ❌ | WebP not produced; logo shrunk to 11 KB JPEG instead (M7). |
| Caching headers | 🔍 | |
| CDN | 🔍 | |
| Minified files | ✅ | |
| Unused CSS / JS removed | ⚠️ | About 48 KiB unused JavaScript remains. |
| Critical CSS inlined | ❌ | |
| Database query optimisation, indexing, caching | 🔍 | Backend. |
| HTTP/2; Gzip / Brotli; load balancing | 🔍 | Hosting. |
| Fully responsive | ✅ | |
| Touch interactions optimised | ⚠️ | M4. |
| Real-time monitoring | ❌ | |
| Performance feedback collected | ❌ | |
| Error logging (Sentry) | ❌ | |
| Crash reporting | ❌ | |
| `<link rel="preload">` | ❌ | |
| Critical content first | ✅ | Pages and data load on demand (C1). |
| Smooth animations | ✅ | |
| Feedback while processing | ✅ | |
| Performance monitored | ❌ | |
| No broken links or errors | ✅ | No console errors; unknown URLs redirect. |
| Optimised for slow connections | ✅ | About 370 KB on first visit (C1). |
| Essential content preloaded | ❌ | |

### Analytics
| Item | Status | Note |
|---|---|---|
| All 13 items (integration, KPIs, heatmaps, events, segmentation, consent, anonymisation, real-time, crash reporting, flows, dashboards, reports, A/B tests) | ❌ / ➖ | No analytics. When added, include consent (6.17.4). |

### Accessibility
| Item | Status | Note |
|---|---|---|
| Multilingual support | ⚠️ | Menus in Hindi and Marathi; page content English only (M6). |
| Sufficient text contrast | ✅ | All three modes pass (C3). |
| WCAG adherence | ✅ | axe: 0 violations on 27 pages; all three colour modes pass contrast. |
| Readable for visual impairments | ✅ | |
| Screen readers and assistive technology | ⚠️ | Semantics pass automated checks; manual screen-reader testing still recommended. |
| Keyboard navigation for all elements | ✅ | |
| Easy for limited-experience users | ✅ | |
| List items accessible to screen readers | ✅ | |
| Keyboard navigation of lists | ✅ | |
| Sorting labelled for screen readers | ➖ | No sorting. |
| Accessible forms | ✅ | |
| Form elements keyboard accessible | ✅ | |
| ARIA landmarks | ✅ | All content inside landmarks (M1). |

---

## 5. Remaining work

1. **MGIMS to supply:** policy and FAQ text (H2); approved Hindi/Marathi content or a Bhashini integration (M6); descriptive captions for key photos (M7).
2. **Backend team:** implement the inquiry, feedback, search and sign-in endpoints in `BACKEND_INTEGRATION_GUIDE.md`, including hashed passwords, rate limiting, CAPTCHA and MFA for staff (C4, C5); then set `VITE_USE_MOCK_API=false`.
3. **Hosting:** HTTPS, caching headers, Gzip/Brotli, HTTP/2, a CDN; self-host and convert the scraped photos to WebP with `srcset` (M7); set `SITE_URL` for the sitemap.
4. **Optional, by decision:** analytics with cookie consent; error monitoring (e.g. Sentry); an offline cache for rural users (6.14); an interactive campus map; a help centre.
5. **Testing:** manual screen-reader testing (NVDA, VoiceOver, TalkBack) and usability testing with patients and students; re-run this audit after each release.
