/** A table captured from the official website: optional caption and header row, then the rows of cells. */
export interface ScrapedTable {
  caption?: string | null;
  headers?: string[] | null;
  rows?: string[][];
}

export type Language = 'en' | 'hi' | 'mr';

export type FontSize = 'sm' | 'base' | 'lg' | 'xl';

export type Theme = 'light' | 'dark' | 'contrast';

export interface AccessibilitySettings {
  fontSize: FontSize;
  theme: Theme;
  language: Language;
}

export interface ListItem {
  type: 'ordered' | 'unordered' | string;
  items: string[];
}

export interface ImageItem {
  url: string;
  alt?: string | null;
  title?: string | null;
}

export interface HeadingItem {
  level: number;
  text: string;
}

export interface Department {
  id: string;
  name: string;
  category: 'Pre-clinical' | 'Para-clinical' | 'Clinical' | 'Super-speciality' | 'Support' | string;
  title: string;
  overview: string;
  text: string;
  paragraphs: string[];
  headings: HeadingItem[];
  images: ImageItem[];
  tables: ScrapedTable[];
  lists?: ListItem[];
  faculty: string[];
  url: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  slug: string;
  department: string;
  designation: string;
  bio: string;
  text: string;
  paragraphs: string[];
  headings: HeadingItem[];
  images: ImageItem[];
  tables?: ScrapedTable[];
  lists?: ListItem[];
  url: string;
  phones: string[];
  emails: string[];
}

export interface NoticeItem {
  id: number;
  title: string;
  category: 'Tender' | 'Recruitment' | 'Eligible/Ineligible List' | 'Awards & Honors' | 'CME & Academic Events' | 'News & Events' | string;
  date: string;
  hits: string;
  excerpt: string;
  text: string;
  paragraphs: string[];
  headings: HeadingItem[];
  images: ImageItem[];
  tables?: ScrapedTable[];
  lists?: ListItem[];
  url: string;
  doc_links: { url: string; text?: string }[];
  /** Set when the notice refers to attachments (tender or application forms) that are only on the original notice page. */
  attachments_url?: string | null;
  is_active: boolean;
  /** Departments the notice is shown for (WEB-DYN-3). */
  departmentIds?: string[];
  /** Scheduled publication and automatic expiry (WEB-CMS-6), ISO date-times; public lists leave out notices outside this window. */
  publish_at?: string;
  expires_at?: string;
}

export interface ContactCard {
  title: string;
  role: string;
  person: string;
  raw_details: string;
  lines: string[];
  url: string;
  phones: string[];
  emails: string[];
  tables?: ScrapedTable[];
}

export interface GenericPageContent {
  title: string;
  slug: string;
  text: string;
  paragraphs: string[];
  headings: HeadingItem[];
  tables: ScrapedTable[];
  images: ImageItem[];
  lists?: ListItem[];
  url: string;
}

/** Notice fields available in list views (the article body is loaded per notice). */
export type NoticeSummary = Pick<
  NoticeItem,
  'id' | 'title' | 'category' | 'date' | 'hits' | 'excerpt' | 'url' | 'is_active' | 'departmentIds' | 'publish_at' | 'expires_at'
>;

export interface InquiryInput {
  name: string;
  email: string;
  phone: string;
  category: string;
  message: string;
}

export interface InquiryRecord extends InquiryInput {
  ticketId: string;
  status: 'Received' | 'In Progress' | 'Resolved';
  createdAt: string;
  updates: { at: string; note: string }[];
}

export interface FeedbackInput {
  page: string;
  helpful: boolean;
  comment?: string;
}

/** A distinguished alumnus, as listed on the official alumni page. */
export interface DistinguishedAlumnus {
  /** Address of their profile page: /alumni/<slug>. */
  slug: string;
  name: string;
  /** Current or best-known position. */
  role: string;
  photo?: string;
}

/** A distinguished alumnus with the text of their profile page. */
export interface DistinguishedAlumnusProfile extends DistinguishedAlumnus {
  paragraphs: string[];
}

/** A labelled count, e.g. alumni in one country or one speciality. */
export interface CountItem {
  label: string;
  count: number;
}

/** The figures of the official alumni page, for the alumni page's overview, careers and "around the world" parts. */
export interface AlumniOverview {
  /** The page the figures come from. */
  source: string;
  /** Opening paragraph. */
  lede: string;
  enrolled: { total: number; men: number; women: number };
  graduated: { total: number; men: number; women: number };
  firstBatch: number;
  /** Students of MGIMS at the time of the figures. */
  studying: CountItem[];
  /** Where the classes `fromClass` to `toClass` did their post-graduation; `notPursued` is approximate. */
  postgraduation: { fromClass: number; toClass: number; atMgims: number; elsewhere: number; notPursued: number };
  /** Specialities, most alumni first. */
  specialties: CountItem[];
  /** Careers outside clinical medicine. */
  otherPaths: string[];
  countries: CountItem[];
  /** About alumni in countries not listed. */
  countriesNote?: string;
  /** Indian states with the most alumni. */
  states: CountItem[];
  /** Closing paragraph. */
  closing: string;
}

export type ResearchKind = 'thesis' | 'student-research' | 'publication' | 'funded-project' | 'presentation';

/** One entry of the Research section: a thesis, an undergraduate project, a publication, a funded project or a presentation. */
export interface ResearchRecord {
  id: string;
  kind: ResearchKind;
  /** '2021' for theses; academic year '2021-22' for the other kinds; presentations have none. */
  year?: string;
  /** Owning department: a department admin manages only records of their own department. */
  departmentId?: string;
  /** Department name as shown (also for units without a department id). */
  department?: string;
  /** Group within the kind, e.g. the undergraduate research programme. */
  category?: string;
  /** Student(s), authors, investigators or presenters. */
  people?: string;
  /** Guide(s) of a thesis or a student project. */
  guide?: string;
  /** Title, or the description of a presentation. */
  title: string;
  /** Degree (PhD), journal citation, venue, award or funding details; one item per line. */
  details?: string;
}

/** Undergraduate research: the scheme's description, and per academic year the committee and notes. */
export interface StudentResearchInfo {
  intro: string[];
  scheme: string[];
  years: { year: string; source?: string | null; inferred: boolean; committee: string[]; notes: string[] }[];
}

export type StaffGroupId = 'teaching' | 'non-teaching' | 'senior-resident';

/** One employee in the official staff lists. Caste, gender and employee numbers are not kept (DPDP data minimisation). */
export interface StaffRecord {
  id: string;
  group: StaffGroupId;
  name: string;
  designation?: string;
  /** Academic department: a department admin manages only their own department's staff. */
  departmentId?: string;
  /** Department, or hospital unit such as "Matron Office", as shown. */
  department?: string;
  /** Teaching staff: joining date at MGIMS and date of last promotion, as published (dd/mm/yyyy). */
  joined?: string;
  lastPromotion?: string;
  /** Non-teaching staff: Regular / Contractual / Adhoc, and III Class / IV Class. */
  status?: string;
  staffClass?: string;
}

export interface StaffDirectory {
  groups: { id: StaffGroupId; title: string; updated?: string; source: string; count: number }[];
  records: StaffRecord[];
}

/** Site-wide facts supplied by the backend. */
export interface SiteInfo {
  /** Date the content was last updated, e.g. "06 October 2026". */
  lastUpdated: string;
}

/** The official hospital tariff: sections (Investigation, Bed, Anaesthesia, Diet charges) and their items, in rupees. */
export interface HospitalCharges {
  /** The official page that publishes the tariff. */
  source: string;
  sections: { title: string; columns: string[] }[];
  items: { id: string; section: string; name: string; insured?: number; general?: number; private?: number }[];
}

/**
 * The three tiers of FRS §6: `super_admin` manages the whole portal and approves any department's changes (the Dean's
 * office or IT head, SRS 4.14.2); `department_approver` (a head of department or nominated faculty) edits and approves
 * changes for `departmentId` only; `department_admin` (a departmental contributor) edits `departmentId` and submits
 * changes for approval.
 */
export type AdminRole = 'super_admin' | 'department_approver' | 'department_admin';

export interface AdminUser {
  username: string;
  name: string;
  role: AdminRole;
  /** Department id (e.g. `medicine`); set only for a department admin. */
  departmentId?: string;
}

/** Department fields a department admin may edit. */
export type DepartmentUpdate = Partial<Pick<Department, 'overview' | 'paragraphs'>>;

/** Faculty fields an admin may edit. */
export type FacultyUpdate = Partial<Pick<FacultyMember, 'designation' | 'phones' | 'emails' | 'bio'>>;

export interface SearchResults {
  departments: { id: string; name: string; overview: string }[];
  faculty: { id: string; slug: string; name: string; department: string; designation: string }[];
  notices: { id: number; title: string; category: string; date: string }[];
  pages: { title: string; url: string; snippet: string; category: string }[];
  /** Theses, publications, funded projects, student research and presentations (WEB-IA-5). */
  research?: { id: string; kind: ResearchKind; title: string; people?: string; year?: string; department?: string; url: string }[];
}
