# Frontend system design review: MGIMS website

**Scope:** the public website and the admin console in `mgims-frontend/`. The patient, student and fee portals are outside this scope; the website only provides their entry points (see the README, "Portals").
**Method:** I read the code and configuration, inspected the build output and ran the test suites. The review was written first; the findings were then implemented. Each finding's status is below.

**Status key:** **Done**: implemented and checked. **Partly done**: the frontend part is done, and the rest needs a server or backend decision. **Deferred**: not done yet, with the reason given.

## Verdict

The base is solid for a government content website. The stack is modern and small, demo code is separated from live code, accessibility is very strong, and pages load in small pieces.

The original review found the weak areas in engineering process and long-term upkeep. Those have now been addressed:

- Tests and CI are in the repository.
- Error boundaries are in place.
- Type-checking is explicitly strict.
- There is a single HTTP client.
- The console has URL-based sections.
- Colours come from design tokens.
- Head tags are pre-rendered for each page.
- Fonts are self-hosted.
- There is a server configuration with security headers.

What remains depends mostly on the backend or the server: moving files off the old site, real 404 status codes, a rich-text format and the API naming style.

## Architecture at a glance

- **Two apps, one codebase.** The public site (Vite, React Router, pages loaded on demand) and the admin console (its own Vite entry, now with React Router) share `src/`. A lint rule stops public code from importing console code.
- **Data layer.** A build-time switch picks demo data or the live API. All requests go through one client (`src/services/http.ts`). Demo modules are left out of live builds; CI checks this on every push.
- **State.** Component state, one context for accessibility and language, and the `useAsync` hook. Public reads have a short cache with de-duplication in the HTTP client.
- **Content.** Scraped JSON becomes pages through section configuration and one shared renderer (`SectionedPage` and `OfficialContent`).
- **Portals.** There is one route per portal (`/patient-portal`, `/student-portal`, `/fee-portal`), defined in `src/config/portals.ts`. Each route opens an in-app module, forwards to an external address, or shows a "being connected" page. The roughly 3,000 lines of portal screens were removed.

## Strengths to keep

1. **A clean API boundary.** The types are the contract, and the backend field mapping is in one place. In live mode without a backend, pages show error messages instead of crashing.
2. **Good loading behaviour.** Every route and data file loads on demand.
3. **Accessibility.** axe-core reports no WCAG 2.1 A/AA violations. The browser tests now run axe automatically on the pages they visit, in light and dark mode. Keyboard focus, text size, contrast modes and reduced motion are all handled.
4. **The admin console is a separate app.** None of its code ships to the public site, and lint now enforces this.
5. **Graceful degradation.** Live data feeds keep a last-known-good copy with its age, and errors offer a retry.
6. **Few dependencies and good documentation.** The runtime libraries are React, React Router, Tailwind, lucide and the self-hosted fonts.

## Findings and status

| # | Priority | Finding | Status | What was done / what remains |
|---|---|---|---|---|
| 1 | P1 | No tests and no CI in the repository. | **Done** | **Unit tests:** Vitest (`npm test`), 33 tests for notice dates, role rules, console sections, content checks, CSV, the HTTP client, media addresses, translations and portal config.<br>**Browser tests:** Playwright with axe (`npm run test:e2e`), in `e2e/`. They cover both apps: navigation, search, language, dark mode, forms and portal routes; console sign-in, lockout, section addresses, publish with Undo, and the approval workflow. They fail on console errors and on accessibility violations.<br>**CI:** `.github/workflows/frontend.yml` runs lint, type-check, unit tests, a live build (checked for demo code), a demo build and the browser tests. |
| 2 | P1 | No error boundary. | **Done** | `components/ErrorBoundary.tsx`, with fallbacks in `ErrorFallbacks.tsx`.<br>Each route has its own boundary, which resets on navigation; the header and footer stay usable. An app-level boundary covers both apps.<br>A failed code download after a new deploy offers a reload. Errors are reported through `utils/monitoring.ts` (#15). |
| 3 | P1 | ~~TypeScript strict mode is off~~; unused-variable checks are disabled; 11 `any`/`ts-ignore`. | **Done** | **Correction:** TypeScript 6 enables `strict` by default, so strict mode was already on. The review was wrong on that point.<br>`strict`, `noUnusedLocals` and `noUnusedParameters` are now set explicitly in `tsconfig.app.json`. No `any`, `@ts-ignore` or `@ts-expect-error` remain; scraped tables got a proper type (`ScrapedTable`). |
| 4 | P1 | Pages render only in the browser; unknown URLs return 200. | **Partly done** | **Done:** `scripts/prerender-meta.mjs` runs as part of `npm run build`. It writes each page's title, description, canonical address and link-preview tags into `dist/<route>/index.html` for 791 routes, so search engines and WhatsApp/Facebook previews see them without JavaScript. "Page not found" is marked `noindex` and has no canonical link, so it does not count as a soft 404.<br>**Remains:** full-content pre-rendering (body text in the HTML) and a real 404 status. Both need a server-side list of valid routes, or a switch to server rendering. Deferred until the backend serves content. |
| 5 | P1 | Runtime dependence on outside hosts: photos and files on mgims.ac.in, fonts from Google. | **Partly done** | **Done:** fonts are self-hosted (`@fontsource`, Latin and Devanagari) and Google Fonts was removed from both apps. `VITE_MEDIA_BASE_URL` rewrites old-site photo addresses (`utils/media.ts`). `scripts/download-media.mjs` copies the 1,150 photos the site shows, keeping their paths (tested on a sample).<br>**Remains:** someone has to run the copy, publish the folder and set the variable. Links to documents (notice PDFs and reports) still point to mgims.ac.in. They should move when the backend stores the notices and their files. |
| 6 | P1 | No CSP or security headers; the build produces source maps. | **Done** (frontend side) | **Server config:** `deploy/nginx/security-headers.conf` sets CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and `frame-ancestors`. `deploy/nginx/mgims.conf` adds both sites, the `/api` proxy, old-address redirects, caching, and returns 404 for `.map` requests. The CSP was tested against the real builds: 12 public pages and all 16 console sections, including a media upload, with 0 violations.<br>**Source maps:** they are moved out of `dist/` into `sourcemaps/` after each build, which is not deployed. A console build with `VITE_ADMIN_DEMO_PASSWORD` set prints a warning. The server team still has to apply the config. |
| 7 | P2 | Five separate request helpers with different errors and headers. | **Done** | `services/http.ts` is the only client. Every request sends `Accept-Language`, has a 30-second timeout and fails with `ApiError`.<br>A GET is retried once on a network error. A 401 on a staff request goes to one handler (`setUnauthorizedHandler`). `PATCH`/`PUT` send `null` for emptied fields.<br>`getJson`, `staffFetch` and the two `call()` helpers now use it; sign-in uses its raw `request()`. |
| 8 | P2 | No cache for server data. | **Done** (small cache) | The HTTP client de-duplicates identical public GETs that are in flight and caches them for 30 seconds. Staff requests are never cached, and any change (POST, PUT, PATCH, DELETE) clears the cache.<br>TanStack Query was not added. It can still be adopted when the live API shows a need (background refresh, pagination caching). |
| 9 | P2 | `AdminPage.tsx` was 1,151 lines; console sections were not in the URL. | **Done** | `AdminPage.tsx` is now 54 lines (sign-in or console). The rest is split into `AdminLogin`, `AdminConsole`, `AdminDashboard`, `NoticesPanel`, `NoticeDialog`, `InquiriesPanel`, `FacultyPanel` and `useNoticeLists`.<br>Each section has its own address (`sections.ts`, e.g. `/approvals`, `/inquiries`), so reload, Back and bookmarks work. An unknown section, or one the role may not open, goes to the dashboard. |
| 10 | P2 | Hard-coded hex colours; dark mode overrode ~24 classes. | **Done** | Colours are `@theme` tokens named by role: `ink`, `link`, `brand-navy`, `brand-blue`, the flag colours and others. 393 hex classes in 73 files were replaced; 0 remain.<br>Dark mode changes the token values instead of overriding classes. Colours were checked to be identical before and after, in light and dark mode. |
| 11 | P2 | All three languages load on every page; translation keys not type-checked. | **Partly done** | **Done:** keys are typed (`TranslationKey`, `TaskKey`), so a missing or misspelt key fails the type-check. This found and fixed 6 labels missing in the code.<br>**Deferred:** loading one language at a time. The three languages are about 37 KB compressed. That is worth doing, but it makes the first render wait for a language file; best done with the language switcher's next change. |
| 12 | P2 | Page content is plain text; editors can't add links, headings or emphasis. | **Deferred** | Needs agreement with the backend on a stored format (for example Markdown, or sanitised HTML) before the frontend renders it. |
| 13 | P2 | "Public code must not import console code" was only a convention. | **Done** | `.oxlintrc.json` has a `no-restricted-imports` rule for `@/admin` outside `src/admin/` and `admin/`. |
| 14 | P2 | Mixed API naming (snake_case on notices, camelCase elsewhere). | **Deferred** | Needs a decision with the backend developer. The mapping is already in one adapter per service, so the change will be local either way. |
| 15 | P3 | No error tracking or real-user metrics. | **Done** | `utils/monitoring.ts` sends errors (from the boundaries, window errors and unhandled rejections) and Core Web Vitals (LCP, CLS, FCP, TTFB) as small JSON beacons to `VITE_MONITORING_URL`. It works with any collector, without a vendor library. Reports never include form contents. The hidden source maps in `sourcemaps/` can be uploaded to the tracking service. |
| 16 | P3 | Settings are fixed at build time. | **Deferred** | One build per environment is acceptable for now. If one build must move from staging to production, load the API and portal addresses from a runtime `config.json`. |
| 17 | P3 | ~18 MB of generated demo data committed under `src/data`. | **Deferred** | It is still needed for demo mode and for `prerender-meta.mjs` and the sitemap. Move it out once the live API is the default and those scripts read from the API. |
| 18 | P3 | Version 0.0.0; very recent TypeScript and Vite. | **Done** | The version is now 1.0.0, and every dependency is pinned to an exact version, so updates are deliberate. |
| 19 | P3 | Portal screens (~3,000 lines) outside the website scope. | **Done** | Removed, together with their services, demo data, types, their translation files and 37 other keys, and the `/admissions/*` and `/payments/*` routes.<br>In their place are clean entry points: `config/portals.ts`, `pages/PortalGateway.tsx`, `hooks/usePortal.ts`, `components/navigation/PortalLink.tsx` and `VITE_*_PORTAL_URL`.<br>On the homepage, the "I am a…" cards for patients and students open their portals, with a Fee Portal button beside them. The lower grid keeps only general services (charges, tenders, careers). |

## Scorecard

| Area | Before | Now | Why it changed |
|---|---|---|---|
| Accessibility | 5 | 5 | Now checked automatically in CI |
| Documentation | 4.5 | 4.5 | |
| Performance | 4 | 4 | Self-hosted fonts, request cache; translations still load as one block |
| Architecture and modularity | 3.5 | 4.5 | Single HTTP client, split console with routes, import boundary, portal entry points |
| Code quality and type safety | 3 | 4.5 | Explicit strict mode, no `any`, typed translation keys, design tokens |
| Security (frontend side) | 3 | 4 | CSP and headers ready, source maps private, demo-password warning; the server must apply them |
| SEO and discoverability | 3 | 4 | Per-page head tags in HTML, noindex on not-found; no full-content pre-rendering yet |
| Maintainability | 3 | 4 | Smaller modules, tokens, tests |
| Tests and CI | 1.5 | 4 | Unit and browser tests with axe, CI workflow |

## What is left, in order

1. **Before go-live (server team):**
   - Apply `deploy/nginx/`.
   - Run `scripts/download-media.mjs`, publish the folder and set `VITE_MEDIA_BASE_URL`.
   - Set `VITE_MONITORING_URL`.
   - Keep `VITE_ADMIN_DEMO_PASSWORD` empty.
2. **With the backend developer:**
   - Agree the API naming style (#14) and the rich-text format (#12).
   - Move document files off the old site (#5).
3. **Later:**
   - Load one language at a time (#11).
   - Real 404 status codes and full-content pre-rendering (#4).
   - A runtime config file (#16).
   - Move demo data out of `src/` (#17).
4. **Small:** 4 lint warnings from before this work remain; `npm run lint` lists them. They are harmless:
   - Three set state inside an effect: search modal, search page, departments filter.
   - One is a fast-refresh note on `AccessibilityContext`.
   
   Lint has no errors.

## How to check

```bash
npm run lint && npx tsc -b && npm test
VITE_ADMIN_DEMO_PASSWORD=demo123 npm run build && npm run test:e2e
```
