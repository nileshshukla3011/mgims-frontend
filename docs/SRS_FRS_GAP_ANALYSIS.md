# SRS / FRS frontend gap analysis — MGIMS website

**Compared:** the Functional Requirements Specification (`FRS_MGIMS_Website.pdf`) and the Software Requirements Specification (`SRS_MGIMS Website.pdf`), both RailTel, June 2026, against this frontend (the public website and the admin console in `mgims-frontend/`).
**Date:** 14 October 2026.
**Companion documents:** [`FRONTEND_INTEGRATION_CHECKLIST.md`](FRONTEND_INTEGRATION_CHECKLIST.md) (what to check when the backend is connected) and [`BACKEND_INTEGRATION_GUIDE.md`](BACKEND_INTEGRATION_GUIDE.md) (endpoints and payloads).

## How to read this

- **Scope is the frontend.** "Implemented" means the screens, client-side validation, loading, empty and error states, and API calls exist and were tested in demo mode. The requirement is met end-to-end only when the backend supplies the listed endpoints and the integrations behind them (HIMS, EMS, LIS, RIS-PACS, ABDM, Pine Labs, e-RaktKosh, NMC, SMS and email). The backend must also enforce every rule the console shows. The console's role checks only decide what is displayed.
- **Status** is shown as *before → now*. "Before" is the frontend as found on 14 October 2026, before this work.
  - **Implemented:** the UI flow is complete.
  - **Partial:** something is still missing, and the notes say what.
  - **Missing:** there is no UI.
  - **Backend:** nothing to build in the frontend. The notes say what the frontend assumes.
- **API paths** are relative to `VITE_API_BASE_URL` (default `/api`). Payload types are in `src/types/portal.ts` and `src/types/index.ts`. The [backend guide](BACKEND_INTEGRATION_GUIDE.md) §§ 3–4 lists them in full.
- **Website scope.** This frontend's scope is the public website and its admin console. The patient portal, student portal, online payments and online admissions are marked **[portal]** below. Their screens exist in the code (`src/portal/`, `src/pages/payments/`, `src/pages/admissions/`), but they are outside the website scope. Whether they are kept is still to be decided; until then they are left as they are.
- **Demo mode** (`VITE_USE_MOCK_API=true`) uses scraped official content for public pages. The portals use clearly fictional patients and students. Live feeds that do not exist yet (blood stock, NMC updates, usage statistics) show an empty state, never invented figures.

## Summary

> **Update, 15 October 2026: portal screens removed.** The patient, student, payment and admission screens (the 20 [portal] requirements) were removed from the code, because those portals are built by other teams.
>
> The website keeps only their entry points:
> - `/patient-portal`, `/student-portal` and `/fee-portal`, set in `src/config/portals.ts`.
> - Each address is configured with `VITE_*_PORTAL_URL`.
> - The homepage "I am a…" cards and the Fee Portal button link to them.
>
> In the [portal] rows below, "Implemented" describes the removed screens: those requirements are now for the portal teams. The website-scope figures are unchanged.

The FRS has 67 numbered requirements.

| Area (FRS section) | Requirements | Before: implemented / partial / missing / backend | Now: implemented / partial / missing / backend |
|---|---|---|---|
| Information architecture (§5) | 6 | 2 / 3 / 1 / 0 | 6 / 0 / 0 / 0 |
| CMS and governance (§6) | 7 | 0 / 3 / 4 / 0 | 6 / 1 / 0 / 0 |
| Compliance and accessibility (§7) | 6 | 2 / 2 / 2 / 0 | 4 / 2 / 0 / 0 |
| Patient portal (§8) | 8 | 0 / 0 / 7 / 1 | 7 / 0 / 0 / 1 |
| Academic and student portal (§9) | 6 | 0 / 1 / 5 / 0 | 6 / 0 / 0 / 0 |
| Dynamic content (§10) | 6 | 0 / 2 / 4 / 0 | 5 / 1 / 0 / 0 |
| Payments (§11) | 6 | 0 / 0 / 6 / 0 | 5 / 0 / 0 / 1 |
| Multilingual and search (§12) | 5 | 1 / 4 / 0 / 0 | 4 / 1 / 0 / 0 |
| Engagement and legacy (§13) | 5 | 1 / 3 / 1 / 0 | 5 / 0 / 0 / 0 |
| Reporting (§16) | 5 | 0 / 0 / 5 / 0 | 5 / 0 / 0 / 0 |
| Security (§17) | 7 | 1 / 3 / 2 / 1 | 6 / 0 / 0 / 1 |
| **Total** | **67** | **7 / 21 / 37 / 2** | **59 / 5 / 0 / 3** |

**Website scope only** (without the 20 [portal] requirements: WEB-PAT-1 to 8, WEB-ACD-1 to 5, WEB-PAY-1 to 6 and WEB-CMP-3): 47 requirements, of which 41 are implemented, 5 partial and 1 backend (WEB-SEC-3). The 20 [portal] requirements: 18 implemented, 2 backend, at the time; their screens have since been removed (see the update above).

WEB-PAY-2 counted as "missing" before and as "backend" now: it concerns payment terminals, and the frontend only follows the checkout address the backend returns.

**The 5 that remain partial** depend on a decision or on content from MGIMS, not on frontend code. They are WEB-CMS-1 (CMS platform), WEB-CMP-1 and WEB-CMP-2 (policy texts and Hindi content), WEB-DYN-4 (which NACO data to show) and WEB-MLS-1 (Hindi page content). See [Decisions and content needed](#decisions-and-content-needed).

FRS §14 (notifications), the SRS-only items and the FRS information-architecture diagram are listed separately below.

## Decisions and content needed

| # | Topic | Conflict or gap | Current build | Needed from |
|---|---|---|---|---|
| D1 | CMS platform (WEB-CMS-1, SRS 4.3.1) | Both documents name Joomla or WordPress. | A React admin console on the project's REST API, with editing by form, approval workflow, versions, media library and content checks. The frontend developer chose not to use Joomla or WordPress (15 October 2026). | MGIMS / RailTel: accept the console in place of Joomla or WordPress. |
| D2 | Design standard (WEB-CMP-4 vs SRS 4.15.2) | The FRS makes UX4G mandatory. The SRS exempts design ("shall not be bounded by … UX4G"). | Follows UX4G: axe-clean, 44 px targets, dark and high-contrast modes. | MGIMS: which rule applies. A bespoke visual identity (SRS 4.15.1) needs a design brief. |
| D3 | Who approves content (WEB-CMS-3/4, SRS 4.14.2) | The FRS approver is the head of department. The SRS approver is the Dean or IT head. | Both are supported. `department_approver` approves for one department; `super_admin` approves for all. Contributors (`department_admin`) only submit. | MGIMS: who gets which role. Assigning no departmental approvers gives the SRS model. |
| D4 | Appointments (SRS 4.13 is "Under Review") | — | Part of the Patient Portal, built by another team. The website links to `/patient-portal`. | MGIMS / RailTel and the portal team |
| D5 | Hindi and Marathi wording | The interface labels for the new services were translated during development, not by MGIMS. | About 230 Hindi/Marathi label pairs in `src/i18n/services/` (after the portal screens were removed). | MGIMS: review by a native speaker. |
| D6 | Hindi page content (WEB-MLS-1) | Page text is English only. | The frontend sends `Accept-Language`, so the backend can return Hindi text. The console has no fields for entering Hindi versions. | MGIMS: translations. Backend: how translations are stored. Then the console needs per-language fields (see "Remaining frontend work"). |
| D7 | Website policies (WEB-CMP-1/2) | Privacy, terms, copyright, archival, monitoring, contingency and security policy texts are not published. | 12 policy pages name their purpose and say the official text is awaited. | MGIMS: policy texts. |
| D8 | NACO programme data (WEB-DYN-4) | The data to show is not defined. | Blood stock only (e-RaktKosh). | MGIMS: which NACO data, from which feed. |
| D9 | Persona landing pages (WEB-IA-3) | The links on each persona page were chosen during development. | `src/config/personas.ts` | MGIMS: confirm the selection. |
| D10 | FRS diagram items (p. 8) without a requirement ID | Academic calendar, prospectus, regulations, fee information, patient messaging, student timetable, enrolment and forums. | Not built (see the last table). | MGIMS: content and scope. |

## Gap analysis matrix

### 1. Information architecture (FRS §5; SRS 4.1, 4.5, 4.7)

| Feature ID | Requirement name | UI flow / component | Status | Notes / discrepancies | API needed |
|---|---|---|---|---|---|
| WEB-IA-1 | MGIMS as primary entity, Kasturba Hospital a demarcated sub-section | Header brand; `/hospital/*` section with its own menu; `HospitalPage` | Implemented → Implemented | — | Existing `GET /hospital`, `/hospital/:slug` |
| WEB-IA-2 | Homogeneous header, footer and navigation everywhere | `Layout`, `SectionedPage`; portals use `PortalShell` inside the same layout | Implemented → Implemented | All new pages (portals, payments, admissions, feedback, alumni) inherit the site chrome. The admin console is a separate app by design. | — |
| WEB-IA-3 | Persona-based landing zones | `/patients`, `/students`, `/faculty-staff`, `/visitors`, `/regulators` (`PersonaPage`, `src/config/personas.ts`); `PersonaSelector` on the home page | Missing → Implemented | Each page lists tasks and services and the latest notices of a relevant category. The selection needs MGIMS confirmation (D9). | `GET /notices?category=` (existing) |
| WEB-IA-4 | Template governance: departments cannot override brand, accessibility or security baseline | Console editors are structured forms (no HTML, CSS or layout); `contentChecks.ts` blocks pasted markup and placeholders; media need alt text; only super admins change structure | Partial → Implemented | React escapes all text, so editors cannot inject markup. The backend must sanitise and re-check submissions as well. | `POST /content-changes` (checks travel with the change as `issues`) |
| WEB-IA-5 | Site-wide search with relevance ranking and facets | `SearchPage` (`/search`), Ctrl+K `SearchModal`; facets by type: pages, departments, faculty, notices, research | Partial → Implemented | Research records (theses, publications, projects) are now indexed. Staff-list rows and tariff items are found through their pages, not one by one. | `GET /search?q=` returns `{ departments, faculty, notices, pages, research }` |
| WEB-IA-6 | Machine-readable sitemap and metadata | `public/sitemap.xml` (794 URLs), `robots.txt`; HTML sitemap `/sitemap`; per page: title, description, canonical link, Open Graph tags (`usePageMeta`); organisation JSON-LD in `index.html` | Partial → Implemented | Link previews on social media read only `index.html` (they do not run scripts), so they show the site-wide title and image. Per-page previews need pre-rendering at the server (see the checklist). | — |

### 2. CMS and decentralised governance (FRS §6; SRS 4.3.1, 4.6, 4.14)

| Feature ID | Requirement name | UI flow / component | Status | Notes / discrepancies | API needed |
|---|---|---|---|---|---|
| WEB-CMS-1 | CMS (Joomla or WordPress) for non-technical staff | Admin console (`admin/`, `src/admin/`): form-based editing of department profiles, faculty, staff, research, notices and department news; media library | Partial → Partial | **Discrepancy (D1):** not Joomla or WordPress. Editing needs no code, but there is no rich-text editor. Paragraphs are plain text and lists are structured fields. | All console endpoints |
| WEB-CMS-2 | Departments upload and update their own content, subject to approval | Department roles see only their department: profile, faculty, staff, research, news, media. Each edit is saved as a draft or submitted (`workflow.save`). | Partial → Implemented | Before this work, department edits were published immediately. | `POST /content-changes` with `{ entity, action, entityId, departmentId, summary, before, after, issues, submit }` |
| WEB-CMS-3 | Granular RBAC by staff class and department | `src/admin/access.ts`: `super_admin`, `department_approver`, `department_admin`; sections and records filtered by role and department | Partial → Implemented | The three tiers of FRS §6 (D3). Display rules only; the server must enforce them. | `/auth/login`, `/auth/me` return `role` and `departmentId` |
| WEB-CMS-4 | Maker-checker workflow Draft → Submitted → Approved → Published with version history | `ApprovalsPanel`: approvers approve (now or scheduled) or reject with a reason; authors submit, withdraw and see decisions; field-by-field change view (`ChangeViews.tsx`) | Missing → Implemented | — | `GET /content-changes?status=&departmentId=&author=`, `POST /content-changes/:id/submit|withdraw|approve|reject` |
| WEB-CMS-5 | Immutable audit trail with author, approver, time and version; rollback | Version list and "Roll back" in Approvals; `AuditLogPanel` with filters and CSV | Missing → Implemented | Immutability is a server property: the console can only read the ledger. | `GET /content-changes?entity=&entityId=&status=Published`, `POST /content-changes/:id/rollback`, `GET /audit-log` |
| WEB-CMS-6 | Scheduled publishing and automatic expiry | Approve with "Publish later"; notice dialog "Publish on" and "Remove from the website on"; public lists hide notices outside their window (`isNoticeLive`); an expired notice keeps its address with a note | Missing → Implemented | The backend publishes on schedule and leaves expired notices out of public lists. The frontend filter is a second guard. | `publish_at` and `expires_at` (ISO date-times) on notices; `GET /notices?include=unpublished` for the console |
| WEB-CMS-7 | Reusable media library | `MediaLibrary`: upload (type and size checked), required image description, file-name-as-description refused, department scope, in-use files cannot be deleted | Missing → Implemented | The server must re-check file type and size and scan uploads. | `GET/POST /admin/media`, `PATCH/DELETE /admin/media/:id` (409 when in use) |

### 3. Government compliance and accessibility (FRS §7; SRS 4.2, 4.3.3, 5.3)

| Feature ID | Requirement name | UI flow / component | Status | Notes / discrepancies | API needed |
|---|---|---|---|---|---|
| WEB-CMP-1 | GIGW 3.0 | Help (`/help`), HTML sitemap, feedback page, accessibility statement, custom 404, 12 policy pages in the footer, last-updated date, external-link notice, legacy-URL redirects | Partial → Partial | The frontend items are done. Still outstanding: policy texts (D7), Hindi content (D6) and a formal GIGW/STQC audit. | `GET /site-info` (existing) |
| WEB-CMP-2 | DPDP Act: lawful, purpose-bound consent | Consent checkbox with purpose text on every form that collects personal data (inquiry, registration, admissions, newsletter, alumni, feedback email); consent module (WEB-CMP-3); staff lists without caste, gender or employee number; masked mobile numbers | Partial → Partial | The Privacy Policy text is not published (D7). Encryption at rest is the backend's (WEB-SEC-3). | `consent: true` in the request bodies listed in the backend guide |
| WEB-CMP-3 [portal] | Consent Management Module for patients | `ConsentPage` (`/patient-portal/consent`): one card per purpose, with the data it uses and a grant or withdraw switch; history; caregivers (delegated access) with scopes and expiry | Missing → Implemented | Withdrawing takes effect immediately: affected reports show as hidden. | `GET /patient/consents`, `PUT /patient/consents/:categoryId`, `GET /patient/consents/history`, `GET/POST /patient/delegates`, `DELETE /patient/delegates/:id` |
| WEB-CMP-4 | UX4G design guidelines | Whole site | Implemented → Implemented | **Discrepancy (D2)** with SRS 4.15.2. | — |
| WEB-CMP-5 | Screen reader, keyboard, high contrast, resizable text | Accessibility bar and panel, dark and high-contrast modes, text size, reading aids, read-aloud | Implemented → Implemented | axe-core (WCAG 2.1 A/AA) found 0 violations on every public route at 1280 and 375 px, and on the portal and console screens tested (19 portal states; console sign-in, sections and dialogs). See the handover report for the runs. | — |
| WEB-CMP-6 | Accessibility audit before publication | Content checks run in every editor and are shown to the approver (errors block submission); "Accessibility checks" section | Missing → Implemented | Demo mode checks the text of departments, faculty and notices. Live mode also shows the backend's site-wide axe report. | `GET /admin/accessibility/report` → `{ generatedAt, pages: [{ url, title, violations: [{ id, impact, description, nodes: [{ target, html }], helpUrl }] }] }` |

### 4. Patient lifecycle and self-service portal (FRS §8; SRS 4.13) [portal]

All pages are under `/patient-portal` and need a signed-in session (`PatientSessionProvider`). The middleware must check that the signed-in identity may act for the `uhid` in each request (FRS §8).

| Feature ID | Requirement name | UI flow / component | Status | Notes / discrepancies | API needed |
|---|---|---|---|---|---|
| WEB-PAT-1 | ABHA-linked self-registration; appointment scheduling into the HIMS queue | Sign-in with mobile, ABHA number, ABHA address or UHID plus OTP (`PatientSignIn`, `OtpEntry`); registration with OTP, optional ABHA and consent (`PatientRegister`); booking wizard: department → doctor → date and slot → visit details → confirm (`BookAppointment`); list, cancel with reason, calendar file (.ics), live queue position (`AppointmentsPage`) | Missing → Implemented | ABHA verification through ABDM is the backend's. A booking carries the UHID, the slot, the visit type and an optional reason; nothing else. | `POST /patient/auth/otp|verify|logout`, `GET /patient/me`, `POST /patient/register`, `GET /appointments/departments|doctors|slots`, `GET/POST /patient/appointments`, `POST /patient/appointments/:id/cancel`, `GET /patient/appointments/:id/queue` |
| WEB-PAT-2 | View and download lab and radiology reports | `ReportsPage`: laboratory and radiology tabs, LOINC codes, pending and ready states, PDF download, "hidden by your consent choice" | Missing → Implemented | — | `GET /patient/reports?uhid=`, `GET /patient/reports/:id/file` (PDF) |
| WEB-PAT-3 | Billing history and outstanding charges; pay online | `BillsPage`: due and paid bills, select and pay (WEB-PAY flow), receipts; `/patient-portal/payments` history | Missing → Implemented | — | `GET /patient/bills?uhid=` and the payment endpoints |
| WEB-PAT-4 | Visit and discharge summaries; prescriptions for re-ordering | `RecordsPage`: summaries with ICD-10 diagnoses and PDF download; prescriptions; refill request for refillable items, with status | Missing → Implemented | — | `GET /patient/documents`, `GET /patient/documents/:id/file`, `GET /patient/prescriptions`, `POST /patient/prescriptions/:id/refills`, `GET /patient/refills` |
| WEB-PAT-5 | Certificate requests with status tracking to issuance | `CertificatesPage`: certificate types with the fields each needs (from the backend), request, status timeline, download when issued | Missing → Implemented | Birth and death certificates are offered only if the backend lists them. | `GET /patient/certificates/types`, `GET/POST /patient/certificates`, `GET /patient/certificates/:id/file` |
| WEB-PAT-6 | Update demographics through HIMS validation | `ProfilePage`: profile view; change request (email, address, alternate phone, emergency contact, name, date of birth) with a reason; request status | Missing → Implemented | Changes are requests, never direct writes, as the FRS requires. | `GET /patient/profile`, `GET/POST /patient/profile/change-requests` |
| WEB-PAT-7 | Configurable digital intake forms imported into the EMR on verification | `FormsPage`: forms defined by the backend (text, number, date, select, radio, checkbox, yes/no, with limits); save draft, submit, verified state | Missing → Implemented | The form definitions come from the backend, so the hospital can change them without a frontend release. | `GET /patient/intake-forms`, `PUT /patient/intake-forms/:id` `{ uhid, answers, submit }` |
| WEB-PAT-8 | Backend support for self-service kiosks | — | Backend → Backend | No kiosk interface was built. A kiosk could open the portal pages in kiosk mode; the idle sign-out (10 min, configurable) suits shared screens. | — |

### 5. Academic and student lifecycle portal (FRS §9; SRS 4.12)

| Feature ID | Requirement name | UI flow / component | Status | Notes / discrepancies | API needed |
|---|---|---|---|---|---|
| WEB-ACD-1 [portal] | End-to-end admission workflow, synchronised with EMS | `/admissions/apply`: programme, applicant, entrance exam, education, documents (type and size checked per requirement), mobile OTP, declaration; `/admissions/track` by application number and date of birth, with status timeline, provisional and final admission states and re-upload when a query is raised | Missing → Implemented | Programme list, required documents and dates come from the backend (EMS). | `GET /admissions/programmes`, `POST /admissions/otp`, `POST /admissions/applications` (multipart), `GET /admissions/applications/:no?dob=`, `POST /admissions/applications/:no/documents` |
| WEB-ACD-2 [portal] | Secure results; scheduled public release | Student portal results with marksheet PDF; scheduled results stay hidden until release; public result notices at `/academics/results` | Missing → Implemented | The backend must not send a scheduled result before its release time. The frontend also hides it. | `GET /student/results`, `GET /student/results/:id/marksheet`, `GET /results/public` |
| WEB-ACD-3 [portal] | Scholarship application and status (EMS) | `/student-portal/scholarships`: schemes with eligibility and deadlines, application with required documents, status history | Missing → Implemented | — | `GET /student/scholarships/schemes`, `GET/POST /student/scholarships/applications` (multipart) |
| WEB-ACD-4 [portal] | Academic records, fee statements, pay fees | `/student-portal/record` (term-wise record, transcript PDF); `/student-portal/fees` (dues by segment, statement, pay, history) | Missing → Implemented | — | `GET /student/academic-record`, `GET /student/academic-record/file`, `GET /student/dues`, `GET /student/fee-statement`, payment endpoints |
| WEB-ACD-5 [portal] | Knowledge Portal / College Resource Centre for signed-in members | `/student-portal/resources`: curated resources by category with access labels (open, campus network, sign-in) | Missing → Implemented | The demo list links only to existing MGIMS pages and to UpToDate, which the official library page says MGIMS subscribes to. The real list should come from the library. | `GET /student/resources` |
| WEB-ACD-6 | Alumni engagement with linked profiles and outreach | `/alumni`: directory of alumni who opted in, search, registration with consent and a "show me in the directory" choice; existing alumni text under Student life | Partial → Implemented | — | `GET /alumni?q=`, `POST /alumni/registrations` |

Student sign-in uses the Institute Roll Number plus an OTP sent to the mobile number held in EMS (`POST /student/auth/otp|verify|logout`, `GET /student/me`).

### 6. Dynamic content engine and HIS linkages (FRS §10; SRS 4.4, 4.8)

| Feature ID | Requirement name | UI flow / component | Status | Notes / discrepancies | API needed |
|---|---|---|---|---|---|
| WEB-DYN-1 | Scheduled pull of NMC and regulatory updates | `RegulatoryUpdates` on Accreditations › NMC disclosures, with source and freshness | Missing → Implemented | Demo mode shows an empty state; nothing is invented. | `GET /regulatory-updates?source=NMC` → `RegulatoryUpdate[]` |
| WEB-DYN-2 | HIS-linked student, faculty, patient-portal and alumni content | Faculty and staff from the API; student and patient data through the portals; alumni directory | Partial → Implemented | "Real time" depends on the backend's sync (data sources, WEB-DYN-6). | Existing `/faculty`, `/staff`; portal and alumni endpoints |
| WEB-DYN-3 | Notices placed automatically on department and home pages | Notices tagged with `departmentIds` appear in the department's Notices tab (`DepartmentNotices`) and on the home page board and ticker; the console's notice and department-news forms set the tags | Partial → Implemented | Demo mode also matches "Department of …" in the notice text, because scraped notices have no tags. | `GET /notices?departmentId=`; `departmentIds` on notices |
| WEB-DYN-4 | Blood availability and NACO programme data (e-RaktKosh, NACO) | `BloodAvailability` on Hospital › Blood bank: stock by group and component, sync time, the blood bank's telephone extension | Missing → Partial | Blood stock is done. NACO programme data is not defined (D8). Without a feed, the page shows the blood bank's number instead of figures. | `GET /blood-availability` → `BloodAvailability`, or `null` when not connected |
| WEB-DYN-5 | Last-known-good cache with freshness indicator | `withLastKnownGood` (`src/services/http.ts`) and `FreshnessBadge`: if a feed fails, the last copy is shown with its age and a "may be out of date" label | Missing → Implemented | Used for blood stock, regulatory updates and hospital statistics. The backend should send `updatedAt` (sync time). | — |
| WEB-DYN-6 | Configurable refresh interval per data source | Console › Data sources (`DataSourcesPanel`): interval, "Sync now", last status and message, per source | Missing → Implemented | Super admins only. Demo mode records a sync as "not connected". | `GET /admin/data-sources`, `PATCH /admin/data-sources/:id` `{ refreshMinutes }`, `POST /admin/data-sources/:id/sync` |

### 7. Payment gateway (FRS §11; SRS 4.3.2, 4.12) [portal]

| Feature ID | Requirement name | UI flow / component | Status | Notes / discrepancies | API needed |
|---|---|---|---|---|---|
| WEB-PAY-1 | Pine Labs gateway for hospital charges, student fees, insurance premiums | `/payments` and `/payments/:purpose`: hospital bill, academic fee, hostel, workshop, conference, insurance premium. Look up dues by identifier, choose dues, confirm, go to the gateway's hosted checkout | Missing → Implemented | The order is created by the backend, which returns `redirectUrl`. | `POST /payments/dues/lookup` `{ purpose, identifier }`, `POST /payments/orders` |
| WEB-PAY-2 | Dual-endpoint configuration for terminals | — | Missing → Backend | Server and terminal configuration. The frontend follows whatever `redirectUrl` it is given. | — |
| WEB-PAY-3 | Unique reference, instant receipt, reconciled posting | `/payments/status/:orderId`: the status is re-checked until final; reference shown; receipt PDF | Missing → Implemented | Posting to Accounts is the backend's. | `GET /payments/orders/:id`, `GET /payments/orders/:id/receipt` |
| WEB-PAY-4 | Deterministic handling of failed, pending and duplicate payments; refunds | `Idempotency-Key` header per checkout attempt (a retry or double click never pays twice); pending, failed (with reason and retry), refund-initiated and refunded states | Missing → Implemented | Reconciliation and refunds are the backend's. | `Idempotency-Key` on `POST /payments/orders`; statuses `Created`, `Pending`, `Success`, `Failed`, `Refund initiated`, `Refunded` |
| WEB-PAY-5 | TLS 1.3; no card data on the web tier | No card or UPI fields on the site; hosted checkout only | Missing → Implemented | TLS is server configuration. | — |
| WEB-PAY-6 | Downloadable transaction history for patients and students | `TransactionsTable` in both portals: receipts and a CSV download | Missing → Implemented | — | `GET /patient/payments?id=`, `GET /student/payments?id=` |

### 8. Multilingual intelligence and search (FRS §12; SRS 4.3.4, 4.11)

| Feature ID | Requirement name | UI flow / component | Status | Notes / discrepancies | API needed |
|---|---|---|---|---|---|
| WEB-MLS-1 | Hindi and English across patient- and public-facing content | Menus, labels, forms, messages and all new services in English, Hindi and Marathi (`src/i18n`); `Accept-Language` on every request | Partial → Partial | Page content (scraped official text) is English. Translations need MGIMS review (D5, D6). | Content in the requested language where available |
| WEB-MLS-2 | Ranked search with auto-suggest and facets | Suggestions while typing (ARIA combobox, keyboard), ranked results, type facets | Partial → Implemented | — | `GET /search/suggest?q=` → up to 8 `{ title, url, type }` |
| WEB-MLS-3 | Language persists; applies to navigation, forms and notifications | Saved choice (browser storage) applied to menus, forms and messages; the patient's notification language is in notification preferences | Partial → Implemented | — | `language` in `NotificationPreferences` |
| WEB-MLS-4 | Search respects access control | Only public content is indexed; portal data never enters search | Implemented → Implemented | The backend search must keep consent-bound data out. | — |
| WEB-MLS-5 | Voice-assisted or simplified navigation | Voice search; read-aloud on section pages (`ReadAloud`, browser speech); reading aids; persona pages as simple entry points | Partial → Implemented | Read-aloud uses the browser's voices. Hindi speech depends on the device. | — |

### 9. Engagement, feedback and legacy continuity (FRS §13; SRS 4.9)

| Feature ID | Requirement name | UI flow / component | Status | Notes / discrepancies | API needed |
|---|---|---|---|---|---|
| WEB-ENG-1 | Feedback, surveys and newsletters | `/feedback` (rating, what the visitor looked for, found it or not, optional department); open surveys (`/feedback/surveys/:id`); newsletter sign-up in the footer; existing page-feedback widget and inquiry form | Partial → Implemented | Console: survey builder, open and close, results. | `POST /feedback/site`, `GET /surveys?status=open`, `GET /surveys/:id`, `POST /surveys/:id/responses`, newsletter endpoints |
| WEB-ENG-2 | Migrate all legacy content without loss or broken links | 984 pages and 672 notices migrated; open items in `CONTENT_REVIEW.md` | Implemented → Implemented | — | Seed data in `extracted_data/` |
| WEB-ENG-3 | Redirects from legacy URLs | 926 old URLs mapped to new ones: `src/data/legacy_redirects.json` (in-app) and `docs/legacy-redirects.nginx.conf` (301s at the server) | Partial → Implemented | Search engines need the server's 301s. Install the nginx map at go-live. | — |
| WEB-ENG-4 | Feedback and surveys routed to departments; governance dashboard | Feedback and surveys carry `departmentId`; console › Feedback lists items by department with a status (new, seen, actioned); Reports shows trends | Partial → Implemented | — | `GET /admin/feedback?departmentId=`, `PATCH /admin/feedback/:id` `{ status }`, `GET /admin/feedback/summary` |
| WEB-ENG-5 | Segmented newsletter; DPDP-compliant unsubscribe | Segments and language at sign-up; double opt-in; manage or unsubscribe at `/newsletter/manage?token=`, where unsubscribing erases the address | Missing → Implemented | Sending the newsletter is the backend's. | `GET /newsletter/segments`, `POST /newsletter/subscriptions`, `GET/PATCH/DELETE /newsletter/subscriptions/:token` |

### 10. Notification and asynchronous trigger engine (FRS §14, §15.3)

The FRS lists trigger events without IDs. Sending SMS, email and push is the backend's; the frontend sets preferences and shows what was sent. The first five events concern the [portal] screens; the last one (content approval) concerns the console.

| Event | UI flow / component | Status | Notes | API needed |
|---|---|---|---|---|
| Appointment confirmation and reminder | Confirmation screen and calendar file; patient preferences per channel | Missing → Implemented (UI) | Reminder timing is the backend's. | `GET/PUT /patient/notification-preferences` |
| Report or result available | Patient preferences ("report"); student results page | Missing → Partial | Students have no notification preferences page yet. | Same; a student equivalent (see "Remaining frontend work") |
| Payment confirmation | Status page and receipt; preferences ("payment") | Missing → Implemented (UI) | — | — |
| Premium or fee expiry reminder | Preferences ("fee") for patients; due dates in student fees | Missing → Partial | No student preference page (as above). | — |
| Consent change confirmation | Preferences ("consent"); consent history | Missing → Implemented (UI) | — | — |
| Content approval or publication | Approvals count in the console menu and on the dashboard | Missing → Partial | Shown in the console only. Email to authors and approvers is the backend's. | — |

### 11. Reporting, analytics and governance dashboard (FRS §16)

| Feature ID | Requirement name | UI flow / component | Status | Notes / discrepancies | API needed |
|---|---|---|---|---|---|
| WEB-RPT-1 | Publication activity, pending approvals, authoring per department | `GovernanceDashboard` (super admin): published, pending, rejected, scheduled; authoring by department; link to Approvals | Missing → Implemented | Built from the workflow records. | `GET /content-changes` |
| WEB-RPT-2 | Service-uptake analytics with trends | Reports › Service uptake: appointments, report downloads, payments and certificate requests per day (bar chart and table) | Missing → Implemented | Demo mode has no usage data. A clearly labelled "sample figures" button shows the layout only. | `GET /admin/analytics/service-uptake?from=&to=` → `UptakePoint[]` |
| WEB-RPT-3 | Accessibility conformance report with drill-down | Accessibility checks: pages and content with issues, rule, impact, the element's selector and HTML, how to fix | Missing → Implemented | — | `GET /admin/accessibility/report` |
| WEB-RPT-4 | Feedback and survey analytics; departmental red flags | Reports › Feedback: responses and average rating by department and week; "Needs attention" when a department has at least 5 responses averaging under 3 | Missing → Implemented | The threshold is in `Dashboards.tsx`. | `GET /admin/feedback/summary?from=&to=` |
| WEB-RPT-5 | Exportable, access-controlled reports; exports in the audit ledger | CSV exports: citizen inquiries, staff lists, research records, content approvals, audit log, accessibility issues, newsletter subscribers; each export is recorded in the audit log | Missing → Implemented | Reports are for super admins only. Live exports are built by the server. | `GET /admin/exports/:report.csv`, `POST /audit-log/events` for exports built in the browser |

### 12. Security, RBAC and data protection (FRS §17; SRS 5.2)

| Feature ID | Requirement name | UI flow / component | Status | Notes / discrepancies | API needed |
|---|---|---|---|---|---|
| WEB-SEC-1 | MFA for all administrative access | Two-step console sign-in: password, then a one-time code (SMS, email or authenticator), with resend and expiry | Missing → Implemented | The backend must refuse the session until the second factor passes. | `POST /auth/login` → 200, or 202 `{ mfaRequired, challengeId, channel, destination }`; `POST /auth/mfa/verify`, `POST /auth/mfa/resend` |
| WEB-SEC-2 | Granular RBAC across authoring, approval and services | Three console roles (WEB-CMS-3); department-scoped records; portal data per signed-in identity and delegate scope | Partial → Implemented | The server enforces it; it answers 403 otherwise. Active Directory linkage (SRS 4.14.3) is the backend's. | Role in `/auth/me`; 403 handling |
| WEB-SEC-3 | AES-256 at rest, TLS 1.3 in transit | — | Backend → Backend | Session cookies must be `HttpOnly; Secure; SameSite`. | — |
| WEB-SEC-4 | Middleware layer; no direct database exposure | All data through the REST API (`apiFetch`, `apiService`) | Implemented → Implemented | By design. | — |
| WEB-SEC-5 | Immutable, time-stamped, attributed audit ledger of administrative and consent actions | Console › Audit log (filters by user, action and date; CSV); patient consent history | Missing → Implemented | The server writes the ledger for every staff request. The console posts only events the server cannot see. | `GET /audit-log?actor=&action=&from=&to=`, `POST /audit-log/events` |
| WEB-SEC-6 | Purpose limitation and data minimisation | Consent per purpose; minimal form fields; masked identifiers; no personal staff data; delegate scopes | Partial → Implemented | — | — |
| WEB-SEC-7 | Session management, brute-force protection, input validation | Idle sign-out with a one-minute warning (patient 10 min, student and console 15 min, configurable); lockout and retry-after messages (423, 429); messages for wrong, expired and too many one-time codes; validation on every form; file type and size checks; no raw HTML rendering | Partial → Implemented | Attempt limits, CSRF protection, rate limits and server-side validation are the backend's. There is no CAPTCHA widget; add one if the backend requires it. | `Retry-After` on 423 and 429; 401 for an expired session |

### 13. Non-functional, deployment and hosting (FRS §18–19; SRS 5.1, 5.4)

| Item | Frontend part | Status | Notes |
|---|---|---|---|
| Performance on low bandwidth | Routes and data load on demand; demo data and code are left out of the live build (0 demo chunks) | Implemented (frontend part) | Not measured with Lighthouse or on a throttled network. Recommended before go-live. |
| Sub-second billing checks (SRS 5.1) | Loading indicators | Backend | Server response time. |
| 99.5 % uptime, DR, Docker, PostgreSQL HA | Static files (`dist/`, `dist-admin/`) for any web server | Backend | No Dockerfile is included for the frontend. A small nginx image can serve both builds plus the legacy-redirect map. |
| Clinical coding (ICD-10/11, LOINC) | ICD-10 codes on summaries, LOINC codes on reports (display only) | Implemented (display) | The codes come from the EMR, LIS and RIS. |

### 14. SRS-only items

| SRS § | Item | UI flow / component | Status | Notes |
|---|---|---|---|---|
| 4.1 | MGIMS foundation information architecture | Site menus and sections | Implemented → Implemented | Campus facilities are not a separate section (Wi-Fi is under Library). Disclosures are under Accreditations. |
| 4.4 | Dynamic content engine (academic updates, research output, operational transparency) | Notices, research records, hospital statistics | Partial → Implemented | Home-page hospital figures now come from `GET /hospital/statistics` (demo: the official "Hospital in numbers" table), not text written into the page. |
| 4.7 | Persona routing | = WEB-IA-3 | Missing → Implemented | — |
| 4.8.1, 4.8.2 | Automated regulatory updates; real-time HIS linkages | = WEB-DYN-1, WEB-DYN-2 | Missing → Implemented | The biomedical-waste page is still static content. |
| 4.10 | Automated identity integration | Faculty and staff from HR; students, patients and alumni through the portals | Partial → Implemented | No list exists for non-PG junior residents: the official sheet is gone (`CONTENT_REVIEW.md` question 16). |
| 4.11.1, 4.11.2 | Native language content; language persistence | = WEB-MLS-1, WEB-MLS-3 | Partial → Partial / Implemented | — |
| 4.12.1–4.12.3 [portal] | Fee payment by roll number; fee segments; real-time reconciliation | `/payments/academic-fee` (roll number), hostel, workshop, conference; student portal fees | Missing → Implemented | Reconciliation is the backend's. |
| 4.13.1, 4.13.2 [portal] | Online booking by speciality, unit or consultant; EQMS queue status | = WEB-PAT-1 | Missing → Implemented | SRS marks 4.13 "Under Review" (D4). |
| 4.14.1 | Department control of news, publications and faculty | Department news, Research and Faculty sections for department roles | Partial → Implemented | — |
| 4.14.2 | Approval by designated institutional administrators | = WEB-CMS-4 (D3) | Missing → Implemented | — |
| 4.14.3 | Active Directory-linked RBAC | Role from the sign-in response | Backend | — |
| 4.15 | Creative design and aesthetic autonomy | — | Discrepancy | Conflicts with WEB-CMP-4 (D2). |
| 5.2 | MFA and RBAC; encryption | = WEB-SEC-1/2/3 | Implemented (frontend part) | — |
| 5.3 | GIGW/UX4G checklist; DPDP consent module; clinical coding | = WEB-CMP-1/3/5; display of codes | Partial / Implemented | — |

### 15. FRS information-architecture diagram (p. 8): items without a requirement ID

| Item | Status | Notes |
|---|---|---|
| Location, emergency, direct lines, feedback | Implemented | Contact page, directory, emergency numbers, `/feedback` |
| Pharmacy | Partial | Refill requests in the patient portal (WEB-PAT-4). No pharmacy information page beyond existing hospital content. |
| Fee information | Partial | Fee payment by segment exists. A published fee structure needs MGIMS content. |
| Academic calendar, prospectus, regulations | Missing | Need documents and dates from MGIMS (D10). The notice and document components can show them once supplied. |
| Patient messaging [portal] | Missing | Needs a decision on scope and response times, and an emergency disclaimer (D10). |
| Student timetable, enrolment, forums [portal] | Missing | Need EMS data and a decision on forums and moderation (D10). |

## Remaining frontend work

These need code once the decision or data above exists:

Website scope:

1. **Hindi content authoring (D6):** per-language fields in the console editors (department profile, notices, department news), for example `translations: { hi: { overview, paragraphs } }` on `PATCH /departments/:id`.
2. **FRS diagram items (D10):** academic calendar, prospectus and regulations pages, once MGIMS supplies them.
3. **Per-page link previews:** pre-render page metadata at the server (see the checklist), if MGIMS wants page-specific previews on social media.
4. **CAPTCHA**, if the backend's brute-force protection needs one on sign-in or public forms.

Portal scope (now the portal teams'): student notification preferences (§14 results and fee reminders), student timetable, enrolment and forums, and patient messaging.

## Where the code is

| Area | Files |
|---|---|
| HTTP client, errors, last-known-good cache, idempotency keys | `src/services/http.ts` |
| Portal services (each with a demo implementation in `src/mocks/`) | `src/services/patientApi.ts`, `paymentsApi.ts`, `studentApi.ts`, `admissionsApi.ts`, `engagementApi.ts`, `dynamicApi.ts` |
| Types (the JSON contract) | `src/types/portal.ts`, `src/types/index.ts` |
| Patient portal | `src/portal/patient/` |
| Student portal | `src/portal/student/` |
| Shared portal pieces (OTP entry, shell with idle sign-out, pay dues, transactions) | `src/portal/shared/` |
| Payments, admissions | `src/pages/payments/`, `src/pages/admissions/` |
| Public pages added | `PersonaPage`, `SitemapPage`, `InfoPages` (help, accessibility statement), `NotFoundPage`, `LegacyRedirectPage`, `FeedbackPage`, `NewsletterManagePage`, `AlumniPage` in `src/pages/` |
| Widgets | `src/components/dynamic/` (blood stock, regulatory updates, hospital statistics, results, department notices), `src/components/engagement/`, `src/components/content/ReadAloud.tsx` |
| Forms and UI | `src/components/forms/` (field, error summary), `src/components/ui/Modal.tsx`, `Status.tsx`, `IdleWarning.tsx`; `src/hooks/useAsync.ts`, `useIdleTimeout.ts` |
| Console governance | `src/admin/workflow.ts`, `audit.ts`, `contentChecks.ts`, `governanceApi.ts`, `access.ts`, `ApprovalsPanel.tsx`, `ChangeViews.tsx`, `MediaLibrary.tsx`, `AccessibilityReport.tsx`, `Dashboards.tsx`, `OperationsPanels.tsx`, `EngagementPanel.tsx`, `DepartmentNewsPanel.tsx` |
| Translations | `src/i18n/services/*.ts` (English, Hindi, Marathi for each new label) |
| Build scripts | `scripts/generate-sitemap.mjs`, `scripts/generate-legacy-redirects.mjs` |
