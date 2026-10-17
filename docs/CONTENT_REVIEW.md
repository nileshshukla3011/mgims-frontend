# Content awaiting MGIMS confirmation

The portal shows text from the official MGIMS website (as collected on 6 October 2026). A few items were written by hand in an earlier design and could not be found on the official website. They are **kept in the code but hidden on the live site** until MGIMS confirms them.

**To review them:** build or run the site with `VITE_SHOW_REVIEW_NOTES=true`. Each item then appears with an amber "For MGIMS review" banner.

**After review, for each item:**
- **Confirmed:** remove its `<ReviewContent>` wrapper (or the `reviewOnly: true` flag) so it shows on the live site.
- **Corrected:** edit the text, then remove the wrapper.
- **Rejected:** delete the item.

## 1. Hidden until confirmed

| # | Page | What it is | Where in the code | Question for MGIMS |
|---|---|---|---|---|
| 1 | Academics › Academics overview | Two introductory paragraphs about the programmes | `src/pages/AcademicsPage.tsx` (`OverviewNote`) | Confirm or replace. The page currently shows links to each academic section. |
| 2 | Academics › Ph.D. (whole section) | "Recognised Ph.D. research centres under MUHS: Biochemistry, Microbiology, Community Medicine and Pathology" | `src/pages/AcademicsPage.tsx` (`PhdNote`) | Which departments are recognised Ph.D. centres? The official site only says MGIMS "enrols PhD students across a range of disciplines". |
| 3 | Research › JBTDRC (whole section) | One-line description of the Jamnalal Bajaj Tropical Disease Research Centre | `src/pages/ResearchPage.tsx` (`JbtdrcNote`) | The official JBTDRC page returned "page not found". Please supply the centre's description. |
| 4 | Community › Other initiatives (whole section) | Card on village self-help groups | `src/pages/CommunityPage.tsx` (`OtherInitiatives`) | Self-help groups are already covered by the official Community Activities page. Delete this section, or supply other initiatives. |
| 5 | Every department › "Clinical & diagnostic services" and "Curriculum & training" tabs | The same generic text on all 24 departments (OPD hours, residency format) | `src/pages/DepartmentDetailPage.tsx` | These tabs describe no department in particular, and don't fit pre-clinical departments. Supply text per department, or delete the tabs. |

## 2. Checked against the official website and corrected

These items are now shown on the live site.

| Page | Correction | Source |
|---|---|---|
| About › Right to Information | Officer names and extensions confirmed. Two emails were wrong: the Assistant PIO for MGIMS is `adminofficer@mgims.ac.in` (not `ao@`), and for the hospital it is `aohospital@mgims.ac.in` (not `hospitaladmin@`). The Secretary, Dr BS Garg, is now named as Appellate Authority. | Official telephone directory |
| About › Statutory compliance | The ICC, IEC and safety contacts were confirmed. The IEC email is `gosavi@mgims.ac.in` (not `iec@`). The safety contact's title is "Security Officer". An unverified job title and generic descriptions were removed. | Official telephone directory; Ethics Committee page |
| Research › Dr PRJ Gangadharam Award | The hand-typed winners list had wrong years: Madhukar Pai is 2023 (not 2024), Vijay K Arora 2025 (not 2023), Kamal K Chopra 2019 (not 2021). It is replaced by the 11 official award notices, 2015–2026. | Official news notices |
| Academics › MBBS | The ROME camp is a 15-day camp at the start of the final year; the earlier text said students stay at a primary health centre during clinical postings. Adopted-village wording aligned with the official text. | Why MGIMS; Community Based Medical Education |
| Academics › Admissions | Kept: selection through NEET, and the Ext. 207 contact. Removed: MCC and State CET Cell details, which the official site does not mention. | Why MGIMS; telephone directory |
| Hospital › Hospital charges | The official page embeds its tariff from a published Google Sheet, which the page scrape could not capture. The sheet is now read directly: 2,094 items (Investigation, Bed, Anaesthesia and Diet charges, with Insured, General and Private rates), searchable. The 26-row rate table written for the earlier design was removed. | The sheet embedded in the Hospital Charges page |
| Research › Theses | Every thesis was shown under the **next** student's name and guide: the "Student; Guide" lines sit outside the page's paragraphs and the first one was lost, shifting all the others. Now each thesis has its own student and guide. The section lists all theses of 2017–2021 by year and department (226); the Thesis page only had the 2020 batch, without its year, and the other years were on the Student Research page. | Thesis and Student Research pages |
| Research › Paper presentations | The same shift: each description appeared under the next presenter's name. Fixed; listed by department. | Paper Presentations page |
| Research › Publications and Funded research | The year and department headings had been dropped, leaving one long list. Restored: 790 publications and 190 funded projects, by year and department, with investigators and funding details. | Publications and Funded Research pages |
| Research › Student research | Restructured by academic year and programme (studentships, grants, travel grants, award sessions, publications), with each year's committee and award results. A garbled line copied from the annual report PDF ("A nn uD a lat Ra er pS oS r, tTure P, Raut AV") is restored to "Datar SS, Ture P, Raut AV", as the same paper is listed in the 2020–21 block. | Student Research page |
| Research › Overview and In-house publications | The overview shows the official "Research at MGIMS" text (it was under Publications), replacing a hand-written paragraph. In-house publications now name the publication next to each editor (Journal of MGIMS, Annual Report, Sushruta); before, only "Editor: …" lines showed. | Research at MGIMS; In-house Publication pages |
| Academics › Teaching & non-teaching staff | The official staff pages embed their lists from published Google Sheets, which the page scrape could not capture; the section only linked to them. The sheets are now read directly: 132 teaching staff by department (with joining and last-promotion dates, and 22 visiting faculty), 881 non-teaching staff and 67 senior residents, searchable and filterable. Caste, gender and employee numbers in the official non-teaching list are not shown (question 17). Spacing in a few names and designations was tidied ("Dr. J.E .Waghmare" → "Dr. J.E. Waghmare", "Director -Professor" → "Director-Professor"). | The sheets embedded in the Teaching staff, Non-teaching staff and Senior residents pages |
| Home page | Nagpur airport is 70 km away (was 75). "Ayushman Bharat / PM-JAY … zero out-of-pocket costs" is replaced by the official wording ("MJPJAY and other schemes as per eligibility"). The MCH wing is described as the official 100-bed RMNCH+A wing. Card texts no longer promise content the pages don't have. | Getting Here; Citizen Charter; MCH Wing page |

## 3. Open questions

1. **Website policies:** Privacy Policy, Terms & Conditions, Disclaimer, Hyperlinking Policy, Copyright Policy, FAQs, and the GIGW policies: Content Contribution, Moderation & Approval; Content Archival; Content Review; Website Monitoring; Contingency Management; Website Security. These 12 pages say the official text has not been published yet. MGIMS needs to supply the text; the footer links to these pages, as UX4G and GIGW require.
2. **Health insurance:** the Citizen Charter lists "MJPJAY, MPJAY, BPL". Is "MPJAY" meant to be PM-JAY (Ayushman Bharat)? If Kasturba Hospital is empanelled under PM-JAY, say so and the portal can mention it.
3. **Tender and application attachments:** the original notices link to tender documents and application forms, but those links were not captured. 160 notices currently link back to the original notice on mgims.ac.in for their attachments. The backend should store the files, as `doc_links`.
4. **Department pages without content:** Games and Sports, and Neurosurgery, have no text on the official website (only photos). Please supply a short description of each.
5. **Department contact emails:** on the Biochemistry, Orthopaedics, Pathology and Surgery pages, a phone number is shown without its email. The original email was hidden by the old site and could not be matched to a person with certainty.
6. **Number of departments:** the portal lists the 24 departments found on the official website. Confirm none are missing.
7. **"Last updated" date** in the footer (06 October 2026) is the "Last Modified" date the official pages show. It now comes through the API (`GET /site-info`), so the backend can supply the real date.
8. **View counts** on notices are the counts at collection time. Decide whether the new site keeps counting.
9. **Photos** load directly from mgims.ac.in. Before launch, copy them to the new hosting, and confirm each photo may be reused. The request to MGIMS is in [`photo-requirements.xlsx`](photo-requirements.xlsx): the logo file, a photo of each of the 97 faculty members (51 have one on the current website), permission for the 1,173 photos the new pages show (by page), and one optional photo for link previews.
10. **Hindi and Marathi:** menus and labels are translated; page content is English only. The labels of the newer screens (about 800 Hindi and Marathi pairs in `src/i18n/services/`) were translated during development and need review by a native speaker.
11. **Theses listed under two or three years:** the official lists repeat 18 theses in more than one year, sometimes with a different student, so the portal shows them as published. Examples:
    - Medicine: Agrawal B, Khan S, Dhake V, Thokal D and Soni P are under 2018 and 2020.
    - Anaesthesiology: Kathane N, Jha N, Katrale S and Rathi S are under 2019 and 2020.
    - Psychiatry: the substance-abuse thesis is under Ahmed R (2019), Ahmed (2020) and Reshamwala A (2021).
    - Community Medicine: the same title is under Ture P (2018) and Jha A (2019).

    Please give the correct year (and student) for each.
12. **Years of two student research lists:** the official page does not date two of its five yearly blocks. They are shown as 2021–22 and 2018–19, dated from the events and papers they mention. With review notes on, they carry a note.
13. **Student research without a department:** 38 entries (mostly student publications, which name no guide) have no department, so only the super admin can manage them. Assign a department if department admins should manage them.
14. **Two cancer registry projects** (Pathology, 2020–21 and 2021–22) print "Anshu 4" and "Anshu 2" after the investigators. The numbers may be funds in lakhs or footnotes, so they were left out. Please confirm.
15. **Bed and diet charges use the tariff's internal short names** ("Arogyaac", "Medicu", "Hcd", "Sp D"). They are shown as published. Please supply the names patients should see (for example, is "Arogyaac" an air-conditioned room at Arogyadham?).
16. **Non-PG junior residents:** the sheet this official page embeds is no longer published (Google answers "410 Gone"), so the official page shows an error. Supply the current list, or remove the page; the portal's old link opens the staff lists.
17. **Personal details in the non-teaching staff list:** the official list publishes each employee's caste, gender and employee number. The portal leaves these out (data minimisation under the DPDP Act, 2023; FRS WEB-SEC-6). Confirm, and consider removing them from the published sheet too.
18. **Visiting faculty:** the 22 visiting faculty are listed with a speciality, not a department. 11 of them have specialities that are not MGIMS departments ("Cardiology", "Medicine Cardiac", "Paediatric Surgery", "Surgery/ENT", "Neuroradiologist & Interventional Radiologist", "Anaesthesia, DSNH", "Orthopaedics, DSNH"), so only the super admin can manage them. What does "DSNH" stand for, and should any of them belong to a department? Two names in the sheet carry a stray word ("Dr. P.Choksi, Visiting", "Dr. Ajit Phadake Orthopaedics"); the portal shows "Dr. P. Choksi" and "Dr. Ajit Phadake".
19. **Staff of hospital units:** most non-teaching staff work in units that are not departments (Matron Office 687, Medical Store 25, Melghat 18, …), so only the super admin manages them. Unit names are shown as published; what does "RTH" (9 people) stand for? The teaching staff list has no "updated on" date, unlike the other two lists.
20. **Persona pages** (For patients, students, faculty and staff, visitors, regulators): the tasks and links on each were chosen during development (`src/config/personas.ts`). Please confirm or change them.
21. **Help and accessibility statement:** both pages were written during development and describe how the website works. Please review them; the accessibility statement should name who in MGIMS handles accessibility feedback.
22. **NACO programme data** (FRS WEB-DYN-4): which data should the website show, and from which source? The blood bank's stock (e-RaktKosh) is ready for when the feed is connected.
23. **Academic calendar, prospectus, regulations and fee information** (FRS information architecture): please supply the documents and dates; the website has no pages for them yet.
