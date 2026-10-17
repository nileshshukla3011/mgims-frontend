import React from 'react';
import {
  Building2,
  History,
  User,
  Shield,
  FileText,
  FileCheck,
  Scale,
  Award,
  AlertTriangle,
  Sparkles,
  Newspaper,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { SectionedPage, SectionConfig } from '@/components/content/SectionedPage';
import { ReportList } from '@/components/content/ReportList';
// The early Kasturba Hospital signboard: the banner of History and Heritage.
import kasturbaHospitalSign from '@/assets/images/hero/heritage-3-1920.webp';
import kasturbaHospitalSignSmall from '@/assets/images/hero/heritage-3-960.webp';

const loadInstitute = () => apiService.getInstituteInfo();

const ANNUAL_REPORT_KEYS = ['55th-annual-report', '53-annual-report-copy', '53-annual-report', '52-annual-report', '51-annual-report', '50-annual-report'];
const AUDIT_KEYS = ['2023', '2021-22', '2020-21', '2019-20', '2018-19', '2017-18', '2015-16-copy', '2015-16', '2014-15', '2013-14'];

// RTI designations and committee contacts as published in the official MGIMS telephone directory
// (contact-us pages: "Public Information", "Secretary", "Dean", "Academic Section", "Medical Superintendent",
// "Hospital Administration", "Internal Complaints Committee", "Institutional Ethics Committee", "Safety, Fire and Security").
const rtiOfficers = [
  { designation: 'Appellate Authority (MGIMS and Kasturba Hospital)', officer: 'Dr BS Garg, Secretary, Kasturba Health Society', contact: '07152-284341 Ext. 203', email: 'secretary@mgims.ac.in' },
  { designation: 'Public Information Officer (MGIMS)', officer: 'Dr AK Shukla, Dean, MGIMS', contact: '07152-284341 Ext. 210', email: 'dean@mgims.ac.in' },
  { designation: 'Assistant Public Information Officer (MGIMS)', officer: 'Mrs Sangeeta Narang, Administrative Officer, MGIMS', contact: '07152-284341 Ext. 207', email: 'adminofficer@mgims.ac.in' },
  { designation: 'Public Information Officer (Kasturba Hospital)', officer: 'Dr Poonam V Shivkumar, Medical Superintendent', contact: '07152-284341 Ext. 248', email: 'ms@mgims.ac.in' },
  { designation: 'Assistant Public Information Officer (Kasturba Hospital)', officer: 'Mrs Shaily Jain-Kalantri, Administrative Officer, Kasturba Hospital', contact: '07152-284341 Ext. 204, 201', email: 'aohospital@mgims.ac.in' },
];

const RtiOfficers: React.FC = () => (
  <div className="border border-slate-200 rounded-xl overflow-hidden">
    <h3 className="bg-brand-navy text-white px-4 py-2.5 font-bold text-xs tracking-wider">Designated RTI officers</h3>
    <ul className="divide-y divide-slate-100 text-xs">
      {rtiOfficers.map((o) => (
        <li key={o.designation} className="p-3.5 space-y-1 hover:bg-slate-50">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-link text-xs">{o.designation}</span>
            <span className="text-[11px] text-slate-600 font-mono">{o.contact}</span>
          </div>
          <p className="font-semibold text-slate-900">{o.officer}</p>
          <a href={`mailto:${o.email}`} className="text-link text-[11px] font-mono hover:underline">{o.email}</a>
        </li>
      ))}
    </ul>
  </div>
);

const committeeContacts = [
  { title: 'Internal Complaints Committee (ICC)', person: 'Dr Jyoti Jain', role: 'Presiding Officer', email: 'icc@mgims.ac.in' },
  { title: 'Institutional Ethics Committee (IEC)', person: 'Dr Devesh Gosavi', role: 'Member Secretary', email: 'gosavi@mgims.ac.in' },
  { title: 'Safety, fire and security', person: 'Mr Vilas Shende', role: 'Security Officer', contact: '07152-284341 Ext. 370' },
];

const ComplianceContacts: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
    {committeeContacts.map((c) => (
      <div key={c.title} className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50">
        <h3 className="font-bold text-sm text-ink">{c.title}</h3>
        <p><strong>{c.role}:</strong> {c.person}</p>
        {c.email && <a href={`mailto:${c.email}`} className="text-link font-mono hover:underline">{c.email}</a>}
        {c.contact && <p className="font-mono text-slate-700">{c.contact}</p>}
      </div>
    ))}
  </div>
);

const sections: SectionConfig[] = [
  { id: 'overview', title: 'Vision & aims', icon: Award, heading: 'Vision, mission and objectives', pages: ['aims-and-objectives'] },
  {
    id: 'history',
    title: 'History & heritage',
    icon: History,
    heading: 'History and heritage',
    pages: ['history-and-heritage', 'growth', 'life-at-sevagram'],
    pageOptions: {
      'history-and-heritage': { layout: 'timeline', cover: { large: kasturbaHospitalSign, small: kasturbaHospitalSignSmall, width: 1920 } },
      growth: { layout: 'updates' },
    },
  },
  { id: 'founder', title: 'Our Founder (Dr. Sushila Nayar)', icon: User, heading: 'Our founder', pages: ['our-founder'] },
  { id: 'logo', title: 'The MGIMS logo', icon: Shield, heading: 'The Logo', pages: ['the-logo'] },
  { id: 'why-mgims', title: 'Why MGIMS & Gandhian principles', icon: Sparkles, heading: 'Why MGIMS', pages: ['why-mgims', 'unique-features', 'gandhian-principles', 'no-sponsorships'] },
  { id: 'governance', title: 'Governance & administration', icon: Building2, heading: 'Governance and administration', pages: ['kasturba-health-society', 'governing-council', 'board-of-management', 'organisational-structure'] },
  {
    id: 'annual-reports',
    title: 'Annual reports archive',
    icon: FileText,
    heading: 'Annual reports',
    pages: ['annual-report'],
    after: (pages) => <ReportList pages={pages} keys={ANNUAL_REPORT_KEYS} label="Annual reports" />,
  },
  {
    id: 'audit-statements',
    title: 'Audited financial statements',
    icon: FileCheck,
    heading: 'Audited statements',
    pages: ['audit-statements'],
    after: (pages) => <ReportList pages={pages} keys={AUDIT_KEYS} label="Audited statements by financial year" />,
  },
  { id: 'pbcr', title: 'Cancer registry (PBCR)', icon: FileText, heading: 'Population Based Cancer Registry (PBCR)', pages: ['population-based-cancer-registry-pbcr'] },
  { id: 'citizen-charter', title: 'Citizen Charter', icon: Scale, heading: 'Citizen Charter', pages: ['citizen-charter'] },
  { id: 'rti', title: 'Right to Information (RTI)', icon: FileText, heading: 'Right to Information', pages: ['right-to-information', 'contact-us'], after: <RtiOfficers /> },
  {
    id: 'compliance',
    title: 'Statutory compliance & ICC',
    icon: AlertTriangle,
    heading: 'Statutory compliance & committees',
    pages: ['women-s-internal-complaints-committee', 'human-rights-complaints', 'fire-compliance', 'foreign-contributions', 'employe-s-information', 'mci-requirements'],
    after: <ComplianceContacts />,
  },
  { id: 'press-clippings', title: 'Press clippings', icon: Newspaper, heading: 'Press clippings', pages: ['press-clippings'] },
];

// Search links and old bookmarks use the scraped site's slugs.
const aliases: Record<string, string> = {
  'aims-and-objectives': 'overview',
  'history-and-heritage': 'history',
  'life-at-sevagram': 'history',
  'growth': 'history',
  'our-founder': 'founder',
  'the-logo': 'logo',
  'unique-features': 'why-mgims',
  'gandhian-principles': 'why-mgims',
  'no-sponsorships': 'why-mgims',
  'kasturba-health-society': 'governance',
  'governing-council': 'governance',
  'board-of-management': 'governance',
  'organisational-structure': 'governance',
  'annual-report': 'annual-reports',
  'population-based-cancer-registry-pbcr': 'pbcr',
  'right-to-information': 'rti',
  'women-s-internal-complaints-committee': 'compliance',
  'fire-compliance': 'compliance',
  'foreign-contributions': 'compliance',
  'human-rights-complaints': 'compliance',
  'employe-s-information': 'compliance',
  'mci-requirements': 'compliance',
  ...Object.fromEntries(ANNUAL_REPORT_KEYS.map((k) => [k, 'annual-reports'])),
  ...Object.fromEntries(AUDIT_KEYS.map((k) => [k, 'audit-statements'])),
};

export const AboutPage: React.FC = () => (
  <SectionedPage
    eyebrow="Institute & Governance"
    title="About Mahatma Gandhi Institute of Medical Sciences"
    description="Rooted in Sevagram, guided by Gandhian ethics, and committed to rural health since 1969."
    basePath="/about-us"
    navLabel="About MGIMS"
    sections={sections}
    loadPages={loadInstitute}
    aliases={aliases}
  />
);
